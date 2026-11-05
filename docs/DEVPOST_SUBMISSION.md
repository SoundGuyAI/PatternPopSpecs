# Devpost submission pack: Learn AR with SPECS

Hackathon: https://learn-specs.devpost.com/ (Rules tab: https://learn-specs.devpost.com/rules ; Resources tab: https://learn-specs.devpost.com/resources)
Sponsor: Snap Inc. Administrator: Devpost.
Working project name: **Pattern Pop** (working title, owner to confirm)

Status: draft. Nothing has been submitted. The Lens has not been built yet, so every "what it does" line below is a plan until it is checked in the preview.

## 1. Deadlines (check the Devpost page again before submitting)

| Event | US Eastern | Israel time |
|---|---|---|
| Submission deadline | Mon Nov 9, 2026, 5:00 pm | Tue Nov 10, 2026, 12:00 am (midnight after Monday) |
| Judging period | Nov 10, 10:00 am to Nov 17, 5:00 pm | Nov 10, 5:00 pm to Nov 18, 12:00 am |
| Winners announced (on or around) | Nov 19, 2:00 pm | Nov 19, 9:00 pm |

Aim to submit well before the deadline, with a buffer of at least a few hours.

## 2. Eligibility and team

- Entrants must be at least the age of majority where they live. Teams appoint one Representative who submits and receives any prize.
- Representative name and Devpost account: **TO FILL (owner)**
- The owner must be registered on Devpost ("Join Hackathon") before submitting: **TO CONFIRM (owner)**

## 3. What must be in the submission

| Item | Requirement (from the Rules and Resources tabs) | Status |
|---|---|---|
| Project | New Lens for SPECS, planned with the Devpost Learn skill pack, built via CLAD + Lens Studio + Lens Studio MCP, runs in the Lens Studio preview | Not built yet |
| Public code repo | GitHub, GitLab or Bitbucket, with the Lens Studio project files. The `devpost/` folder of planning docs is welcome (the Resources FAQ says it should be included) | Repo https://github.com/SoundGuyAI/PatternPopSpecs is **private** now. It must be made public before submitting. Owner decision. |
| Text description | What the Lens does, who it is for, what was learned | Draft in section 5 |
| Demo video | Public on YouTube, under 3 minutes, shows the Lens working, screen recording of the Lens Studio preview is fine. No third-party trademarks or copyrighted music without permission | Not recorded |
| Disclosure | Disclose pre-existing code or work used | Draft in section 6 |

Reviewers will not clone or run the project, so the video has to show it working end to end.

## 4. Judging criteria (what to write and show for)

1. **Design:** a complete, coherent experience, not a technical proof of concept.
2. **Technical implementation:** how well it is built, and how well it uses CLAD, Lens Studio and the Lens Studio MCP.
3. **Innovation / idea:** creative, and different from existing concepts.
4. **Presentation:** the video clearly shows it working end to end, and the pitch says what problem it solves, who it is for and why it matters.

## 5. Draft text (edit after the Lens is built; remove anything that is not true)

**Name:** Pattern Pop

**Tagline (draft):** A sound-memory game you play with your hands in your own room.

**What it does (plan, confirm against the build):** Pattern Pop plays a sequence of tones on a set of big colored pads in front of you. You repeat the sequence by pinching the pads in the same order. Each round adds one step. A wrong pad resets your streak, and the Lens tracks your current and best streak.

**Who it is for (draft):** Anyone who likes quick memory and rhythm games, and wants a game that uses space and sound instead of a flat screen.

**Why glasses (draft):** The pads sit in your space at real size, your hands are the controller, and sound comes from where each pad is. Nothing needs a phone or laptop screen.

**How it was planned and built:** Planned with the Devpost Learn `plan-lens` skill. The design brief is in the `devpost/` folder of the repo. Built by a coding agent through CLAD and the Lens Studio MCP, and checked with LEAF tests and the Lens Studio preview. **TO FILL after the build:** which agent was used, how long the build took, what CLAD got right and wrong.

**Challenges (fill from the real build log):** TO FILL. Likely topics, only if they really happened: getting pinch targets that are easy to hit, timing the tones, testing hand input in the preview without glasses.

**What we learned (fill from the real build log):** TO FILL. The contest asks for design thinking, so name one or two real design decisions that changed because of the interview or the preview.

**What's next (draft, owner to confirm):** More pads and difficulty modes. Placing the pads on a real table with the Spectacles World Query API, which has not been tested here. Testing on real glasses.

Do not mention eye tracking, voice, real-wall placement, or saving scores as features unless they are built and shown in the video.

## 6. Disclosure of pre-existing work (draft)

- The idea is based on the owner's earlier game "Wall Tones", first made in Unity and then in a Meta Quest browser version (https://github.com/SoundGuyAI/IWSDKMetaOct2026Pub). Pattern Pop is a new Lens Studio project. The idea and game concept come from Wall Tones; say whether any code or assets were reused. The contest page says old code is not allowed, while the Rules allow disclosed pre-existing work, so the safest route is to reuse none and say so.
- Any audio, models or assets reused from the earlier games or from other sources must be listed here with their license: **TO FILL (owner / build log)**.
- Lens Studio templates, the SPECS Base Template and Snap libraries (for example Spectacles Interaction Kit) are standard tools allowed by the rules.
- The Rules say the submitted work must have been built during the submission period (Oct 15 to Nov 9, 2026). The Pattern Pop repo was created on Nov 5, 2026. Disclose anything that predates it.

## 7. Demo video plan (under 3 minutes)

Record the Lens Studio preview. Suggested outline, timings are targets:

1. 0:00 to 0:15, the idea in one or two sentences and the name.
2. 0:15 to 1:15, play the game in the preview: sequence plays, pinch the pads, round advances, a wrong pad resets, streak display.
3. 1:15 to 2:00, show the process: `devpost/design-brief.md`, the agent building through CLAD, a LEAF test result.
4. 2:00 to 2:40, what you learned about designing for glasses, and what is next.

Upload to YouTube and set it to public. The Rules require it to be publicly visible. Keep the link for the form. Use only music and sounds you have the right to use.

## 8. Final checklist before pressing submit

- [ ] Registered on Devpost, Representative named
- [ ] Lens runs in the Lens Studio preview and matches the description
- [ ] `devpost/design-brief.md` and the Lens Studio project files are in the repo
- [ ] Repo made public (owner's decision) and opened in a logged-out window to confirm
- [ ] No secrets or tokens in the repo
- [ ] Video is public on YouTube, under 3 minutes, link tested logged out
- [ ] Text description matches what is actually built
- [ ] Disclosure section filled in
- [ ] Submitted before Nov 10, 2026, 12:00 am Israel time (Nov 9, 5:00 pm ET)
