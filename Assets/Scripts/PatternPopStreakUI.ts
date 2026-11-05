/**
 * PatternPopStreakUI — passive streak HUD next to the pads (not a face HUD).
 * Owns: current/best streak labels, miss float-score cue.
 * Does NOT: decide game state or play tones.
 */
import {Billboard} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"

const FONT_SIZE_SCALE = 1.0
type TextRole =
  | "Title1" | "Title2" | "HeadlineXL" | "Headline1" | "Headline2"
  | "Subheadline" | "Button" | "Callout" | "Body" | "Caption"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Title1: {size: 105, weight: 700}, Title2: {size: 93, weight: 700},
  HeadlineXL: {size: 62, weight: 700}, Headline1: {size: 54, weight: 700},
  Headline2: {size: 48, weight: 700}, Subheadline: {size: 41, weight: 700},
  Button: {size: 39, weight: 500}, Callout: {size: 39, weight: 700},
  Body: {size: 39, weight: 500}, Caption: {size: 38, weight: 500},
}
function roleSize(role: TextRole, distanceCm: number = 110): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}
function applyTextRole(t: Text, role: TextRole, distanceCm: number = 110): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

const PANEL_W = 18
const PANEL_H = 10
const PAD = 1.2
const DIST = 110

@component
export class PatternPopStreakUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PatternPopStreakUI – table-side streak HUD</span>')
  @ui.separator

  @ui.group_start("References")
  @input
  @hint("Trophy icon texture for the streak header")
  @allowUndefined
  trophyIcon: Texture | null = null
  @ui.group_end

  @ui.group_start("Settings")
  @input
  @hint("Panel width in cm")
  @widget(new SliderWidget(10, 30, 1))
  panelWidth: number = PANEL_W

  @input
  @hint("Panel height in cm")
  @widget(new SliderWidget(6, 20, 1))
  panelHeight: number = PANEL_H

  @input
  @hint("Seconds for the miss score float toward the menu")
  @widget(new SliderWidget(0.5, 3.0, 0.1))
  floatDuration: number = 1.6
  @ui.group_end

  private currentText: Text | null = null
  private bestText: Text | null = null
  private floatRoot: SceneObject | null = null
  private floatText: Text | null = null
  private floatActive: boolean = false
  private floatElapsed: number = 0
  private floatStart: vec3 = vec3.zero()
  private floatEnd: vec3 = vec3.zero()

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    this.sceneObject.createComponent(Billboard.getTypeName())
    const backPlate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    backPlate.size = new vec2(this.panelWidth, this.panelHeight)

    // StatusHUD-style: FlexLayout + FlexItem children, rely on auto-discover
    const flex = this.sceneObject.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.onLayoutComplete.add((result) => {
      backPlate.size = new vec2(result.containerWidth, result.containerHeight)
    })
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Center
    flex.justifyContent = FlexJustify.Start
    flex.rowGap = 0.6
    flex.paddingTop = PAD
    flex.paddingBottom = PAD
    flex.paddingLeft = PAD
    flex.paddingRight = PAD
    flex.width = -1
    flex.height = -1

    if (this.trophyIcon) {
      const titleSo = global.scene.createSceneObject("Title")
      titleSo.setParent(this.sceneObject)
      const ec = titleSo.createComponent(ElementContent.getTypeName()) as ElementContent
      ec.text = "Streak"
      ec.leadingIcon = this.trophyIcon
      ec.iconLayout = "left"
      ec.textSize = roleSize("Subheadline", DIST)
      ec.sizeOverride = new vec2(this.panelWidth - PAD * 2, 2.6)
      titleSo.createComponent(FlexItem.getTypeName())
    }

    this.currentText = this.addRowText("Current  0", "Headline2")
    this.bestText = this.addRowText("Best  0", "Body")

    this.floatRoot = global.scene.createSceneObject("FloatScore")
    this.floatRoot.setParent(this.sceneObject)
    this.floatRoot.getTransform().setLocalPosition(new vec3(0, 0, 1.2))
    this.floatRoot.enabled = false
    this.floatText = this.floatRoot.createComponent("Component.Text") as Text
    this.floatText.text = "0"
    this.floatText.depthTest = true
    applyTextRole(this.floatText, "HeadlineXL", DIST)
    this.floatText.horizontalAlignment = HorizontalAlignment.Center
    this.floatText.verticalAlignment = VerticalAlignment.Center
    this.floatText.textFill.color = new vec4(1, 0.95, 0.55, 1)
    this.floatText.layoutRect = Rect.create(-6, 6, -2, 2)

    this.createEvent("UpdateEvent").bind(() => this.tickFloat())
  }

  public setStreak(current: number, best: number): void {
    if (this.currentText) {
      this.currentText.text = `Current  ${current}`
    }
    if (this.bestText) {
      this.bestText.text = `Best  ${best}`
    }
  }

  public playScoreFloat(score: number, endWorld: vec3): void {
    if (!this.floatRoot || !this.floatText) {
      return
    }
    this.floatText.text = `${score}`
    this.floatRoot.enabled = true
    this.floatStart = this.sceneObject.getTransform().getWorldPosition()
    this.floatEnd = endWorld
    this.floatRoot.getTransform().setWorldPosition(this.floatStart)
    this.floatElapsed = 0
    this.floatActive = true
  }

  private tickFloat(): void {
    if (!this.floatActive || !this.floatRoot) {
      return
    }
    this.floatElapsed += getDeltaTime()
    const t = Math.min(1, this.floatElapsed / Math.max(0.1, this.floatDuration))
    const eased = t * t * (3 - 2 * t)
    const pos = vec3.lerp(this.floatStart, this.floatEnd, eased)
    this.floatRoot.getTransform().setWorldPosition(pos)
    if (this.floatText) {
      this.floatText.textFill.color = new vec4(1, 0.95, 0.55, 1 - t)
    }
    if (t >= 1) {
      this.floatActive = false
      this.floatRoot.enabled = false
    }
  }

  private addRowText(label: string, role: TextRole): Text {
    const so = global.scene.createSceneObject("Label")
    so.setParent(this.sceneObject)
    const t = so.createComponent("Component.Text") as Text
    t.text = label
    t.depthTest = true
    applyTextRole(t, role, DIST)
    t.horizontalAlignment = HorizontalAlignment.Left
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.textFill.color = new vec4(1, 1, 1, 1)
    const w = this.panelWidth - PAD * 2
    t.layoutRect = Rect.create(-w / 2, w / 2, -1.3, 1.3)
    so.createComponent(FlexItem.getTypeName())
    return t
  }
}
