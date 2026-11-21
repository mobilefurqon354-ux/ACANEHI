# CB RULES for the sound-designer (GENERATED 2026-11-21 by tools/slice_rules.py from CB_RULES.md; do not edit)
CB_RULES.md is the master and wins. This file holds the rules that touch your job. Read it instead of the whole book. If a rule you need seems missing, run `python tools/rules.py --grep <words>`; never read CB_RULES.md or SKILL_FULL.md top to bottom.

## RULE NO. 1: MAKE A RICK-QUALITY VIDEO. If this fails, everything is wrong.
- Every rule below serves this one. Following a workflow step, passing a gate or ticking a box never excuses a result that is below Rick's.
- THE TEST, on every picture and every clip before CB sees it: put ours next to a Rick frame of the same kind of shot (same shot size, same kind of place). Ask plainly: would this pass as a frame from his channel? Look at story clarity, world detail, light and shadow, reflection, colour, acting, camera.
- If ours is clearly weaker, it is NOT done. Fix it, or tell CB exactly what is still below Rick and why. Never present it as finished.
- If a workflow, tool or note leads to a result below Rick, the workflow is wrong: stop, say so, and use the method that reached the quality before (the airfield way).

## HARD RULE NO. 2: NOTHING GENERIC PASSES. EVERYTHING IS ULTRA DETAILED.
This is a gate, not advice. A frame that fails it is not shown to CB and not rendered further.
- **Generic = fail.** A plain box, ball tree, flat one-colour surface, typed font, filler word, star in place of a word, empty prop, standing or floor-sit pose where the story needs a real action, or a set that could belong to any film.
- **Every object in frame is specific to THIS story** and built from real parts, down to the small things: a wallet has pockets, stitching, a photo and flies that fly out; a board carries a real blueprint; a cart carries the ride's name; a loop under construction shows the crane and the missing piece.
- **Scale is checked:** trees about a quarter of the hero structure, a vehicle small around its rider, characters as large in frame as Rick's.
- **Poses are specific:** seated means a chair-sit with knees forward, sleeping means slumped with a tilt; body moves come from the trained motion library.
- **The test before CB sees it:** put the frame beside Rick's and name five specific details in every main object. If you cannot, or if Rick's shows a kind of thing ours lacks, it fails. Fix it first.
Full detail list: section 3, "PREMIUM DETAIL IN EVERYTHING".

## 11b. Token rules (every helper and the lead)
- T1 READ ONLY YOUR SLICE. A helper reads `rules/dept/<its department>.md` (made by `python tools/slice_rules.py`) and the files its brief names. It never reads the whole of CB_RULES.md or SKILL.md; when it needs one more rule it greps for the word. Only the lead reads the whole book, once per session.
- T2 A FRESH HELPER FOR EVERY FIX ROUND. A helper does one build or one fix round, then it ends. Before it reports it writes `STATE.md` in its work folder (at most 60 lines): what is built, the files and frame folders, the numbers measured, what is weak, what is open. The next round is a NEW helper that reads STATE.md and the notes. Never resume a helper that already did a round: each resumed step re-reads its whole history. (This replaces "one builder who stays through every fix round" in section 10.)
- T3 NUMBERS BEFORE PICTURES. Anything a script can measure is checked by a script that prints numbers: a figure cut by the frame edge, the named thing in frame on its word, floor share, saturation and brightness, frozen frames, loudness. A helper opens a picture only when a number fails or for the one final look. Pictures are looked at small: one sheet at most 1,600 px wide, at most 4 pictures per check round, never full-size frames one by one.
- T4 ONE COMMAND PER CYCLE. Render, sheets and measurements run from ONE script call. A long run goes in the background and the helper ends its turn; it does not wake up to wait, poll or look at a log. Every wake-up re-reads everything.
- T5 SHORT REPORTS, DETAIL IN FILES. A helper's report is at most 25 lines: done, numbers, weak points, files. Tables and lists go into a file the report names.
- T6 THE SMALL MODEL FOR MECHANICAL WORK. Rendering, joining, measuring, merging, fact checks, sound mix runs and file moves go to a helper on the smaller model (Agent tool `model: sonnet` or `haiku`). The main model is for story, acting, camera and look decisions.
- T7 A FRESH LEAD SESSION PER PHASE. Story, build and finish are three sessions, each started from HANDOFF.md. The lead never reads a helper's transcript and never pastes long tool output into the chat when a file path will do.
- T8 NOTHING BUILT TWICE. Before a helper builds a tool, a set part or a move, it greps `tools/`, `templates/` and the last episode for one that exists. Studies of Rick are done once and live in the rules and `references/`; a film does not study him again unless CB names a new question.
- T9 MEASURE EVERY FILM. At delivery the lead runs `python tools/token_report.py` and writes the totals into HANDOFF.md: tokens per helper, working hours, and the three most expensive helpers with the reason. A helper over 60 million tokens is a fault to explain.
- T10 NO WHOLE READS OF BIG FILES (V1.2). Never Read a file over 40 KB whole: grep, then Read with offset/limit. CB_RULES.md and rules/SKILL_FULL.md are printed with `python tools/rules.py` (--phase, sections, --grep), never read through. Code files (film.js, puppets.mjs, poses.mjs, library.mjs, char2d.mjs) are grepped for the export or key, never read through.
- T11 PICTURE BUDGET (V1.2). One contact sheet at most 1,600 px wide per look, at most 4 pictures per check round; Rick reference frames come from the board made once, never re-extracted per helper.
- T12 ONLY THE DEPARTMENTS A STEP NEEDS (V1.2). Before the gate: writer, camera-director, stretch builders. Other departments start only for work the board shows is missing; never the whole crew at once.
- T13 PATHS, NOT CONTENT (V1.2). A brief names files; it never pastes rule text, film.json or tool output into the prompt.
- T14 LOGS IN FILES (V1.2). Long command output goes to `_tmp/*.log`; only the summary lines (PASS/FAIL table, last 20 lines) are printed.
- T15 NO RE-READS (V1.2). A file already read in this session is not read again unless it changed.

