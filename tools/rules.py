"""Print ONLY the rule sections you need, in lean form (no dates, no CB quotes, no proof history; every rule kept).
Token rule T1/T10: never Read CB_RULES.md or rules/SKILL_FULL.md whole; use this.
  python tools/rules.py --phase story|build|finish|fix   # the sections the lead needs in that phase
  python tools/rules.py 5 7 11b                          # given sections of CB_RULES.md (R1, R2, 0-11, 6b, 11a-11d)
  python tools/rules.py --grep "contact shadow"          # every rule (bullet) that names the words, from CB_RULES + SKILL_FULL
  python tools/rules.py --toc                            # section list with sizes
  python tools/rules.py --full 5                         # the original wording with history (rarely needed)"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lean_text import lean
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(ROOT, "CB_RULES.md"); FULL = os.path.join(ROOT, "rules", "SKILL_FULL.md")
PHASE = {   # the lead's reading per phase (fresh lead session per phase, T7). Helpers read rules/dept/<dept>.md instead.
    "story":  ["R1", "R2", "0", "1", "2", "6b", "11a", "11d"],
    "build":  ["R1", "R2", "0", "2", "5", "7", "10", "11"],
    "finish": ["R1", "R2", "6", "7", "11b", "11c"],
    "fix":    ["R1", "R2", "7", "11b"],
}
def sections(text):
    out = {}; parts = re.split(r"(?m)^(?=## )", text)
    for p in parts[1:]:
        t = p.split("\n", 1)[0]
        m = re.match(r"## (RULE NO\. 1|HARD RULE NO\. 2|\d+b?)\b", t)
        k = {"RULE NO. 1": "R1", "HARD RULE NO. 2": "R2"}.get(m.group(1), m.group(1)) if m else t[3:23]
        out[k] = p
        for sub in re.split(r"(?m)^(?=### )", p)[1:]:          # 11a .. 11d
            sm = re.match(r"### (\d+[a-z])\.", sub)
            if sm: out[sm.group(1)] = sub
    return out
def main(a):
    book = open(BOOK, encoding="utf-8").read(); S = sections(book)
    if not a or a[0] in ("-h", "--help"): print(__doc__); return
    if a[0] == "--toc":
        for k, v in S.items(): print(f"{k:5s} {len(lean(v).encode()):7,d} B  {v.splitlines()[0][3:100]}")
        return
    if a[0] == "--grep":
        pat = re.compile(" ".join(a[1:]), re.I); n = 0
        for src in (BOOK, FULL):
            if not os.path.exists(src): continue
            for blk in re.split(r"\n(?=\s*- |\s*\d+\. |#)", open(src, encoding="utf-8").read()):
                if pat.search(blk) and not blk.startswith("#"):
                    print(f"[{os.path.basename(src)}] " + lean(blk).strip()[:1500] + "\n"); n += 1
                    if n >= 25: print("... more than 25 hits: narrow the words"); return
        return
    full = a[0] == "--full"; keys = PHASE[a[1]] if a[0] == "--phase" else (a[1:] if full else a)
    for k in keys:
        if k not in S: print(f"(no section {k})"); continue
        print(S[k] if full else lean(S[k]))
if __name__ == "__main__":
    try: sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception: pass
    try: main(sys.argv[1:])
    except (BrokenPipeError, OSError):   # output piped into head/tail
        try: os.dup2(os.open(os.devnull, os.O_WRONLY), sys.stdout.fileno())
        except Exception: pass
