---
name: ricks-clips-v1-1
description: "Ricks Clips Animation Skill V1.2 (lean): makes Ricks Clips style 3D cartoon true-story Shorts with the lean pipeline and the kit3d look. Same rules and output as V1.1, read on demand to save tokens."
---

# Ricks Clips animation (V1.2 lean entry)

This file is the ENTRY only. Every rule of V1.1 still applies and nothing about the look, the motion or the render changed. What changed is HOW the rules are read: on demand, per phase, in lean form, so a film costs far fewer tokens.
- The rule book is `CB_RULES.md` (master; it wins). The old 172 KB main skill text is `rules/SKILL_FULL.md` (reference only).
- **NEVER Read `CB_RULES.md`, `rules/SKILL_FULL.md`, `WORKFLOW.md` or `CINEMATOGRAPHY.md` top to bottom.** Print what you need:
  - `python tools/rules.py --phase story|build|finish|fix` = the sections the lead needs in that phase (lean form: every rule and number, no dates, quotes or history).
  - `python tools/rules.py 3 8` = given sections; `python tools/rules.py --toc` = section list; `python tools/rules.py --grep "contact shadow"` = every rule that names the words, from both books.
- Helpers read ONLY `rules/dept/<department>.md` (`python tools/slice_rules.py` rebuilds them; never edit them).

## Rule No. 1 and Hard Rule No. 2 (unchanged)
1. Make a Rick-quality video. Every picture and clip is put beside a Rick frame of the same kind of shot before CB sees it; clearly weaker = not done.
2. Nothing generic passes; everything is ultra detailed (world, props, light, acting, motion, camera).

## The lean pipeline (CB_RULES 11a; full text `python tools/rules.py 11a`)
| # | Step | Who | Gate / command |
|---|---|---|---|
| 1 | Story (one unless CB asks for a choice), facts, script with seconds per line | lead + `writer` | `tools/measure/script_stats.py`; CB OK |
| 2 | Voice, `words.json`, then `PICTURE_PLAN.md` (`templates/PICTURE_PLAN.md`: one row per named thing/action, the word it lands on, what we see, CLOSE / IN SCENE / NOT SHOWN and why, feeling, and the INTERACTION verb, see below) | `writer` + lead | pace 3.5-4.5 words/s |
| 3 | `film.json` (cast, places, props, takes, acts, fx, moods, sound, camera_idea) | lead + `camera-director` | `python tools/film_plan.py check episodes/<name>/film.json`: 0 FAIL, max 2 WARN |
| 4 | THE ONE GATE: whole film rough (2-3 real three.js key frames per line, one builder per stretch, 60-90 min cap, no polish) + the hook moving 10-15 s | stretch builders (`agents/STRETCH_BUILDER_BRIEF.txt`) | `node tools/frame_checks/check.mjs <film.json>` 0 FAIL; CB says yes/no |
| 5 | Build out and polish the stretches in parallel from ONE shared `sets/` folder, colours in from day one (11c) | fresh builder per round | frame checks 0 FAIL; `python tools/check_film.py <mp4> --film <film.json>` 0 FAIL |
| 6 | CB notes in batches: one fix round per version, aim two rounds | fresh helper per round | numbers first |
| 7 | Sound (`sound_events.json`), then the grade (last picture step), captions, delivery | `sound-designer`, `editor-compositor` | mix gates, `short_qa`, `python tools/token_report.py` into HANDOFF.md |
**`"kit3d": true` is MANDATORY in every film.json** (V1.2): there is no Blender layer by default, so the coded frame carries real PBR metal, surface relief, a volume sky and detailed trees (`templates/threejs_film/PBR_FEATURES.md`). `film_plan.py check` FAILS without it. A place may switch it off only with `"kit3d_off_why"`. Blender layers only when CB asks, for a shiny/glass/wet hero object covering at least 1.5 % of the frame, tested on 2 frames first.
Kit (`templates/threejs_film/`): `node render.mjs film.json --storyboard | --animatic | --frames 0,45 | --visibility | --export-lock`; GPU: `render_gpu.mjs`. A Blender layer and a set repaint run only when CB asks by name (11a). One folder per film: `episodes/<name>/` with `s2/`, `v3/`, `_tmp/` inside.
Stage table, crew table and older stage gates: `python tools/rules.py --grep "THE PIPELINE"` or open `rules/SKILL_FULL.md` at the heading you need (Grep for it, then Read with offset/limit).

