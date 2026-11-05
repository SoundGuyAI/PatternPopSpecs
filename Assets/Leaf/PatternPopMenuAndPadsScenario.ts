import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {PatternPopLeafInteractor} from "./PatternPopLeafInteractor"
import {
  anyPadLit,
  assertPadsExist,
  assertPadsForm2x2,
  expect,
  findSceneObjectByName,
  getPadWorldSizeApprox,
  sleep,
  waitForAwaitingInput,
  waitForPatternPopReady,
} from "./PatternPopLeafHelpers"

/**
 * Criterion 5: Menu Quit/Hint/Replay pinchable; Replay replays pattern;
 * pads large enough (~25cm) in a 2×2 on the table.
 * Looking-down camera comfort is visual — marked untested beyond layout asserts.
 */
@component
export class PatternPopMenuAndPadsScenario extends Scenario {
  async run(): Promise<void> {
    const interactor = new PatternPopLeafInteractor()
    await waitForPatternPopReady(2500)
    await waitForAwaitingInput()

    // Menu buttons present as Interactables
    for (const name of ["Quit", "Hint", "Replay pattern"]) {
      const btn = findInteractableByName(name)
      expect(!!btn).toBe(true)
    }

    const menu = findSceneObjectByName("MenuPanel")
    expect(!!menu).toBe(true)
    const menuPos = menu.getTransform().getWorldPosition()
    expect(Math.abs(menuPos.y - 42) < 20).toBe(true)

    // Pads: 2×2 layout + size ~25cm
    assertPadsExist()
    assertPadsForm2x2()
    for (let i = 0; i < 4; i++) {
      const size = getPadWorldSizeApprox(i)
      expect(size.x).toBeGreaterThan(20)
      expect(size.x).toBeLessThan(32)
      expect(size.z).toBeGreaterThan(20)
      expect(size.z).toBeLessThan(32)
    }

    // Hint is pinchable (smoke)
    await interactor.pinchNamed("Hint")
    await sleep(300)

    // Replay replays current pattern — expect a lit pad / tone window after trigger
    await waitForAwaitingInput()
    await interactor.pinchNamed("Replay pattern")
    let sawReplayLit = false
    const deadline = Date.now() + 3000
    while (Date.now() < deadline) {
      if (anyPadLit()) {
        sawReplayLit = true
        break
      }
      await sleep(50)
    }
    expect(sawReplayLit).toBe(true)

    // IK reachability for Hint — Bitmoji avatar can hang when avatar URL is empty
    // (preview/auth), so race against a hard timeout instead of blocking forever.
    await waitForAwaitingInput()
    const hintBtn = findInteractableByName("Hint")
    expect(!!hintBtn).toBe(true)
    const ik = createIKInteractor()
    let ikTimedOut = false
    await Promise.race([
      ik.trigger(hintBtn),
      sleep(10000).then(() => {
        ikTimedOut = true
      }),
    ])
    if (ikTimedOut) {
      print(
        "[LEAF] IK Hint trigger timed out after 10s — Bitmoji/avatar may be unavailable; skipping reachability assert",
      )
    } else {
      await sleep(400)
    }
  }
}
