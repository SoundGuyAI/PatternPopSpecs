import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {
  findInteractableByName,
  findInteractablesByName,
} from "Leaf.lspkg/Interactors/InteractableUtils"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {
  capturePadColorSums,
  findChangedPadId,
  findLitPadId,
  getPadObject,
  parseStreakFromHud,
  waitForAwaitingInput,
} from "./PatternPopLeafHelpers"

export class PatternPopLeafInteractor extends DefaultLeafInteractor {
  async pinchNamed(name: string): Promise<void> {
    const button = findInteractableByName(name)
    if (!button) {
      throw new Error(`Interactable "${name}" not found`)
    }
    await this.trigger(button)
    await sleep(250)
  }

  async pinchPad(padId: number): Promise<void> {
    const pad = getPadObject(padId)
    const matches = findInteractablesByName(`Pad_${padId}`, undefined, true)
    const interactable = matches[0]
    if (!interactable) {
      throw new Error(`Interactable on Pad_${padId} not found (so=${pad.name})`)
    }
    await this.trigger(interactable)
    await sleep(300)
  }

  /**
   * Hint lights the next expected pad; pinch that pad.
   * Returns the pad id that was pinched.
   */
  async hintAndPinchNext(): Promise<number> {
    const baseline = capturePadColorSums()
    await this.pinchNamed("Hint")
    await sleep(100)
    let lit = findChangedPadId(baseline)
    for (let i = 0; i < 15 && lit === null; i++) {
      await sleep(40)
      lit = findChangedPadId(baseline)
      if (lit === null) {
        lit = findLitPadId()
      }
    }
    if (lit === null) {
      throw new Error(`Hint did not light any pad (baseline=${baseline.join(",")})`)
    }
    // Wait for hint light timer to mostly finish so input stays clean
    await sleep(250)
    await this.pinchPad(lit)
    return lit
  }

  /** Complete the current sequence using Hint for each step; returns new streak. */
  async completeCurrentRoundViaHint(): Promise<number> {
    await waitForAwaitingInput()
    const before = parseStreakFromHud()
    // Safety: at most 8 steps in case sequence grew from prior state (fresh reset → 1)
    for (let step = 0; step < 8; step++) {
      await this.hintAndPinchNext()
      await sleep(200)
      const after = parseStreakFromHud()
      if (after.current > before.current) {
        return after.current
      }
    }
    throw new Error("Did not advance streak after completing sequence via Hint")
  }
}