## Characters MOVE and INTERACT (V1.2, as in Rick's clips)
Every line where the voice names a verb that a character does to a thing or to another person is acted as a MOVE ON THE PROP, never a static pose next to it: the hand ends ON the object, the object moves because the body moved it (held, lifted, thrown on a gravity arc, set down and settling), and the other character reacts.
- Library (`templates/motion_styles`, played in the film kit as `"pose": "m:<id>+props"`): walk, run, sit, crawl, ladder, carry, push, dig, hammer, drink, eat, phone, write, handshake, counter, sneak, window, ... and NEW in V1.2 `moves/act_interact.mjs`:
  `emerge` (climb out of a hole / tunnel), `lift` (heavy lid, cover, crate), `grab` (grab and stuff a bag: robbery, packing), `toss` (search and fling things: cell search, ransack), `place` (set down on a belt, table, counter), `give` (hand over between two characters: polite / snatch / tug of war), `talk` (two characters: chat / argument / secret whisper); and `moves/act_interact2.mjs`: `point`, `open` (door), `knock`, `climbover` (wall/fence), `cards` (two seated at a table), `shove`, `catch` (throw and catch), `duck` (hide/cower behind cover), `frisk` (guard pat-down), `unlock` (key/lock pick), `salute`, `pull` (lever/rope), `highfive` (high five / fist bump), `escort` (guard walks a prisoner). 21 actions, each with 3 styles picked by feeling via `pick({ action, feeling, energy })` and `actionFromText(line)`.
- Every move is a studio-motion sequence: notice, anticipation (counter-move), snap action, overshoot, settle 8-12 f, then DEAD STILL (blinks only). Two-character beats use the `{ poses: [...] }` form so both act in the same clock.
- PICTURE_PLAN gets a column `interaction` (verb + prop + library id, e.g. `lift lid -> m:lift/C+props`). A row whose voice names an action with no interaction move fails the plan.
- A missing action: copy the nearest move file pattern (pose(t, ch) -> pose), 3 styles, register it in `library.mjs` (LIB + ACTION_WORDS), preview with `node render.mjs moves/<file>.mjs#<export> out/x.png --still 0.5,1.5,2.5` and look at ONE small sheet.

## Token budget rules (CB_RULES 11b T1-T9, plus V1.2 T10-T15). They bind the lead and every helper.
- T1 Read only your slice / phase (above). T2 A fresh helper per fix round; handover in `STATE.md` (max 60 lines). T3 Numbers before pictures. T4 One command per cycle; long runs in the background, no polling. T5 Reports max 25 lines; detail in files. T6 Mechanical work (render, join, measure, mix, file moves, fact checks) on `model: sonnet` or `haiku`. T7 A fresh lead session per phase (story / build / finish), started from HANDOFF.md. T8 Grep `tools/`, `templates/`, the last episode before building anything. T9 `python tools/token_report.py` at delivery.
- T10 Never Read a file over 40 KB whole. Grep first, then Read with offset/limit. Code files (`film.js`, `puppets.mjs`, `poses.mjs`, `library.mjs`, `char2d.mjs`) are grepped for the export or key you need, never read through.
- T11 Pictures cost tokens: look at ONE contact sheet at most 1,600 px wide (`ffmpeg ... scale=1600:-1`), never single full-size frames, max 4 pictures per check round. Rick reference frames: the board made once by `rick-researcher`, never re-extracted.
- T12 Spawn only the departments a step needs. Before the gate: writer, camera-director, stretch builders. Sets/props/light/vfx/sound departments start only for the work the board shows is missing. Never the whole crew at once; never a judge before the gate; a judge at most once per version.
- T13 Pass paths, not content: a brief names files; it never pastes rule text, film.json or tool output into the prompt.
- T14 Command output into files: long logs go to `_tmp/*.log`; print only the summary lines (`| tail -20`, the gate's PASS/FAIL table).
- T15 Do not re-read what is in context: a file read once this session is not read again unless it changed.

## Where things are
`CB_RULES.md` rule book (master) · `rules/SKILL_FULL.md` V1.1 skill text · `rules/dept/` helper slices · `tools/rules.py` rule printer · `tools/slice_rules.py` slicer · `agents/` crew (installed by `install.py`) · `agents/STRETCH_BUILDER_BRIEF.txt` builder brief · `templates/threejs_film/` storyboard/animatic kit · `templates/motion_styles/` move library (`README.md`) · `templates/pieces/INDEX.md` proven pieces · `templates/vector2d_characters/` locked cast · `templates/film_example/film.json` plan that passes every gate · `templates/PICTURE_PLAN.md` · `templates/LOOK_BIBLE_template.md` · `examples/lightning-spear/` a finished film's docs.
CB gates and locked parts (cast, faces, MAIN LOOK, voice) are unchanged: `python tools/rules.py 0` and `--grep "ALWAYS need CB"`.
After a change to this file or `agents/`, run `python install.py` (installs the skill and the agents, rebuilds the slices).
