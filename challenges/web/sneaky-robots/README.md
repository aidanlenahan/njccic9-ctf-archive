# Sneaky Robots

| Category | Points | Flag format |
|---|---|---|
| Web | 30 | case sensitive |

## Challenge briefing
Robots are everywhere... some could even be *[here](http://njccic9.ddns.net)*...

## Overview
The hint points at the CTF platform itself. The original CTFd instance (`njccic9.ddns.net`) had a custom `robots.txt` configured in the admin panel. It looks normal at first glance (`Disallow: /admin`), but a long run of blank lines pushes a comment to the bottom of the file that contains the flag.

In this archive the same file is served from the root of the static site: [`/robots.txt`](../../../robots.txt).

```
User-agent: *
Disallow: /admin

... (blank lines) ...

# njccic{beep-boop}
```

## Files
- [robots.txt](../../../robots.txt)

## Flag
```
njccic{beep-boop}
```
