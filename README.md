# Pattern Pop

A Simon-style memory game for Snap Spectacles. Four colored pads light up and play tones in a pattern. Pinch them in the right order to repeat it. Every round the pattern gets longer. Miss one, and your streak resets.

## Demo video

[![Pattern Pop demo](https://img.youtube.com/vi/Go1nkEKOttM/hqdefault.jpg)](https://www.youtube.com/watch?v=Go1nkEKOttM)

## How to play

Place the board on a detected table surface, watch and listen to the pattern, then repeat it by pinching the pads. The in-game menu includes Replay, Hint and Quit.

## Built with

- Lens Studio 5.23 for Snap Spectacles
- Spectacles Interaction Kit for pinch input
- Spectacles UI Kit for the in-game menu
- World Query for surface placement
- CLAD and Lens Studio MCP, with the Devpost Learn skill pack used during planning
- LEAF gameplay scenarios in Assets/Leaf/ (included scenarios, not a claim that all tests passed)

## Open the project

1. Open PatternPopSpecDevPostSpecsHackOct26.esproj in Lens Studio.
2. Open Assets/Scene.scene to inspect the scene and run it in Preview.
3. Use Spectacles to try the intended table-placement and pinch interaction in your room.

The demo recording shows Lens Studio Preview, not footage captured through Spectacles.

## Repository layout

- Assets/ - scene, TypeScript game scripts, meshes, music and pad tones
- Assets/GeneratedSFX/ - generated audio assets
- Assets/Leaf/ - gameplay test scenarios
- Packages/ - Lens Studio packages
- docs/ - submission notes and build instructions
- devpost/ - design brief and planning documents

## About

Created for the Learn AR with SPECS hackathon on Devpost:
https://learn-specs.devpost.com/