## 11d. Solve it before it is built
- THE PICTURE PLAN, BEFORE ANY BUILD. After the script and voice the writer and the lead write `episodes/<name>/PICTURE_PLAN.md` in the format of `templates/PICTURE_PLAN.md`: one row for every thing or action the voice names, with the word it lands on, what we see, CLOSE / IN SCENE / NOT SHOWN and WHY in this story, the character's feeling on that word, an effect or gag only if this story's world gives one. CB approves it with the rough board (the one gate). Every row is a must for the builder; the line-check sheet is ordered by its rows.
- THE STORY DECIDES, NEVER A TEMPLATE. The plan is a format, not content: it is written fresh from each script and no row is copied from another film. A close-up goes in only where it fits the scene (section 10: secondary, must match the scene). "The voice says it" is not a reason; the reason is what the thing does in the story. Rick's numbers (96 % shown on the word, about 40 % close) check the total at the end and are never a quota per line.
- A LIBRARY OF PIECES IS TECHNIQUE, NOT CONTENT. Proven pieces live in `templates/pieces/` (built 2026-11-15 from the armor film: 17 pieces; 12 as code = hop, laugh, hit, double tap, live stroke, "got it", "told you so", the motion helpers, highlight of a part, fly-and-hit, burst of living things, time pass; 5 as numbers only = push-in, low-angle close-up, fly through an object, fly-land-rest, the "hundreds" count). Read `templates/pieces/INDEX.md`: each entry says WHEN IT FITS and when not, and what must change. `node templates/pieces/prove.mjs` and `prove_fx.mjs` must print PASS after any edit there. Known limits: the amounts of lean, arm and head inside a move are still the armor characters' and need an animator for another body; effect files give numbers per frame, the look is built new in the film's set module; the first film that imports a piece tests ONE move through the kit first (`templates/pieces/STATE.md`). A plan row names the piece AND what changes for this story (object, light, character). A piece used unchanged is generic and fails Hard Rule No. 2.
- AUTOMATIC FRAME CHECKS BEFORE CB SEES A VERSION: `node tools/frame_checks/check.mjs <film.json>` (built and proven 2026-11-15; about 40 s per stretch, quarter size, one process). On every camera rest it tests, per character: head with hat cut by the frame edge; the figure cut through by a side edge; set geometry between the camera and the face, or the head inside a mesh; feet floating or sunk. It prints numbers, saves one small crop per FAIL and exits 1 on a FAIL. Every builder runs it before reporting, and the lead before CB sees a version. A version with a FAIL is not sent, unless the picture-plan row says in words that the figure at the edge is meant (a CLOSE on a thing with a face at the edge); such a waiver is named in the report. Proof: it caught three planted faults (head cut 23 %, body cut 49 %, head inside the engine) and found the Chief's face cut in half at the edge of the chalk close-up in the approved armor film (S1 frames 184-205), which nobody had seen. Limits: three.js stage only, not a Blender pass; one character covering another is not reported; a moving character is exempt on that frame; tuned on two stretches of one film.
- A NOTE FROM CB IS CHECKED AGAINST THE PLAN. Was the row there? If not, the row is added to the film's plan, and if the kind of thing was missing from the format, `templates/PICTURE_PLAN.md` gets the line, so the next film's plan catches it.

## RULES FROM OTHER SECTIONS THAT NAME YOUR SUBJECT
### from 0. How to work (before anything is built)
- THE ORDER OF WORK IS SECTION 11a (lean pipeline, 2026-11-15): story and voice, the one gate (whole film rough plus the hook moving), build out and polish, notes in batches, sound, grade. Older order, kept for the reasoning: script, voice, storyboard, movement, camera, look. Staging and story pictures first, look details last. Do not fix look details one at a time while the staging is wrong.

