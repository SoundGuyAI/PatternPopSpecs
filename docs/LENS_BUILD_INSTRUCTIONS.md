# Pattern Pop: build instructions for the coding agent

Working title: **Pattern Pop** (a Lens for Snap Spectacles, built in Lens Studio). The title is a working name and can change.

Read this whole file before doing anything. It is the project owner's starting brief for a coding agent. It is a seed for the planning step, not a replacement for it.

## 1. What this project is

Pattern Pop is a short memory game for glasses. The Lens plays a sequence of tones on a few big colored pads (Wall Tones used four). The player repeats the sequence by pinching the pads in the same order. Each correct round adds one more step. A wrong pad ends the run. The game tracks the current streak and the best streak.

It is a new project for the Learn AR with SPECS hackathon (https://learn-specs.devpost.com/). It is inspired by the owner's earlier game, Wall Tones: a Simon-style game where four colored pads play a growing sequence of tones and the player repeats it by touching the pads in order. Wall Tones 2 (Quest, IWSDK) lets players place the pads on a wall, a table or in the air, has a desktop mode, and has recorded male and female host voices. Wall Tones was first made in Unity (no hands), and a sequel was then made for Meta Quest in the browser with IWSDK. Pattern Pop is a separate project in a different engine. The Quest/IWSDK code lives in https://github.com/SoundGuyAI/IWSDKMetaOct2026Pub (live at https://soundguyai.github.io/IWSDKMetaOct2026Pub/).

## 2. Hard rules from the contest

Source: https://learn-specs.devpost.com/ , its Rules tab and Resources tab. Re-check them before submitting, because organizers can change them. Deadline: **Nov 9, 2026, 5:00 pm US Eastern = Nov 10, 2026, 12:00 am Israel time.**

- The project must be new, started during the submission period (Oct 15 to Nov 9, 2026). The contest page says old ideas are fine and old code is not. The official Rules and FAQ allow Lens Studio templates, assets, libraries and AI coding assistants, require disclosing any other pre-existing code or work, and say the work submitted must have been built during the submission period. So: build Pattern Pop fresh in Lens Studio. The Wall Tones code is browser TypeScript and does not port directly anyway. If any existing code, audio, art or text from Wall Tones is reused, list it in the submission disclosure and check with the owner first.
- The Lens must be planned with the Devpost Learn skill pack (`plan-lens`) and built by a coding agent through the CLAD plugin, Lens Studio and the Lens Studio MCP. It must run in the Lens Studio preview. Nobody needs SPECS glasses.
- The submission needs a public repo with the Lens Studio project files, a short description, and a public YouTube demo video under 3 minutes (a screen recording of the preview is fine).
- Sounds, music and images must be ones we have the right to use. The video must not contain third-party trademarks or copyrighted music without permission.

## 3. Required workflow (do not skip steps)

The official order, from https://github.com/challengepost/learn-specs and the Resources tab:

1. The Lens Studio project already exists in this repo: `PatternPopSpecDevPostSpecsHackOct26.esproj`, `Assets/` (with `Scene.scene`), `Packages/`, `jsconfig.json`, plus `AGENTS.md` and `CLAUDE.md` that Lens Studio generated. It was created from the SPECS Base Template (owner to confirm). Do not edit inside the managed block of `AGENTS.md`. Add any project notes outside it or in `devpost/`.
2. Open the project in Lens Studio first. Then start the coding agent in the folder that holds the `.esproj` and `.mcp.json` files.
3. Install CLAD for your agent (Claude Code, Codex or Cursor). Setup guides are linked from https://learn-specs.devpost.com/resources .
4. Install the skill pack: `npx skills add challengepost/learn-specs --all -y`
5. Run the `plan-lens` skill. It interviews the owner and writes `devpost/design-brief.md`. **The owner answers the interview questions. Do not answer them for the owner and do not skip the interview.** Use section 4 below only as the owner's starting idea. If the owner wants to change it, the owner's answers win.
6. Clear the chat, then run: "Read devpost/design-brief.md and build it for SPECS. Follow the brief closely. Get the basic flow working first, then add detail. Write and run LEAF tests for each done criterion, and tell me which pass."
7. Check the result in the Lens Studio preview, iterate, and keep the `devpost/` folder in the repo.

## 4. Starting idea for the planning interview

These are the owner's ideas to carry into the interview. They are not decided features.

- **One spatial moment.** A set of big pads in front of the player, at roughly arm's length (about 0.6 to 1.6 m), a little below eye level. The player pinches pads to repeat a growing sequence.
- **Why glasses.** The pads sit in the player's own room, at real size, and hands stay free. That is the "draws in the world" and "leaves your body free" idea from the contest video.
- **Interaction.** Standard pinch on large targets only. Mouse in the preview acts as one hand pinching. No custom or two-hand gestures.
- **Sound.** Each pad has its own tone, played from the pad's position (spatial sound). Use Audio components set to Low Latency for press feedback. Sounds can be generated or royalty-free.
- **Feedback.** Pads light up when played and when pressed. A clear wrong-pad cue. Current streak and best streak shown near the pads, not in a distant panel.
- **Surface.** The owner does not know whether Spectacles supports wall detection, and the name of the project deliberately does not mention walls. Treat any real-surface placement as unproven. Spectacles has a World Query hit-test API for placing content on real surfaces, but its docs say the depth data updates at about 5 Hz and works best for static or slowly moving content (https://developers.snap.com/spectacles/about-spectacles-features/apis/world-query). The preview cannot show a real surface. So for the demo, put the pads on a virtual table or in front of the player, and treat real-surface placement as a later, unverified extra.
- **Not in scope for the demo:** eye tracking, voice, saving the best streak between sessions, multiplayer, camera recognition. The preview cannot show these.

Open questions for the owner in the interview: how many pads, how fast the sequence plays, whether to add difficulty modes, and what the stand-in is for anything that needs the real world.

## 5. Done criteria to carry into the brief (proposal, owner to confirm)

Each one must be checkable in the Lens Studio preview.

1. On start, a sequence plays: pads light up and each plays its own tone.
2. Pinching the pads in the right order advances the round and adds one step.
3. Pinching a wrong pad shows a clear fail cue and resets the current streak. The best streak is kept for the session.
4. Streak and best streak are visible next to the pads.
5. All pads are large enough to hit with the mouse-driven pinch, and sit inside the narrow view (about 37 degrees tall by 32 wide).

## 6. Quality bar

- Follow the AR design rules in the plan-lens skill: information on the thing it is about, show things only when needed, few big targets, keep content where the user is already looking.
- Write LEAF tests for each done criterion and report which pass and which fail. Do not report a test as passing without running it. Say plainly what was only checked by eye in the preview.
- Keep a short log of what the agent built and what failed. It helps with the demo video and the submission text.

## 7. Boundaries

- Do not make this repo public, publish the Lens, submit to Devpost, or post to the Discord. The owner does those steps.
- Do not add API keys, tokens or secrets to the repo.
- Do not describe features in the README or submission that are not built and checked.
