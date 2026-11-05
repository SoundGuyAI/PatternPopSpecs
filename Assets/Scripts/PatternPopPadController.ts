/**
 * PatternPopPadController — builds 2×2 glowing pads on the table, pinch targets.
 * Owns pad visuals, colliders, Interactables, light-up. Emits onPadPinched.
 * Does NOT own sequence / streak logic.
 */
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractorEvent} from "SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent"
import {PadId} from "./PatternPopState"

const padPrefab = requireAsset("../GeneratedMeshes/SimonPad.glb") as ObjectPrefab
const matRed = requireAsset("../Materials/PadRed.mat") as Material
const matCyan = requireAsset("../Materials/PadCyan.mat") as Material
const matGreen = requireAsset("../Materials/PadGreen.mat") as Material
const matYellow = requireAsset("../Materials/PadYellow.mat") as Material

/** Pad AABB from normalize: 25 × 5.4 × 24.9 cm; center offset (0, 2.7, 0). */
const PAD_AABB = {w: 25, h: 5.4, d: 24.9}
const PAD_CENTER_OFFSET = new vec3(0, 2.7, 0)

const BASE_MATS: Material[] = [matRed, matCyan, matGreen, matYellow]
const DIM_COLORS: vec4[] = [
  new vec4(0.55, 0.1, 0.1, 1),
  new vec4(0.05, 0.5, 0.55, 1),
  new vec4(0.08, 0.5, 0.12, 1),
  new vec4(0.55, 0.5, 0.08, 1),
]
const LIT_COLORS: vec4[] = [
  new vec4(1, 0.25, 0.25, 1),
  new vec4(0.2, 1, 1, 1),
  new vec4(0.25, 1, 0.35, 1),
  new vec4(1, 1, 0.3, 1),
]

export type PadPinchPayload = {pad: PadId}

