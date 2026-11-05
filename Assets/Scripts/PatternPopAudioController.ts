/**
 * PatternPopAudioController — pad tones, fail cue, menu click.
 * Owns AudioComponents only. Does not own game state.
 */
import {PadId} from "./PatternPopState"

const toneRed = requireAsset("../GeneratedSFX/ToneRed.wav") as AudioTrackAsset
const toneCyan = requireAsset("../GeneratedSFX/ToneCyan.wav") as AudioTrackAsset
const toneGreen = requireAsset("../GeneratedSFX/ToneGreen.wav") as AudioTrackAsset
const toneYellow = requireAsset("../GeneratedSFX/ToneYellow.wav") as AudioTrackAsset
const failCue = requireAsset("../GeneratedSFX/FailCue.wav") as AudioTrackAsset
const buttonClick = requireAsset("../GeneratedSFX/ButtonClick.wav") as AudioTrackAsset

@component
export class PatternPopAudioController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PatternPopAudioController – pad & UI tones</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @hint("SFX volume for pad tones and UI")
  @widget(new SliderWidget(0, 1, 0.05))
  sfxVolume: number = 1.0
  @ui.group_end

  private padAudio: AudioComponent[] = []
  private failAudio: AudioComponent | null = null
  private clickAudio: AudioComponent | null = null

  onAwake() {
    const tones = [toneRed, toneCyan, toneGreen, toneYellow]
    for (let i = 0; i < 4; i++) {
      const so = global.scene.createSceneObject(`PadTone_${i}`)
      so.setParent(this.sceneObject)
      const audio = so.createComponent("Component.AudioComponent") as AudioComponent
      audio.audioTrack = tones[i]
      audio.playbackMode = Audio.PlaybackMode.LowLatency
      audio.volume = this.sfxVolume
      this.padAudio.push(audio)
    }

    const failSo = global.scene.createSceneObject("FailCue")
    failSo.setParent(this.sceneObject)
    this.failAudio = failSo.createComponent("Component.AudioComponent") as AudioComponent
    this.failAudio.audioTrack = failCue
    this.failAudio.playbackMode = Audio.PlaybackMode.LowLatency
    this.failAudio.volume = this.sfxVolume

    const clickSo = global.scene.createSceneObject("ButtonClick")
    clickSo.setParent(this.sceneObject)
    this.clickAudio = clickSo.createComponent("Component.AudioComponent") as AudioComponent
    this.clickAudio.audioTrack = buttonClick
    this.clickAudio.playbackMode = Audio.PlaybackMode.LowLatency
    this.clickAudio.volume = this.sfxVolume
  }

  public playPad(pad: PadId): void {
    const audio = this.padAudio[pad]
    if (audio) {
      audio.volume = this.sfxVolume
      audio.play(1)
    }
  }

  public playFail(): void {
    if (this.failAudio) {
      this.failAudio.volume = this.sfxVolume
      this.failAudio.play(1)
    }
  }

  public playClick(): void {
    if (this.clickAudio) {
      this.clickAudio.volume = this.sfxVolume
      this.clickAudio.play(1)
    }
  }
}
