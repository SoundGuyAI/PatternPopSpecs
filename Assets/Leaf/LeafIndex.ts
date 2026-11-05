import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {PatternPopStartupSequenceScenario} from "./PatternPopStartupSequenceScenario"
import {PatternPopCorrectAdvanceScenario} from "./PatternPopCorrectAdvanceScenario"
import {PatternPopWrongPadFailScenario} from "./PatternPopWrongPadFailScenario"
import {PatternPopStreakHudScenario} from "./PatternPopStreakHudScenario"
import {PatternPopMenuAndPadsScenario} from "./PatternPopMenuAndPadsScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {
      id: "pattern-pop-startup-sequence",
      typename: PatternPopStartupSequenceScenario.getTypeName(),
    },
    {
      id: "pattern-pop-correct-advance",
      typename: PatternPopCorrectAdvanceScenario.getTypeName(),
    },
    {
      id: "pattern-pop-wrong-pad-fail",
      typename: PatternPopWrongPadFailScenario.getTypeName(),
    },
    {
      id: "pattern-pop-streak-hud",
      typename: PatternPopStreakHudScenario.getTypeName(),
    },
    {
      id: "pattern-pop-menu-and-pads",
      typename: PatternPopMenuAndPadsScenario.getTypeName(),
    },
  ]
}
