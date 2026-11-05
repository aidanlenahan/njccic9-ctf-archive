# NJCCIC Group 9 CTF: Archive

The NJCCIC Advanced Internship Group 9 CTF, all in one repo:

- **A playable static CTF board** that looks and works like CTFd (challenges, flag submission, hints, solves, scoreboard, users). It runs entirely in the browser and saves progress in `localStorage`.
- **Writeups** for every challenge as Markdown.
- **Challenge files and sources** from the old `njccic9-ctf`, `njccic9-ctf-admin` and `njccic9-ctfd` repos.

## Play

Open the GitHub Pages site for this repo, or run it locally:

```bash
python -m http.server 8000
```

Then browse to <http://localhost:8000>. Opening `index.html` straight from disk also works, but writeups only load over HTTP.

- Flags are checked against salted SHA-256 hashes (`assets/data.js`), so they aren't visible in the page source.
- Solves, hint unlocks and your display name are saved in your browser. Export, import or reset them on the **Settings** page.
- The other players on the scoreboard are a snapshot of the live event.
- After you solve a challenge, its modal shows a **Writeup** button. You can also open any writeup from **Writeups** (with a spoiler warning).

## Repo layout

```
index.html, assets/          static CTF board (app.js, app.css, sha256.js, generated data.js)
theme/                       CTFd 3.8 core theme CSS + fonts (from the scraped CTFd site)
img/                         CTF logo, favicon, banner
robots.txt                   the "Sneaky Robots" robots.txt, served from the site root
data/archive.json            sanitized scoreboard snapshot (names + solve times only)
tools/build.py               regenerates assets/data.js from the challenge folders
challenges/<category>/<challenge>/
    README.md                writeup
    challenge.json           metadata: name, points, description, flag, hints, files
    handout/                 files given to players
    ...                      extra author files (originals, intermediate steps)
challenges/website-under-construction/site/
                             source mirror of the "WebUC" site (web branch of njccic9-ctf)
```

## Challenges

| Category | Challenge | Points | Writeup |
|---|---|---|---|
| Welcome | Hello, World! | 10 | [writeup](challenges/welcome/hello-world/README.md) |
| Web | Robots | 50 | [writeup](challenges/web/robots/README.md) |
| Web | Sneaky Robots | 30 | [writeup](challenges/web/sneaky-robots/README.md) |
| Image | Bees | 20 | [writeup](challenges/image/bees/README.md) |
| Image | Apache Default Page | 30 | [writeup](challenges/image/apache-default-page/README.md) |
| Website Under Construction | Buttons | 20 | [writeup](challenges/website-under-construction/buttons/README.md) |
| Website Under Construction | 404 | 20 | [writeup](challenges/website-under-construction/404/README.md) |
| Website Under Construction | Pattern in Paragraph | 40 | [writeup](challenges/website-under-construction/pattern-in-paragraph/README.md) |
| Website Under Construction | Metadata | 40 | [writeup](challenges/website-under-construction/metadata/README.md) |
| Website Under Construction | 403 | 50 | [writeup](challenges/website-under-construction/403/README.md) |
| Website Under Construction | Search | 40 | [writeup](challenges/website-under-construction/search/README.md) |
| Cryptography | Rotazione | 20 | [writeup](challenges/cryptography/rotazione/README.md) |
| Cryptography | Words Unlock | 30 | [writeup](challenges/cryptography/words-unlock/README.md) |
| Cryptography | Base 16 (^16) | 100 | [writeup](challenges/cryptography/base16/README.md) |
| Cryptography | Layers *(unreleased)* | 50 | [writeup](challenges/cryptography/layers/README.md) |
| OSINT | Old Compression, Older Mistakes | 40 | [writeup](challenges/osint/old-compression/README.md) |

## Editing challenges

1. Edit `challenges/<category>/<challenge>/challenge.json` (and the writeup next to it).
2. Run `python tools/build.py` to regenerate `assets/data.js`.
3. Commit both.

Set `"hidden": true` to keep a challenge off the board while keeping its writeup.

## Notes

- The "Website Under Construction" challenges link to the live WebUC site at <https://aidanlenahan.github.io/njccic9-ctf>, which is served from the `web` branch of `njccic9-ctf`. The 404 challenge depends on that site's root-level `404.html`, so keep that repo's Pages site running. A copy of its source is in `challenges/website-under-construction/site/` for reference.
- The original CTFd server (`njccic9.ddns.net`) is gone. Links to it were changed to point at this site.
- Not included on purpose: the full CTFd backup (`ctfd-export.zip`), the raw CTFd database export (it has password hashes, emails and IPs), and the VM details (`vminfo.json`). They're still in the private `njccic9-ctf-admin` repo.
