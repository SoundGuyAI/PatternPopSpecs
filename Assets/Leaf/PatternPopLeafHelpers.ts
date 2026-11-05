/**
 * Shared helpers for Pattern Pop LEAF scenarios.
 * Additive test utilities only — does not modify game scripts.
 */
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {
  findSceneObjectByName,
  findSceneObjectsByName,
  sleep,
} from "Leaf.lspkg/Utils/common/Utils"
import {PatternPopMain} from "../Scripts/PatternPopMain"

/** Default place point for LEAF when World Query depth is unavailable in preview. */
const LEAF_PLACE_POS = new vec3(0, -62, -110)

export function forcePlacePadsForTests(center: vec3 = LEAF_PLACE_POS): void {
  const root = findSceneObjectByName("PatternPop")
  if (!root) {
    throw new Error("PatternPop root not found")
  }
  const main = root.getComponent(PatternPopMain.getTypeName()) as PatternPopMain
  if (!main) {
    throw new Error("PatternPopMain component not found on PatternPop")
  }
  if (!main.isPlaced()) {
    main.placeAtWorldPosition(center)
    print(
      `[LEAF] force-placed pads at ${center.x}, ${center.y}, ${center.z} (World Query skipped in test)`,
    )
  }
}

export async function waitForPatternPopReady(ms: number = 2500): Promise<void> {
  const deadline = Date.now() + Math.max(ms, 5000)
  while (Date.now() < deadline) {
    const pad0 = findSceneObjectByName("Pad_0")
    if (pad0) {
      forcePlacePadsForTests()
      const streak = findSceneObjectByName("StreakHUD")
      if (streak && streak.enabled) {
        // Let startFreshRun schedule the first sequence
        await sleep(500)
        return
      }
    }
    await sleep(50)
  }
  throw new Error("Pattern Pop pads / StreakHUD did not appear in time")
}

/** Wait until the opening sequence should have finished (AwaitingInput). */
export async function waitForAwaitingInput(): Promise<void> {
  // Boot 0.4s + first step 0.15 + stepInterval 0.6 + postSequencePause 0.4 ≈ 1.55s
  // Poll until no pad is lit for a stretch (sequence finished and lights timed out).
  let quietMs = 0
  const needQuiet = 500
  const deadline = Date.now() + 8000
  while (Date.now() < deadline) {
    if (anyPadLit()) {
      quietMs = 0
    } else {
      quietMs += 100
      if (quietMs >= needQuiet) {
        return
      }
    }
    await sleep(100)
  }
  // Fall through — still usable; input may already be open with dim pads.
}

export function getPadObject(padId: number): SceneObject {
  const pad = findSceneObjectByName(`Pad_${padId}`)
  if (!pad) {
    throw new Error(`Pad_${padId} not found`)
  }
  return pad
}

export function getPadBaseColor(padId: number): vec4 | null {
  const visual = findSceneObjectByName(`PadVisual_${padId}`)
  if (!visual) {
    return null
  }
  const rmv = findRenderMeshVisual(visual)
  if (!rmv) {
    return null
  }
  const mat =
    rmv.mainMaterial ||
    (rmv.getMaterialsCount && rmv.getMaterialsCount() > 0
      ? rmv.getMaterial(0)
      : null)
  if (!mat || !mat.mainPass) {
    return null
  }
  return mat.mainPass.baseColor as vec4
}

function findRenderMeshVisual(root: SceneObject): RenderMeshVisual | null {
  const stack: SceneObject[] = [root]
  while (stack.length > 0) {
    const so = stack.pop() as SceneObject
    const rmv = so.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    if (rmv) {
      return rmv
    }
    const n = so.getChildrenCount()
    for (let i = 0; i < n; i++) {
      stack.push(so.getChild(i))
    }
  }
  return null
}

export function colorSum(c: vec4 | null): number {
  if (!c) {
    return -1
  }
  return c.r + c.g + c.b
}

export function capturePadColorSums(): number[] {
  return [0, 1, 2, 3].map((i) => colorSum(getPadBaseColor(i)))
}

/** True if any pad's baseColor sum changed by more than epsilon vs baseline. */
export function anyPadColorChanged(baseline: number[], epsilon: number = 0.15): boolean {
  const now = capturePadColorSums()
  for (let i = 0; i < 4; i++) {
    if (baseline[i] < 0 || now[i] < 0) {
      continue
    }
    if (Math.abs(now[i] - baseline[i]) > epsilon) {
      return true
    }
  }
  return false
}

