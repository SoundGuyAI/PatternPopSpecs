/**
 * PatternPopState — pure Simon-sequence / streak logic.
 * No scene access. Single source of truth for run state.
 */

export type PadId = 0 | 1 | 2 | 3

export enum PatternPopPhase {
  Idle = "Idle",
  PlayingSequence = "PlayingSequence",
  AwaitingInput = "AwaitingInput",
  Missed = "Missed",
  Quit = "Quit",
}

export class PatternPopState {
  public phase: PatternPopPhase = PatternPopPhase.Idle
  public sequence: PadId[] = []
  public inputIndex: number = 0
  public currentStreak: number = 0
  public bestStreak: number = 0
  public lastEndedStreak: number = 0

  public resetRun(): void {
    this.sequence = []
    this.inputIndex = 0
    this.currentStreak = 0
    this.lastEndedStreak = 0
    this.phase = PatternPopPhase.Idle
  }

  /** Start or grow the pattern by one random pad, then enter PlayingSequence. */
  public beginOrAdvanceRound(): PadId[] {
    const next = Math.floor(Math.random() * 4) as PadId
    this.sequence.push(next)
    this.inputIndex = 0
    this.phase = PatternPopPhase.PlayingSequence
    return this.sequence.slice()
  }

  public markAwaitingInput(): void {
    this.phase = PatternPopPhase.AwaitingInput
  }

  /**
   * Player pinched a pad. Returns result:
   * - correct_partial: wait for more
   * - correct_round: round cleared; streak++
   * - wrong: miss
   */
  public registerPad(pad: PadId): "correct_partial" | "correct_round" | "wrong" {
    if (this.phase !== PatternPopPhase.AwaitingInput) {
      return "wrong"
    }
    const expected = this.sequence[this.inputIndex]
    if (pad !== expected) {
      this.lastEndedStreak = this.currentStreak
      if (this.currentStreak > this.bestStreak) {
        this.bestStreak = this.currentStreak
      }
      this.currentStreak = 0
      this.inputIndex = 0
      this.phase = PatternPopPhase.Missed
      return "wrong"
    }
    this.inputIndex += 1
    if (this.inputIndex >= this.sequence.length) {
      this.currentStreak += 1
      if (this.currentStreak > this.bestStreak) {
        this.bestStreak = this.currentStreak
      }
      return "correct_round"
    }
    return "correct_partial"
  }

  public quit(): void {
    this.phase = PatternPopPhase.Quit
  }
}
