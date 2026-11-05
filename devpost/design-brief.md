---
status: approved
---

# Design brief: Pattern Pop

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

## The one spatial moment
Four lit-up pads sit on a coffee table in a 2×2 grid. The Lens plays a growing pattern — pads blink and play tones — then the player reaches out and pinches them in the same order. A correct round makes the pattern longer; a miss ends the run and the streak score floats up from the table toward a menu high above, so the eyes follow it.

## Why it belongs on glasses
- Uses: draws in the world; leaves your body free
- Why it's better than the phone or laptop version: the pads sit at real size on a table in your own room, and you play with your hands free instead of tapping a flat screen

## Product or overlay
- Type: product — the virtual pads and table are the experience
- What the real version would sense: nothing for this version (pads are virtual)
- Stand-in for the preview: none needed for the main game; pads sit on a virtual table the Lens provides

## Where things live
- Where the user is looking during the main task: down at the table
- Pads: four glowing colored pads (red, cyan, green, yellow, matching the concept art) in a 2×2 grid on a virtual coffee table; each pad about 25 cm across (hand-sized); table at roughly arm's reach, a little below eye level (default ~0.8–1.2 m)
- Streak scores (current and best): floating just above the table next to the pads — not a face HUD
- Menu: always present, high above the table so it does not block the view of the pads; Quit, Hint, and Replay pattern as a few big pinch buttons
- Title "Pattern Pop": optional branding near start (default); not needed during play

## Hands and input
- Play a pad: pinch on the pad (carries the demo; mouse in preview = pinch)
- Menu: pinch Quit, Hint, or Replay pattern
- Targets are big and highlight when aimed at.
- Voice (if any) and the button that does the same job: none
- Finger/palm contact on pads: wanted later on real glasses; not the demo path (see Risks)

## When things show
- Pads: always on the table during a run; light up and play their tone when the sequence plays them and when the player pinches them correctly
- Current streak and best streak: visible by the pads during play
- Menu: always there, high above the table
- On miss: clear fail cue; current streak ends; the run's score animates floating up from the table toward the menu so the player looks up
- Hint / Replay: only when the player pinches those menu buttons
- Sequence pace between pad steps: about 0.5–0.7 s (default)

## Done criteria
Each one can be checked in Lens Studio's preview.
1. On start (or after Replay), a sequence plays: pads light up and each plays its own tone from its position.
2. Pinching the pads in the right order advances the round and adds one step to the pattern.
3. Pinching a wrong pad shows a clear fail cue, resets the current streak, keeps the best streak for the session, and the score floats up from the table toward the menu.
4. Current streak and best streak are readable next to the pads (not on a face HUD).
5. Menu buttons Quit, Hint, and Replay pattern can be pinched; Replay plays the current pattern again; pads are large enough to hit with the mouse-driven pinch and sit in a 2×2 on the virtual table inside a comfortable looking-down view.

## Out of scope
- Recognizing or tracking a real physical Simon device
- Wall play mode with 1×1 m pads
- Face-locked HUD for scores
- Saving best streak between sessions
- Voice commands, eye tracking, multiplayer
- Demo depending on finger/palm touch instead of pinch

## Risks and open questions
- Finger/palm press on pads: desired for real glasses, but cannot be shown convincingly in the laptop preview; pinch carries the demo
- Menu high above the table may sit outside the narrow view while looking at the pads; on miss, the floating score is the cue to look up (feel of that cue on real glasses is unproven)
- Physical Simon recognition and wall-sized pads: parked as later ideas; preview cannot recognize a real device or a real wall
- Exact tone set and fail-sound style not chosen (default: distinct short tones per pad + clear wrong cue)

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