export function findChangedPadId(baseline: number[], epsilon: number = 0.15): number | null {
  const now = capturePadColorSums()
  let best: number | null = null
  let bestDelta = epsilon
  for (let i = 0; i < 4; i++) {
    if (baseline[i] < 0 || now[i] < 0) {
      continue
    }
    const d = Math.abs(now[i] - baseline[i])
    if (d > bestDelta) {
      bestDelta = d
      best = i
    }
  }
  return best
}

export function isPadLit(padId: number): boolean {
  // Heuristic vs authored DIM sums (~0.7–1.13) vs LIT (~1.5–2.3)
  const c = getPadBaseColor(padId)
  return colorSum(c) > 1.35
}

export function anyPadLit(): boolean {
  for (let i = 0; i < 4; i++) {
    if (isPadLit(i)) {
      return true
    }
  }
  return false
}

export function findLitPadId(): number | null {
  for (let i = 0; i < 4; i++) {
    if (isPadLit(i)) {
      return i
    }
  }
  return null
}

export function collectTextUnder(root: SceneObject): string[] {
  const out: string[] = []
  const stack: SceneObject[] = [root]
  while (stack.length > 0) {
    const so = stack.pop() as SceneObject
    const t = so.getComponent("Component.Text") as Text
    if (t && t.text) {
      out.push(t.text)
    }
    const n = so.getChildrenCount()
    for (let i = 0; i < n; i++) {
      stack.push(so.getChild(i))
    }
  }
  return out
}

export function parseStreakFromHud(): {current: number; best: number} {
  const hud = findSceneObjectByName("StreakHUD")
  if (!hud) {
    throw new Error("StreakHUD not found")
  }
  const texts = collectTextUnder(hud)
  let current = 0
  let best = 0
  let foundCurrent = false
  let foundBest = false
  for (const s of texts) {
    const cur = s.match(/Current\s+(\d+)/)
    if (cur) {
      current = parseInt(cur[1], 10)
      foundCurrent = true
    }
    const bst = s.match(/Best\s+(\d+)/)
    if (bst) {
      best = parseInt(bst[1], 10)
      foundBest = true
    }
  }
  expect(foundCurrent).toBe(true)
  expect(foundBest).toBe(true)
  return {current, best}
}

export function padTonePlaying(padId: number): boolean {
  const tone = findSceneObjectByName(`PadTone_${padId}`)
  if (!tone) {
    return false
  }
  const audio = tone.getComponent("Component.AudioComponent") as AudioComponent
  return !!(audio && audio.isPlaying())
}

export function anyPadTonePlaying(): boolean {
  for (let i = 0; i < 4; i++) {
    if (padTonePlaying(i)) {
      return true
    }
  }
  return false
}

export function assertPadsExist(): void {
  for (let i = 0; i < 4; i++) {
    expect(!!findSceneObjectByName(`Pad_${i}`)).toBe(true)
    expect(!!findSceneObjectByName(`PadVisual_${i}`)).toBe(true)
  }
}

export function assertPadTonesExist(): void {
  for (let i = 0; i < 4; i++) {
    const tone = findSceneObjectByName(`PadTone_${i}`)
    expect(!!tone).toBe(true)
    const audio = tone.getComponent("Component.AudioComponent") as AudioComponent
    expect(!!audio).toBe(true)
    expect(!!audio.audioTrack).toBe(true)
  }
}

export function assertPadsForm2x2(): void {
  const positions: vec3[] = []
  for (let i = 0; i < 4; i++) {
    positions.push(getPadObject(i).getTransform().getWorldPosition())
  }
  const xs = positions.map((p) => p.x).sort((a, b) => a - b)
  const zs = positions.map((p) => p.z).sort((a, b) => a - b)
  // Two distinct X and two distinct Z clusters (~28cm spacing)
  expect(xs[1] - xs[0] < 8).toBe(true)
  expect(xs[3] - xs[2] < 8).toBe(true)
  expect(xs[2] - xs[1] > 15).toBe(true)
  expect(zs[1] - zs[0] < 8).toBe(true)
  expect(zs[3] - zs[2] < 8).toBe(true)
  expect(zs[2] - zs[1] > 15).toBe(true)
}

export function getPadWorldSizeApprox(padId: number): vec3 {
  const pad = getPadObject(padId)
  const col = pad.getComponent("Physics.ColliderComponent") as ColliderComponent
  if (col && col.shape) {
    const box = col.shape as BoxShape
    if (box && box.size) {
      return box.size
    }
  }
  return pad.getTransform().getWorldScale()
}

export function findFloatScore(): SceneObject | null {
  return findSceneObjectByName("FloatScore")
}

export {findSceneObjectByName, findSceneObjectsByName, sleep, expect}
