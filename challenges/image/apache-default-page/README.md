# Apache Default Page

| Category | Points | Flag format |
|---|---|---|
| Image | 30 | case sensitive |

## Challenge briefing
This challenge is really easy. Read the file to get the flag.

[Instructions](handout/instructions.png)

## Overview
The handout [`Apache2-default.png`](handout/Apache2-default.png) is not actually a PNG: it is a PDF with the wrong extension. Image viewers refuse to open it. Checking the magic bytes gives it away:

```bash
file handout/Apache2-default.png
# handout/Apache2-default.png: PDF document
```

Rename it to `.pdf` (or open it directly with a PDF viewer). The flag is written about halfway down the page, on the right-hand side of the "Apache2 Default Page" text.

## Files
- [Apache2-default.png](handout/Apache2-default.png): challenge file
- [original.pdf](original.pdf): the original PDF
- [instructions.png](handout/instructions.png)

## Flag
```
njccic{wr0ng-f!le-3xt}
```
