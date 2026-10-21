"""Builds the static pages from src/ into the site root.

Run from anywhere:  python tools/build.py

Template syntax inside src/*.html
  <!-- @meta {"title": "...", "desc": "...", "path": "tariewe.html"} -->   first line of a page
  {{> partial}}                       inserts src/partials/partial.html
  {{var}}                             value from the page meta (or defaults below)
  {{img name|alt|sizes|class|eager}}  responsive <img> from assets/img/name-<w>.webp
  {{icon name}}                       Phosphor icon from the sprite
"""
import json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
MANIFEST = json.load(open(os.path.join(ROOT, "tools", "images.json"), encoding="utf-8"))
BASE = "https://obsidianstudiodesigns.github.io/seekoeigatkampterrein/"

DEFAULTS = {
    "base": BASE,
    "og_image": BASE + "og-image.jpg",
    "year": str(datetime.date.today().year),
    "home": "index.html",
    "head_extra": "",
    "robots": "index, follow, max-image-preview:large",
    "body_class": "",
    "ver": datetime.datetime.now().strftime("%Y%m%d%H%M"),
}


def img(arg):
    parts = [p.strip() for p in arg.split("|")]
    name, alt = parts[0], parts[1] if len(parts) > 1 else ""
    sizes = parts[2] if len(parts) > 2 and parts[2] else "100vw"
    cls = parts[3] if len(parts) > 3 else ""
    eager = len(parts) > 4 and parts[4] == "eager"
    m = MANIFEST[name]
    widths = m["sizes"]
    srcset = ", ".join(f"assets/img/{name}-{w}.webp {min(w, m['w'])}w" for w in widths)
    default = widths[1] if len(widths) > 1 else widths[0]
    attrs = [
        f'src="assets/img/{name}-{default}.webp"',
        f'srcset="{srcset}"',
        f'sizes="{sizes}"',
        f'width="{m["w"]}" height="{m["h"]}"',
        f'alt="{alt}"',
        'loading="eager" fetchpriority="high"' if eager else 'loading="lazy"',
        'decoding="async"',
    ]
    if cls:
        attrs.insert(0, f'class="{cls}"')
    return "<img " + " ".join(attrs) + ">"


def icon(name):
    return f'<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#{name.strip()}"></use></svg>'


def render(text, meta, depth=0):
    if depth > 5:
        raise SystemExit("partial recursion")
    text = re.sub(r"\{\{>\s*([\w-]+)\s*\}\}",
                  lambda m: render(open(os.path.join(SRC, "partials", m.group(1) + ".html"), encoding="utf-8").read(), meta, depth + 1),
                  text)
    text = re.sub(r"\{\{img\s+([^}]+)\}\}", lambda m: img(m.group(1)), text)
    text = re.sub(r"\{\{icon\s+([\w-]+)\s*\}\}", lambda m: icon(m.group(1)), text)

    def var(m):
        k = m.group(1)
        if k not in meta:
            raise SystemExit(f"unknown var {k}")
        return meta[k]
    return re.sub(r"\{\{(\w+)\}\}", var, text)


def main():
    built = []
    for f in sorted(os.listdir(SRC)):
        if not f.endswith(".html"):
            continue
        raw = open(os.path.join(SRC, f), encoding="utf-8").read()
        m = re.match(r"<!--\s*@meta\s*(\{.*?\})\s*-->\s*", raw, re.S)
        meta = dict(DEFAULTS)
        meta.update(json.loads(m.group(1)))
        meta["url"] = BASE + ("" if meta["path"] == "index.html" else meta["path"])
        if meta["path"] == "index.html":
            meta["home"] = ""
        out = render(raw[m.end():], meta)
        out = re.sub(r"\bR(\d{1,3}) (\d{3})\b", r"R\1&nbsp;\2", out)  # keep rand amounts on one line
        if "—" in out or "–" in out:
            raise SystemExit(f"{f}: contains an em or en dash")
        open(os.path.join(ROOT, f), "w", encoding="utf-8", newline="\n").write(out)
        built.append(f)
    print("built:", ", ".join(built))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
