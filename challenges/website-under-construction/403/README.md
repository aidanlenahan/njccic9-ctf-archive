# 403

| Category | Points | Flag format |
|---|---|---|
| Website Under Construction | 50 | case insensitive |

## Challenge briefing
Why do I get a 403 error when trying to access [this page?](https://aidanlenahan.github.io/njccic9-ctf/postlogin.html) If only there was a way...

## Overview
`postlogin.html` shows a fake **403 Forbidden** unless you are "logged in". The site also has a `login.html`, and its page source holds the credentials in plaintext:

- username: `mscott`
- password: `worldsbestboss`

Sign in with them and the login page redirects to `postlogin.html`, which now shows the flag as ASCII art.

### Author notes
The login and post-login pages were made with ChatGPT's help. Because the site is hosted on GitHub Pages, a plaintext flag on `postlogin.html` could be read straight from the repository. To stop that, the flag is rendered as obfuscated [ASCII art](https://www.asciiart.eu/text-to-ascii-art). An earlier version that base64-encoded and reversed the art never worked reliably, so it was simplified.

## Resources
- [login.html](https://aidanlenahan.github.io/njccic9-ctf/login.html) ([source mirror](../site/login.html))
- [postlogin.html](https://aidanlenahan.github.io/njccic9-ctf/postlogin.html) ([source mirror](../site/postlogin.html))

## Flag
```
njccic{insecure-creds}
```
(case insensitive)
