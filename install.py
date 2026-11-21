"""Ricks Clips Animation Skill V1.2 (lean) installer.
Run once from the skill folder:   python install.py
It does three things:
 1. Replaces <SKILL_ROOT> in every text file with the real path of this folder (so the briefs work).
 2. Writes ~/.claude/skills/ricks-clips-v1-1/SKILL.md (same text, absolute paths).
 3. Copies agents/*.md to ~/.claude/agents/ (same paths made absolute).
It is safe to run again, also after you move the folder."""
import os, re, glob, sys
ROOT = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
HOME = os.path.expanduser("~")
MARK = os.path.join(ROOT, ".install_root")
TEXT = (".md", ".txt", ".py", ".mjs", ".js", ".json", ".sh", ".html", ".csv", ".css", ".tsx", ".ts")
PLACE = "<SKILL_ROOT>"

# 1. placeholder -> real path (and old real path -> new real path if the folder was moved)
old = open(MARK, encoding="utf-8").read().strip() if os.path.exists(MARK) else None
targets = [PLACE] + ([old] if old and old != ROOT else [])
changed = repl = 0
for dp, dn, fn in os.walk(ROOT):
    dn[:] = [d for d in dn if d not in ("node_modules", ".git")]
    for f in fn:
        if not f.lower().endswith(TEXT) or f == "install.py": continue
        p = os.path.join(dp, f)
        try: s = open(p, "rb").read().decode("utf-8")
        except Exception: continue
        o = s
        for t in targets: s = s.replace(t, ROOT)
        if s != o:
            changed += 1; repl += sum(o.count(t) for t in targets)
            open(p, "wb").write(s.encode("utf-8"))
open(MARK, "w", encoding="utf-8").write(ROOT)
print("paths: %d replacements in %d files -> %s" % (repl, changed, ROOT))

FRONT = re.compile(r"\A---\n(.*?)\n---\n", re.S)
REL = r"(?<![\w/\.:-])(templates|tools|references|library|examples|agents|rules)/"
def absolutize(s):
    return re.sub(REL, ROOT + r"/\1/", s)

# 2. skill
master = open(os.path.join(ROOT, "SKILL.md"), encoding="utf-8").read()
m = FRONT.match(master)
front, body = m.group(0), master[m.end():]
body = absolutize(body)
for n in ("CB_RULES.md", "WORKFLOW.md", "CINEMATOGRAPHY.md", "install.py"):
    body = body.replace("`%s`" % n, "`%s/%s`" % (ROOT, n))
body = re.sub(r"\]\((WORKFLOW|DENSITY_RULES|FILE_GUIDE|CINEMATOGRAPHY|CB_RULES|START_HERE|README)\.md\)",
              lambda k: "](%s/%s.md)" % (ROOT.replace(" ", "%20"), k.group(1)), body)
note = "\n> Installed copy of `%s/SKILL.md`. Run `python \"%s/install.py\"` again after you change the master.\n" % (ROOT, ROOT)
dst = os.path.join(HOME, ".claude", "skills", "ricks-clips-v1-1")
os.makedirs(dst, exist_ok=True)
open(os.path.join(dst, "SKILL.md"), "w", encoding="utf-8", newline="\n").write(front + note + body)
print("skill  ->", os.path.join(dst, "SKILL.md"))

# 3. agents
adst = os.path.join(HOME, ".claude", "agents"); os.makedirs(adst, exist_ok=True)
for p in sorted(glob.glob(os.path.join(ROOT, "agents", "*.md"))):
    a = open(p, encoding="utf-8").read(); mm = FRONT.match(a)
    h, b = (mm.group(0), a[mm.end():]) if mm else ("", a)
    b = absolutize(b)
    for n in ("CINEMATOGRAPHY.md", "SKILL.md", "CB_RULES.md"):
        b = b.replace("`%s`" % n, "`%s/%s`" % (ROOT, n))
    open(os.path.join(adst, os.path.basename(p)), "w", encoding="utf-8", newline="\n").write(h + b)
    print("agent  ->", os.path.basename(p))

# 4. Antigravity skill & agents (workspace .agents/ and global ~/.gemini/config/plugins/cartoon-3d-short/)
import json
for agy_root in [
    os.path.join(ROOT, ".agents"),
    os.path.join(HOME, ".gemini", "config", "plugins", "cartoon-3d-short"),
]:
    s_dir = os.path.join(agy_root, "skills", "cartoon-3d-short")
    a_dir = os.path.join(agy_root, "agents")
    os.makedirs(s_dir, exist_ok=True)
    os.makedirs(a_dir, exist_ok=True)
    agy_front = front.replace("name: ricks-clips-v1-1", "name: cartoon-3d-short")
    open(os.path.join(s_dir, "SKILL.md"), "w", encoding="utf-8", newline="\n").write(agy_front + note + body)
    for p in sorted(glob.glob(os.path.join(ROOT, "agents", "*.md"))):
        a = open(p, encoding="utf-8").read(); mm = FRONT.match(a)
        h, b = (mm.group(1), a[mm.end():]) if mm else ("", a)
        b = absolutize(b)
        for n in ("CINEMATOGRAPHY.md", "SKILL.md", "CB_RULES.md"):
            b = b.replace("`%s`" % n, "`%s/%s`" % (ROOT, n))
        bname = os.path.splitext(os.path.basename(p))[0]
        desc_m = re.search(r"^description:\s*(.+)$", h, re.M)
        desc = desc_m.group(1).strip() if desc_m else bname
        if bname == "storyboard-judge":
            tools_str = "[read_file, run_command, manage_task]"
        else:
            tools_str = "[read_file, edit_file, write_file, run_command, manage_task, search_web]"
        agy_a_front = (
            "---\n"
            f"name: {bname}\n"
            f"description: {desc}\n"
            "subagent: true\n"
            "mainAgent: false\n"
            f"tools: {tools_str}\n"
            "---\n"
        )
        open(os.path.join(a_dir, os.path.basename(p)), "w", encoding="utf-8", newline="\n").write(agy_a_front + b)
plugin_dir = os.path.join(HOME, ".gemini", "config", "plugins", "cartoon-3d-short")
plugin_json = {
    "name": "cartoon-3d-short",
    "displayName": "Ricks Clips Animation Skill V1.2 (lean)",
    "version": "1.2.0",
    "description": "Ricks Clips V1.1 3D cartoon true-story Shorts skill with 150 characters (15 sheets), golden character views, kit3d PBR GPU renderer, and 16 specialized production agents.",
    "suggestedPrompts": [
        "Read START_HERE.md, then make me a new Ricks Clips style short. Pitch me three true stories first.",
        "Render the storyboard and GPU preview for an episode.",
        "Design a new character on the V1.1 vector2d rig."
    ]
}
open(os.path.join(plugin_dir, "plugin.json"), "w", encoding="utf-8", newline="\n").write(json.dumps(plugin_json, indent=2) + "\n")
print("Antigravity V1.2 plugin & 16 agents ->", plugin_dir)
import subprocess
subprocess.run([sys.executable, os.path.join(ROOT, "tools", "slice_rules.py")], check=False, stdout=subprocess.DEVNULL)   # V1.2: lean rule slices
print("slices -> rules/dept/ (lean)")
print("Done. Next: open Claude Code in this folder and paste the first prompt from INSTALL.md.")
