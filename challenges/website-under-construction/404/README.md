# 404

| Category | Points | Flag format |
|---|---|---|
| Website Under Construction | 20 | case sensitive |

## Challenge briefing
Which page shows up when you try accessing a page that doesn't exist?

https://aidanlenahan.github.io/njccic9-ctf/

## Overview
Browse to any page that doesn't exist (or straight to `/404.html`). GitHub Pages serves the site's custom 404 page. Move the cursor around until a hidden **Submit** button appears in the lower right-hand corner. Clicking it opens `/assets/css/supersecretfile.txt`, a long text file with the flag at the very bottom.

## Files
- [supersecretfile.txt](supersecretfile.txt)
- [404.html source](../site/404.html)
- [Website Under Construction](https://aidanlenahan.github.io/njccic9-ctf)

## Flag
```
njccic{S3CR3T-2978}
```
