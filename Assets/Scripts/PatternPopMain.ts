/**
 * PatternPopMain — orchestration for the Simon-style Pattern Pop experience.
 * Places the pad grid on a real surface via World Query (no virtual table mesh),
 * then drives sequence playback and miss float.
 */
import {InteractorInputType} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import {SIK} from "SpectaclesInteractionKit.lspkg/SIK"
import {PatternPopStreakUI} from "./PatternPopStreakUI"
import {PatternPopMenuUI} from "./PatternPopMenuUI"
import {PatternPopAudioController} from "./PatternPopAudioController"
import {PatternPopPadController} from "./PatternPopPadController"
import {PatternPopState, PatternPopPhase, PadId} from "./PatternPopState"

const WorldQueryModule = require("LensStudio:WorldQueryModule") as WorldQueryModule

/** Streak HUD offset from the placed surface center (cm). */
const STREAK_OFFSET = new vec3(48, 27, 10)
/** Menu offset from the placed surface center (cm) — high above the pads. */
const MENU_OFFSET = new vec3(0, 104, 10)

@component
export class PatternPopMain extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PatternPopMain – game orchestrator</span>')
  @ui.separator

  @ui.group_start("References")
  @input
  @hint("Streak HUD next to the pads")
  streakUI!: PatternPopStreakUI

  @input
  @hint("Menu high above the table")
  menuUI!: PatternPopMenuUI

  @input
  @hint("Audio controller")
  audio!: PatternPopAudioController

  @input
  @hint("Pad controller")
  pads!: PatternPopPadController

  @input
  @hint("Legacy virtual-table slot — cleared at boot; pads use World Query instead")
  tableSlot!: SceneObject

  @input
  @hint("World-space target for the miss score float (usually the menu root)")
  floatTarget!: SceneObject
  @ui.group_end

  @ui.group_start("Settings")
  @input
  @hint("Seconds between sequence pad steps")
  @widget(new SliderWidget(0.35, 1.0, 0.05))
  stepInterval: number = 0.6

  @input
  @hint("Pause after sequence before accepting input")
  @widget(new SliderWidget(0.2, 1.2, 0.05))
  postSequencePause: number = 0.4

  @input
  @hint("Pause after a correct round before growing the pattern")
  @widget(new SliderWidget(0.2, 1.5, 0.05))
  roundClearPause: number = 0.55

  @input
  @hint("Pause after a miss before restarting a new pattern")
  @widget(new SliderWidget(0.5, 2.5, 0.1))
  missRestartPause: number = 1.8

  @input
  @hint("Smooth World Query hit results")
  filterHits: boolean = true

  @input
  @hint("Show collider wireframes on startup")
  debugColliders: boolean = false
  @ui.group_end

  private state = new PatternPopState()
  private busy: boolean = false
  private runGeneration: number = 0
  private hitTestSession: HitTestSession | null = null
  private placed: boolean = false
  private lastHit: WorldQueryHitTestResult | null = null
  private primaryInteractor: any = null
  private lastHitTestAt: number = 0
  private readonly hitTestIntervalSec: number = 0.2

  onAwake() {
    // Defer cross-script calls until OnStart — child UI/controllers finish
    // onAwake after this parent script, so setStreak/onQuit.add in onAwake races.
    this.createEvent("OnStartEvent").bind(() => this.boot())
  }

  private boot(): void {
    if (!this.streakUI || !this.menuUI || !this.audio || !this.pads || !this.tableSlot || !this.floatTarget) {
      print("PatternPopMain: required @input not wired — check Phase B bootstrap")
      return
    }

    this.clearVirtualTable()
    this.streakUI.setStreak(0, 0)
    this.streakUI.getSceneObject().enabled = false
    this.menuUI.getSceneObject().enabled = false
    this.pads.setInputEnabled(false)
    this.pads.dimAll()
    if (this.pads.padsRoot) {
      this.pads.padsRoot.enabled = false
    }

    this.menuUI.onQuit.add(() => this.handleQuit())
    this.menuUI.onHint.add(() => this.handleHint())
    this.menuUI.onReplay.add(() => this.handleReplay())
    this.pads.onPadPinched.add((payload) => this.handlePadPinch(payload.pad))

    if (this.debugColliders) {
      this.setColliderDebugAll(this.getSceneObject(), true)
    }

    this.beginSurfacePlacement()
  }

  /** Remove the stand-in coffee-table mesh — pads live on the real surface. */
  private clearVirtualTable(): void {
    while (this.tableSlot.getChildrenCount() > 0) {
      this.tableSlot.getChild(0).destroy()
    }
    this.tableSlot.enabled = false
  }

  private beginSurfacePlacement(): void {
    try {
      const options = HitTestSessionOptions.create()
      options.filter = this.filterHits
      this.hitTestSession = WorldQueryModule.createHitTestSessionWithOptions(options)
      this.hitTestSession.start()
    } catch (e) {
      print("Pattern Pop: World Query unavailable — " + e)
      this.hitTestSession = null
      return
    }

    this.setupPlaceOnPinch()
    this.createEvent("UpdateEvent").bind(() => this.updatePlacement())
    print("Pattern Pop: look at your real table, then pinch to place the pads")
  }

  private setupPlaceOnPinch(): void {
    const interactors = SIK.InteractionManager.getInteractorsByType(InteractorInputType.All)
    for (let i = 0; i < interactors.length; i++) {
      const interactor = interactors[i]
      interactor.onTriggerEnd.add(() => {
        if (this.placed) {
          return
        }
        if (this.lastHit && this.primaryInteractor === interactor) {
          this.lockPlacement(this.lastHit)
        }
      })
    }
  }

  private updatePlacement(): void {
    if (this.placed || !this.hitTestSession) {
      return
    }
    const now = getTime()
    if (now - this.lastHitTestAt < this.hitTestIntervalSec) {
      return
    }
    this.lastHitTestAt = now

    try {
      this.primaryInteractor = SIK.InteractionManager.getTargetingInteractors().shift()
    } catch (_e) {
      this.primaryInteractor = null
    }
    if (
      this.primaryInteractor &&
      this.primaryInteractor.isActive() &&
      this.primaryInteractor.isTargeting()
    ) {
      const start = this.primaryInteractor.startPoint
      const rayStart = new vec3(start.x, start.y, start.z + 30)
      const rayEnd = this.primaryInteractor.endPoint
      this.hitTestSession.hitTest(rayStart, rayEnd, (hit) => this.onHitTestResult(hit))
    } else if (this.pads.padsRoot) {
      this.pads.padsRoot.enabled = false
      this.lastHit = null
    }
  }

  private onHitTestResult(hit: WorldQueryHitTestResult | null): void {
    if (this.placed) {
      return
    }
    if (!hit) {
      this.lastHit = null
      if (this.pads.padsRoot) {
        this.pads.padsRoot.enabled = false
      }
      return
    }
    this.lastHit = hit
    if (this.pads.padsRoot) {
      this.pads.padsRoot.enabled = true
    }
    this.pads.relayoutOnSurface(hit.position)
  }

  private lockPlacement(hit: WorldQueryHitTestResult): void {
    this.lastHit = hit
    this.placeAtWorldPosition(hit.position)
  }

  /**
   * Lock the pad grid / HUD / menu at a world-space surface point and start a run.
   * Used by World Query pinch-to-place and by LEAF tests (preview has no real table depth).
   */
  public placeAtWorldPosition(pos: vec3): void {
    if (this.placed) {
      return
    }
    this.placed = true
    this.pads.relayoutOnSurface(pos)
    if (this.pads.padsRoot) {
      this.pads.padsRoot.enabled = true
    }

    const streakSo = this.streakUI.getSceneObject()
    const menuSo = this.menuUI.getSceneObject()
    streakSo.enabled = true
    menuSo.enabled = true
    streakSo.getTransform().setWorldPosition(pos.add(STREAK_OFFSET))
    menuSo.getTransform().setWorldPosition(pos.add(MENU_OFFSET))

    if (this.hitTestSession) {
      this.hitTestSession.stop()
      this.hitTestSession = null
    }

    print(
      "Pattern Pop: placed on surface at " +
        pos.x.toFixed(1) +
        ", " +
        pos.y.toFixed(1) +
        ", " +
        pos.z.toFixed(1)
    )
    this.startFreshRun()
  }

  public isPlaced(): boolean {
    return this.placed
  }

  private startFreshRun(): void {
    this.clearDelayed()
    this.state.resetRun()
    this.streakUI.setStreak(0, this.state.bestStreak)
    this.pads.dimAll()
    this.pads.setInputEnabled(false)
    this.busy = false
    this.schedule(0.4, () => this.playGrowingRound())
  }

  private playGrowingRound(): void {
    if (this.state.phase === PatternPopPhase.Quit) {
      return
    }
    const seq = this.state.beginOrAdvanceRound()
    this.playSequence(seq)
  }

  private playSequence(seq: PadId[]): void {
    this.busy = true
    this.pads.setInputEnabled(false)
    this.pads.dimAll()
    let i = 0
    const step = () => {
      if (this.state.phase === PatternPopPhase.Quit) {
        return
      }
      if (i >= seq.length) {
        this.schedule(this.postSequencePause, () => {
          this.state.markAwaitingInput()
          this.pads.setInputEnabled(true)
          this.busy = false
        })
        return
      }
      const pad = seq[i]
      this.pads.lightPad(pad)
      this.audio.playPad(pad)
      i += 1
      this.schedule(this.stepInterval, step)
    }
    this.schedule(0.15, step)
  }

  private handlePadPinch(pad: PadId): void {
    if (this.busy || this.state.phase !== PatternPopPhase.AwaitingInput) {
      return
    }
    const result = this.state.registerPad(pad)
    this.streakUI.setStreak(this.state.currentStreak, this.state.bestStreak)

    if (result === "wrong") {
      this.onMiss()
      return
    }

    this.audio.playPad(pad)
    if (result === "correct_round") {
      this.busy = true
      this.pads.setInputEnabled(false)
      this.schedule(this.roundClearPause, () => this.playGrowingRound())
    }
  }

  private onMiss(): void {
    this.busy = true
    this.pads.setInputEnabled(false)
    this.audio.playFail()
    this.pads.flashAllFail()
    const ended = this.state.lastEndedStreak
    this.streakUI.setStreak(0, this.state.bestStreak)
    const target = this.floatTarget.getTransform().getWorldPosition()
    this.streakUI.playScoreFloat(ended, target)

    this.schedule(this.missRestartPause, () => {
      this.state.sequence = []
      this.state.inputIndex = 0
      this.state.phase = PatternPopPhase.Idle
      this.playGrowingRound()
    })
  }

  private handleQuit(): void {
    this.audio.playClick()
    this.clearDelayed()
    this.state.quit()
    this.pads.setInputEnabled(false)
    this.pads.dimAll()
    this.busy = true
    print("Pattern Pop: Quit — run ended for this session")
  }

  private handleHint(): void {
    this.audio.playClick()
    if (this.state.phase !== PatternPopPhase.AwaitingInput || this.state.sequence.length === 0) {
      return
    }
    const next = this.state.sequence[this.state.inputIndex]
    this.pads.lightPad(next, 0.7)
    this.audio.playPad(next)
  }

  private handleReplay(): void {
    this.audio.playClick()
    if (!this.placed) {
      return
    }
    if (this.state.sequence.length === 0) {
      this.startFreshRun()
      return
    }
    if (this.state.phase === PatternPopPhase.Quit) {
      this.state.phase = PatternPopPhase.Idle
    }
    this.clearDelayed()
    this.state.inputIndex = 0
    this.state.phase = PatternPopPhase.PlayingSequence
    this.playSequence(this.state.sequence.slice())
  }

  private schedule(delaySec: number, fn: () => void): void {
    const gen = this.runGeneration
    const ev = this.createEvent("DelayedCallbackEvent") as DelayedCallbackEvent
    ev.bind(() => {
      if (gen !== this.runGeneration) {
        return
      }
      fn()
    })
    ev.reset(delaySec)
  }

  private clearDelayed(): void {
    this.runGeneration += 1
    this.busy = false
  }

  private setColliderDebugAll(root: SceneObject, enabled: boolean): void {
    const stack: SceneObject[] = [root]
    while (stack.length > 0) {
      const so = stack.pop() as SceneObject
      const col = so.getComponent("Physics.ColliderComponent") as ColliderComponent
      if (col) {
        col.debugDrawEnabled = enabled
      }
      const n = so.getChildrenCount()
      for (let i = 0; i < n; i++) {
        stack.push(so.getChild(i))
      }
    }
  }
}
