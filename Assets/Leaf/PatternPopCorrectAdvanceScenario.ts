import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {PatternPopLeafInteractor} from "./PatternPopLeafInteractor"
import {
  expect,
  parseStreakFromHud,
  waitForAwaitingInput,
  waitForPatternPopReady,
} from "./PatternPopLeafHelpers"

/**
 * Criterion 2: Pinching pads in the right order advances the round and adds one step.
 * Uses Hint to discover the next correct pad without reading private game state.
 */
@component
export class PatternPopCorrectAdvanceScenario extends Scenario {
  async run(): Promise<void> {
    const interactor = new PatternPopLeafInteractor()
    await waitForPatternPopReady(2000)
    await waitForAwaitingInput()

    const before = parseStreakFromHud()
    const newStreak = await interactor.completeCurrentRoundViaHint()

    expect(newStreak).toBe(before.current + 1)

    // After a correct round, pattern grows by one and replays — wait for next input window
    await waitForAwaitingInput()
    const mid = parseStreakFromHud()
    expect(mid.current).toBe(newStreak)

    // Complete second round (now length 2) to prove growth
    const afterSecond = await interactor.completeCurrentRoundViaHint()
    expect(afterSecond).toBe(newStreak + 1)
  }
}
