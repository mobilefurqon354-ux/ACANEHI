# Start here (for Claude)

## Read order (V1.2 lean: same rules and output as V1.1, far fewer tokens)
1. `SKILL.md` (short entry: pipeline, interaction moves, token budget T1-T15).
2. Rules on demand, never whole files: `python tools/rules.py --phase story|build|finish|fix`, `python tools/rules.py <sections>`, `python tools/rules.py --grep <words>`.
3. A helper reads only its own lean slice in `rules/dept/` (see `rules/dept/INDEX.md`). There is no "lead" slice any more: the lead uses `tools/rules.py`.
4. Rebuild the slices with `python tools/slice_rules.py` (or `python install.py`) after any rule change. `CB_RULES.md` stays the master; `rules/SKILL_FULL.md` is the V1.1 skill text for reference.

## The lean pipeline in 6 steps
1. Pitch three true stories. The user picks one.
2. Script, facts and sources. Voice lines with a style tag on every clause. Then the picture plan (`templates/PICTURE_PLAN.md`).
3. Look bible, cast and sets. Hero props are built first. Helpers work in parallel, each with its rule slice.
4. The one gate: the whole film as a rough board, plus the hook moving. The user approves it, or says what to change.
5. After the gate, Claude works alone: build, render on the GPU (`render_gpu.mjs`), sound, grade, join. Measure numbers before looking at pictures. A fix round uses a fresh helper.
6. Final film, `YOUTUBE.md` with titles, and the token report.

## Example film
`examples/lightning-spear/` holds the docs and code of one finished film: script, cast, look bible, picture plan, edit list, briefs, sets, grade, join and sound mix. It has no frames, no video and no audio. Copy its layout for a new film in `episodes/<name>/`.