@component
export class PatternPopPadController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PatternPopPadController – 2×2 pads</span>')
  @ui.separator

  @ui.group_start("References")
  @input
  @hint("Parent under which pads are created (authored Content/Pads root)")
  padsRoot!: SceneObject
  @ui.group_end

  @ui.group_start("Settings")
  @input
  @hint("World Y of the table top surface (cm)")
  @widget(new SliderWidget(-120, 0, 1))
  tableSurfaceY: number = -50

  @input
  @hint("World X of pad grid center")
  @widget(new SliderWidget(-40, 40, 1))
  gridCenterX: number = 0

  @input
  @hint("World Z of pad grid center")
  @widget(new SliderWidget(-160, -40, 1))
  gridCenterZ: number = -110

  @input
  @hint("Center-to-center spacing between pads (cm)")
  @widget(new SliderWidget(26, 40, 1))
  padSpacing: number = 28

  @input
  @hint("How long a pad stays lit during sequence / feedback (s)")
  @widget(new SliderWidget(0.2, 1.0, 0.05))
  lightDuration: number = 0.45

  @input
  @hint("Show collider wireframes")
  debugColliders: boolean = false
  @ui.group_end

  private padPinchedEvent: Event<PadPinchPayload> = new Event<PadPinchPayload>()
  public readonly onPadPinched = this.padPinchedEvent.publicApi()

  private wrappers: SceneObject[] = []
  private padMats: Material[] = []
  private inputEnabled: boolean = false
  private lightTimers: number[] = [0, 0, 0, 0]

  onAwake() {
    if (!this.padsRoot) {
      print("PatternPopPadController: padsRoot not wired")
      return
    }
    this.buildPads()
    this.createEvent("UpdateEvent").bind(() => this.tickLights())
    this.createEvent("OnStartEvent").bind(() => this.bindInteractables())
  }

  public setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled
  }

  public lightPad(pad: PadId, durationSec?: number): void {
    this.setPadLit(pad, true)
    this.lightTimers[pad] = durationSec ?? this.lightDuration
  }

  public flashAllFail(): void {
    for (let i = 0; i < 4; i++) {
      this.setPadLit(i as PadId, true)
      this.lightTimers[i] = 0.35
    }
  }

  public dimAll(): void {
    for (let i = 0; i < 4; i++) {
      this.setPadLit(i as PadId, false)
      this.lightTimers[i] = 0
    }
  }

  /** Reposition the 2×2 grid so pad bottoms sit on a world-space surface point. */
  public relayoutOnSurface(center: vec3): void {
    this.gridCenterX = center.x
    this.tableSurfaceY = center.y
    this.gridCenterZ = center.z
    if (this.wrappers.length !== 4) {
      return
    }
    const half = this.padSpacing * 0.5
    const positions: vec3[] = [
      new vec3(this.gridCenterX - half, this.tableSurfaceY, this.gridCenterZ + half),
      new vec3(this.gridCenterX - half, this.tableSurfaceY, this.gridCenterZ - half),
      new vec3(this.gridCenterX + half, this.tableSurfaceY, this.gridCenterZ + half),
      new vec3(this.gridCenterX + half, this.tableSurfaceY, this.gridCenterZ - half),
    ]
    for (let i = 0; i < 4; i++) {
      this.wrappers[i].getTransform().setWorldPosition(positions[i].add(PAD_CENTER_OFFSET))
    }
  }

  private buildPads(): void {
    const half = this.padSpacing * 0.5
    const positions: vec3[] = [
      new vec3(this.gridCenterX - half, this.tableSurfaceY, this.gridCenterZ + half),
      new vec3(this.gridCenterX - half, this.tableSurfaceY, this.gridCenterZ - half),
      new vec3(this.gridCenterX + half, this.tableSurfaceY, this.gridCenterZ + half),
      new vec3(this.gridCenterX + half, this.tableSurfaceY, this.gridCenterZ - half),
    ]

    for (let i = 0; i < 4; i++) {
      const padId = i as PadId
      const wrapperPos = positions[i].add(PAD_CENTER_OFFSET)
      const wrapper = global.scene.createSceneObject(`Pad_${padId}`)
      wrapper.setParent(this.padsRoot)
      wrapper.getTransform().setWorldPosition(wrapperPos)

      const collider = wrapper.createComponent("Physics.ColliderComponent") as ColliderComponent
      const shape = Shape.createBoxShape()
      shape.size = new vec3(PAD_AABB.w, PAD_AABB.h, PAD_AABB.d)
      collider.shape = shape
      collider.debugDrawEnabled = this.debugColliders

      const interactable = wrapper.createComponent(Interactable.getTypeName()) as Interactable
      interactable.targetingMode = 3

      const visual = padPrefab.instantiate(wrapper)
      visual.name = `PadVisual_${padId}`
      visual.getTransform().setLocalPosition(PAD_CENTER_OFFSET.uniformScale(-1))

      const mat = BASE_MATS[padId].clone()
      this.padMats[padId] = mat
      this.applyMaterialRecursive(visual, mat)
      this.setPadLit(padId, false)

      this.wrappers.push(wrapper)
    }
  }

  private bindInteractables(): void {
    for (let i = 0; i < this.wrappers.length; i++) {
      const padId = i as PadId
      const interactable = this.wrappers[i].getComponent(Interactable.getTypeName()) as Interactable
      interactable.onHoverEnter.add(() => {
        if (this.inputEnabled) {
          this.setPadLit(padId, true)
        }
      })
      interactable.onHoverExit.add(() => {
        if (this.lightTimers[padId] <= 0) {
          this.setPadLit(padId, false)
        }
      })
      interactable.onTriggerStart.add((_e: InteractorEvent) => {
        if (!this.inputEnabled) {
          return
        }
        this.lightPad(padId)
        this.padPinchedEvent.invoke({pad: padId})
      })
    }
  }

  private tickLights(): void {
    const dt = getDeltaTime()
    for (let i = 0; i < 4; i++) {
      if (this.lightTimers[i] > 0) {
        this.lightTimers[i] -= dt
        if (this.lightTimers[i] <= 0) {
          this.lightTimers[i] = 0
          this.setPadLit(i as PadId, false)
        }
      }
    }
  }

  private setPadLit(pad: PadId, lit: boolean): void {
    const mat = this.padMats[pad]
    if (!mat || !mat.mainPass) {
      return
    }
    mat.mainPass.baseColor = lit ? LIT_COLORS[pad] : DIM_COLORS[pad]
  }

  private applyMaterialRecursive(root: SceneObject, mat: Material): void {
    const stack: SceneObject[] = [root]
    while (stack.length > 0) {
      const so = stack.pop() as SceneObject
      const rmv = so.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
      if (rmv) {
        rmv.clearMaterials()
        rmv.addMaterial(mat)
      }
      const count = so.getChildrenCount()
      for (let c = 0; c < count; c++) {
        stack.push(so.getChild(c))
      }
    }
  }
}
