"""Lean form of a rule text: every rule, number and pointer is kept; only provenance is dropped
(dates, quoted CB chat lines, "Why:" / "Proof:" history lines, '- [ ]' boxes, blank runs).
Used by tools/rules.py and tools/slice_rules.py (V1.2 token optimisation). Never edit rule files with it; it only prints/writes slices."""
import re, sys
# a (...) is dropped only when it is pure provenance: it starts with CB / a date / a time / a film-name history marker
PROV = re.compile(r"(?:CB\b(?! ?gate)|CB's\b|20\d\d-\d\d-\d\d|\d\d:\d\d ?(?:Z|Bangkok)|thread\b|same text as|same list as)", re.I)
PAREN = re.compile(r"\s?\((?:[^()]|\([^()]*\))*\)")
NUM_TARGET = re.compile(r"\d+(?:\.\d+)?\s*(?:%|px|f\b|s\b|ms|frames?|deg|x\b)")
def _paren(m):
    inner = m.group(0).strip()[1:-1].strip()
    if not PROV.match(inner): return m.group(0)
    # keep a provenance bracket if it also carries a measured target (numbers with units) outside quotes
    unq = re.sub(r'"[^"]*"', "", inner)
    # and keep it when it points at a file or tool (a path, a script)
    keep = NUM_TARGET.search(unq) or re.search(r"[\w-]+/[\w./-]+|\.(?:py|mjs|js|json|md)\b|section \d|full text", unq)
    return m.group(0) if keep else ""
def lean(t):
    t = t.replace("\r", "")
    t = re.sub(r"(?m)^(\s*)- \[[ x]\] ", r"\1- ", t)
    for _ in range(3): t = PAREN.sub(_paren, t)
    t = re.sub(r"(?m)^\s*(?:Why|Proof|History)\s*:.*\n?", "", t)          # whole-line history notes only
    t = re.sub(r"(?m)^\s*CB's wording \(kept\):.*\n?", "", t)
    t = re.sub(r"[ \t]+\n", "\n", t); t = re.sub(r"\n{3,}", "\n\n", t); t = re.sub(r"(?<=\S)  +", " ", t)
    return t
if __name__ == "__main__":
    a = open(sys.argv[1], encoding="utf-8").read(); b = lean(a)
    open(sys.argv[2], "w", encoding="utf-8", newline="\n").write(b)
    print(f"{len(a.encode()):>8,} -> {len(b.encode()):>8,}  ({100*len(b.encode())//len(a.encode())} %)")
