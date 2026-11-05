import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {PatternPopLeafInteractor} from "./PatternPopLeafInteractor"
import {
  capturePadColorSums,
  expect,
  findChangedPadId,
  findFloatScore,
  findLitPadId,
  parseStreakFromHud,
  sleep,
  waitForAwaitingInput,
  waitForPatternPopReady,
} from "./PatternPopLeafHelpers"

/**
 * Criterion 3: Wrong pad → fail cue, streak reset, best kept, score float toward menu.
 * Fail audio pitch content is not asserted (only FloatScore enable + streak text).
 */
@component
export class PatternPopWrongPadFailScenario extends Scenario {
  async run(): Promise<void> {
    const interactor = new PatternPopLeafInteractor()
    await waitForPatternPopReady(2000)
    await waitForAwaitingInput()

    // Build a non-zero current streak first so reset is observable
    const streakAfterWin = await interactor.completeCurrentRoundViaHint()
    expect(streakAfterWin).toBeGreaterThan(0)
    await waitForAwaitingInput()

    const beforeMiss = parseStreakFromHud()
    expect(beforeMiss.current).toBeGreaterThan(0)
    const bestBefore = beforeMiss.best

    // Discover correct pad via Hint, then pinch a different one
    const baseline = capturePadColorSums()
    await interactor.pinchNamed("Hint")
    await sleep(100)
    let correct = findChangedPadId(baseline)
    for (let i = 0; i < 15 && correct === null; i++) {
      await sleep(40)
      correct = findChangedPadId(baseline)
      if (correct === null) {
        correct = findLitPadId()
      }
    }
    if (correct === null) {
      throw new Error(`Hint did not reveal next pad (baseline=${baseline.join(",")})`)
    }
    const wrong = (correct + 1) % 4
    await sleep(200)
    await interactor.pinchPad(wrong)

    // Fail float + streak reset
    await sleep(100)
    let floatSeen = false
    for (let i = 0; i < 20; i++) {
      const fs = findFloatScore()
      if (fs && fs.enabled) {
        floatSeen = true
        break
      }
      await sleep(50)
    }
    expect(floatSeen).toBe(true)

    const after = parseStreakFromHud()
    expect(after.current).toBe(0)
    expect(after.best).toBeGreaterThan(bestBefore - 0.1)
    expect(after.best >= bestBefore).toBe(true)
  }
}
