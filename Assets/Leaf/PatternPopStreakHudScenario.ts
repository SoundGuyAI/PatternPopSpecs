import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {
  collectTextUnder,
  expect,
  findSceneObjectByName,
  parseStreakFromHud,
  waitForPatternPopReady,
} from "./PatternPopLeafHelpers"

/**
 * Criterion 4: Current + best streak readable next to the pads (not a face HUD).
 */
@component
export class PatternPopStreakHudScenario extends Scenario {
  async run(): Promise<void> {
    await waitForPatternPopReady(2000)

    const hud = findSceneObjectByName("StreakHUD")
    expect(!!hud).toBe(true)
    expect(hud.enabled).toBe(true)

    const parent = hud.getParent()
    expect(!!parent).toBe(true)
    expect(parent.name).toBe("UI")

    const pos = hud.getTransform().getWorldPosition()
    // Authored beside pads: ~(48, -35, -100) — table-side, not face-locked origin
    expect(Math.abs(pos.x - 48) < 20).toBe(true)
    expect(Math.abs(pos.y - -35) < 25).toBe(true)
    expect(Math.abs(pos.z - -100) < 25).toBe(true)

    // Must not sit at camera / face HUD origin
    const distFromOrigin = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z)
    expect(distFromOrigin).toBeGreaterThan(50)

    const texts = collectTextUnder(hud)
    const joined = texts.join(" | ")
    expect(joined.includes("Current")).toBe(true)
    expect(joined.includes("Best")).toBe(true)

    const streak = parseStreakFromHud()
    expect(streak.current >= 0).toBe(true)
    expect(streak.best >= 0).toBe(true)
  }
}