### from 1. Script and voice
- Voice = Energetic Storyteller, pace 1.0, a mood tag on EVERY line. ("set standard at 1.0", "it sound all too flat")
- THE FIRST TAKE IS ENERGETIC, AND A QUOTE SOUNDS LIKE ANOTHER PERSON. The first voice text already uses two- or three-word energy tags on every clause ("[excited, energetic, fast]", "[dramatic, building up]") and exclamation marks; no bare [soft]. Every quoted line gets a character tone clearly away from the narrator (pitch, pace or attitude: "[panicked, high-pitched, shouting]", "[smug, slow, deep voice]"), still the one narrator voice. Check by numbers before CB hears it: pitch range per sentence against the last approved take, and each quote at least about 2 semitones or a clear pace step away from its neighbours.

### from 2. Every picture (the mechanism)
- SILENT TEST: the action is acted out, so the story reads with the sound off. ("you understand the work without having the narration tell anything")

### from 3. World and look (Rick's 3D world, never a flat drawing)
- Colour: worlds pop, "make it art", no beige or grey worlds; one cool base plus ONE loud story accent on the hero object; colour changes with the chapter (day, dusk, night, rain). Characters must separate from the background.

### from 4. Characters
- MIX AND MATCH: every outfit, hat, piece and accessory in the libraries can be recoloured and combined across era and age; each choice must fit the story's period, place and character. Every new library item must take a colour option.

### from 6. Camera, transitions, effects, sound
- Effects (VFX) on actions and feelings, and a sound (SFX) on every action. Highlights must be seen. Fewer cuts.
- SOUND EFFECTS COME FROM CB'S LIBRARY: use real samples from <YOUR_SFX_FOLDER>, never synthetic stand-ins.
- MUSIC THEME FOLLOWS THE STORY, SOUND TIMED TO PICTURE (CB 2026-11-13 11:42 Bangkok: "add to the rules", lessons from the "boy astronaut balloon" feature-film prompt; full prompt in project files rules/CB_feature_film_prompt_2026-11-13.md): each film gets ONE memorable melody (sound-designer), stated at the start, changed at the low point (minor, slower or broken up) and returned in full at the end, landing its final chord on the payoff beat; it can be composed and synthesized in code (felt piano, strings, celesta, harp style) or cut from library music that does the same. Every action and place has its sound timed to the frame (wind, cloth, impacts, the signature light's sound). SOUND EFFECTS COME FROM CB'S LIBRARY still holds: real samples from ALL SOUND EFFECTS first; a synthesized effect only when the library has nothing for it, named as such in the sound sheet. The voice stays on top. Master the mix to about -16 LUFS integrated, true peak below -1 dBTP, and measure it.

### from 7. Before sending to CB (sign every line by looking, not by the gate report)
- Voice, captions and faces line up on the words.

### from 8. Build fixes learned (magic bell, 2026-11-11). Each one cost a re-render; check them bef
- Cloud bpy needs `apt-get install libegl1 libegl-mesa0`, or bpy dies silently with exit 134.
- Cloud renders die when the container idles: render each still in the foreground (res 55, 20 samples, about 8 min) and send results as they finish.

### from 9. LESSONS MERGED FROM THE SIDE NOTES (audit 2026-11-13; CB: "everything we learnd from th
Each line was said or approved by CB in an earlier thread and had lived only in `cloud_rules/` or `memory/`. Source per line: `references/reports/RULES_GAP_AUDIT_2026-11-13.md` (the audit is incomplete: its section 7 lists what was not read). Not merged, waiting for CB: NO SHADE ON FACES (it strikes four older lines), and the old "a hold is still a creep, the camera never stops" line, which CB replaced on 2026-11-13 (see CAMERA: FLY, LAND, REST in section 6).
- ONE VOICE, ALSO FOR QUOTED LINES. A character's quoted line is read by the same narrator voice with its own tone tag ([angry], [soft] ...). No second or third voice for characters, no cloned real-person voices. Reason: CB heard separate character voices and found them weird. Apply: the writer tags the quote line; the voice take is one speaker. Enforced by: writer check (one speaker id in the voice request).
- Music comes from <YOUR_MUSIC_FOLDER> the same way. Search both folders through the index first (rick-shorts\audio\library.py, library_index.csv) before any synthetic sound.

### from 10. THE PROVEN BUILD METHOD (pin stretch test, CB 2026-11-14: "Yes, rebuild film". Proof:
- CLOSE-UPS ON WHAT THE VOICE NAMES, AS A SECONDARY RULE THAT MUST MATCH THE SCENE. The scene comes first: its staging, its acting, the flow of the take. Where it fits that scene, the camera flies in and lands close on the thing the voice names, on the word, rests a beat and flies on; a named part may be highlighted with an effect. Never force a close-up on every noun and never chop a take into a string of inserts.
