# Layers *(unreleased)*

| Category | Points | Flag format |
|---|---|---|
| Cryptography | 50 | case sensitive |

> This challenge was created but left **hidden** on the live CTFd instance, and no flag was ever configured for it. It is not on the static CTF board.

## Challenge briefing
```=0TS300VTp0TNR1MThEW10ESUl1UYVjQPdFR0EEWzYUT```

rot13 => base32 => base64 => reverse

## Overview
The briefing lists the encoding order. Undo it from the outside in:

1. **Reverse** the string
2. **Base64 decode** → `MF3XA4DWOB5XSYTHM5XHS3TMOJSWM7I=`
3. **Base32 decode** → `awppvp{ybggnynlref}`
4. **ROT13** → `njccic{lottalayers}`

## Solution
```python
import base64, codecs
s = "=0TS300VTp0TNR1MThEW10ESUl1UYVjQPdFR0EEWzYUT"[::-1]
s = base64.b32decode(base64.b64decode(s)).decode()
print(codecs.decode(s, "rot13"))
```

## Flag
```
njccic{lottalayers}
```
