# V1.2 lean (2026-11-21)
Same rules, same look, same motion quality and render path as V1.1. Only how the rules are read changed, plus new interaction moves.
- SKILL.md is now a ~10 KB entry (was 172 KB, loaded on every call). The V1.1 text is kept as `rules/SKILL_FULL.md` (reference, grep only).
- `tools/rules.py`: prints the lead's sections per phase (`--phase`), single sections, or every rule that names a word (`--grep`), in lean form (dates, CB quotes and history lines dropped; every rule, number and path kept: checked by script, 0 rule names, 0 paths lost).
- `tools/slice_rules.py` writes lean slices; helpers get section 11b+11d instead of all of 11; the 150 KB `rules/dept/lead.md` copy is gone.
- New token rules T10-T15 (CB_RULES 11b): no whole reads of big files, picture budget, only the departments a step needs, paths not content, logs in files, no re-reads.
- `"kit3d": true` is now mandatory (SKILL.md, CB_RULES 11c, `templates/film_example/film.json`) and `film_plan.py check` has two new look gates: kit3d on for the whole film (FAIL), and no place switched off without `kit3d_off_why`.
- More moves: `act_interact2.mjs` adds 14 actions x 3 styles (point, open, knock, climbover, cards, shove, catch, duck, frisk, unlock, salute, pull, highfive, escort). The library now has 258 styles; 63 of them are interaction styles.
- Fixed: faces `sneaky`, `shocked`, `scared` do not exist in the face set and fell back to a blank face; the interaction moves use `sus`, `jawdrop`, `terrified`.
- New rule (CB_RULES section 5): CHARACTERS INTERACT. New moves `templates/motion_styles/moves/act_interact.mjs`: emerge, lift, grab, toss, place, give, talk (3 styles each, in the picker). PICTURE_PLAN has an `interaction` column.
- Removed from the package (no effect on output): `.agents/` (install.py regenerates it), two `_backup_CB_RULES_*` reports, `lock2.before_batch_remove_2026-11-12.py`. `rules/CB_RULES.md` re-synced with the master (it was missing three 2026-11-15 rules).

# Changelog

## V1.1 (2026-11-15)

### New
- The lean pipeline: one gate for the user (whole film rough board plus the hook moving), then Claude works alone to the final.
- Rule slices per helper (`rules/dept/`).
- A fresh helper for every fix round.
- Numbers before pictures.
- A token report for every film.
- The look kit kit3d:
  - PBR metal with the sky as reflection.
  - Real-size relief surfaces.
  - Painted storm skies with flash.
  - Kit trees.
  - Real lightning, `fx_bolt`.
  - Hero props built first.
- Face fixes and long-cloth fixes.
- First film on V1.1: 716M tokens instead of 1.66B. 8.9 hours of real work instead of 22.7 hours.

### Bug fixes
- `castkit` ignored `faceShadow`. Fixed.
- `costume_shade` darkened white drawn pixels. Fixed with `keep_drawn_light`.
- Legs are now drawn over long cloth in moves.
- GPU render is now the default (`render_gpu.mjs`).

### Known issue
- The storm sky goes black at a long lens.
