/**
 * PatternPopMenuUI — always-visible menu high above the table.
 * Owns: Quit / Hint / Replay pattern buttons (UIKit Frame + Button).
 * Emits intent events only — no game decisions.
 */
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {Billboard} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import {Frame} from "SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
  FlexAlignSelf,
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

const PANEL_W = 28
const PANEL_H = 22
const PAD = 1.6
const DIST = 110
const BUTTON_LABEL_Z = 0.08

@component
export class PatternPopMenuUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PatternPopMenuUI – Quit / Hint / Replay</span>')
  @ui.separator

  @ui.group_start("References")
  @input
  @hint("Close icon for Quit")
  @allowUndefined
  closeIcon: Texture | null = null

  @input
  @hint("Lightbulb icon for Hint")
  @allowUndefined
  hintIcon: Texture | null = null

  @input
  @hint("Replay icon for Replay pattern")
  @allowUndefined
  replayIcon: Texture | null = null
  @ui.group_end

  @ui.group_start("Settings")
  @input
  @hint("Menu panel width in cm")
  @widget(new SliderWidget(18, 40, 1))
  panelWidth: number = PANEL_W

  @input
  @hint("Menu panel height in cm")
  @widget(new SliderWidget(14, 32, 1))
  panelHeight: number = PANEL_H

  @input
  @hint("Title shown at top of the menu")
  titleLabel: string = "Pattern Pop"
  @ui.group_end

  private quitEvent: Event<void> = new Event<void>()
  private hintEvent: Event<void> = new Event<void>()
  private replayEvent: Event<void> = new Event<void>()
  public readonly onQuit = this.quitEvent.publicApi()
  public readonly onHint = this.hintEvent.publicApi()
  public readonly onReplay = this.replayEvent.publicApi()

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    this.sceneObject.createComponent(Billboard.getTypeName())
    const frame = this.sceneObject.createComponent(Frame.getTypeName()) as Frame
    frame.autoShowHide = false
    frame.autoScaleContent = false
    frame.allowScaling = false

    frame.onInitialized.add(() => {
      frame.innerSize = new vec2(this.panelWidth, this.panelHeight)
      frame.padding = new vec2(PAD, PAD)

      const content = global.scene.createSceneObject("Content")
      content.setParent(frame.contentTransform.getSceneObject())
      content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

      const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
      flex.autoDiscoverItemsOnStart = false
      flex.width = this.panelWidth
      flex.height = this.panelHeight
      flex.direction = FlexDirection.Column
      flex.alignItems = FlexAlign.Stretch
      flex.justifyContent = FlexJustify.Start
      flex.rowGap = 1.2
      flex.paddingTop = PAD
      flex.paddingBottom = PAD
      flex.paddingLeft = PAD
      flex.paddingRight = PAD

      const pending: FlexItem[] = []
      this.addHeader(content, this.titleLabel, pending)
      this.addMenuButton(content, "Quit", 22, 3.2, this.closeIcon, () => this.quitEvent.invoke(), pending)
      this.addMenuButton(content, "Hint", 22, 3.2, this.hintIcon, () => this.hintEvent.invoke(), pending)
      this.addMenuButton(content, "Replay pattern", 22, 3.2, this.replayIcon, () => this.replayEvent.invoke(), pending)
      if (pending.length > 0) {
        flex.addItems(pending)
      }
    })
  }

  private addHeader(parent: SceneObject, label: string, pending: FlexItem[]): void {
    const so = global.scene.createSceneObject("Header")
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = label
    t.depthTest = true
    applyTextRole(t, "Headline1", DIST)
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.textFill.color = new vec4(1, 1, 1, 1)
    const innerW = this.panelWidth - PAD * 2
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -2, 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = 4.0
    item.alignSelf = FlexAlignSelf.Stretch
    pending.push(item)
  }

  private addMenuButton(
    parent: SceneObject,
    label: string,
    sizeX: number,
    sizeY: number,
    icon: Texture | null,
    onClick: () => void,
    pending: FlexItem[]
  ): void {
    const so = global.scene.createSceneObject(label)
    so.setParent(parent)
    const btn = so.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(sizeX, sizeY, 1)
    if (icon) {
      const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
      ec.text = label
      ec.leadingIcon = icon
      ec.iconLayout = "left"
      ec.textSize = roleSize("Button", DIST)
      ec.sizeOverride = new vec2(sizeX - 0.6, sizeY - 0.4)
    } else {
      this.addButtonLabel(so, label, sizeX - 0.5)
    }
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    pending.push(item)
    btn.onTriggerUp.add(onClick)
  }

  private addButtonLabel(parent: SceneObject, text: string, widthCM: number): void {
    const so = global.scene.createSceneObject("Label")
    so.setParent(parent)
    so.getTransform().setLocalPosition(new vec3(0, 0, BUTTON_LABEL_Z))
    const t = so.createComponent("Component.Text") as Text
    t.text = text
    t.depthTest = true
    applyTextRole(t, "Button", DIST)
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.textFill.color = new vec4(1, 1, 1, 1)
    t.layoutRect = Rect.create(-widthCM / 2, widthCM / 2, -1.2, 1.2)
  }
}
