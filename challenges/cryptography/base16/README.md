# Base 16 (^16)

| Category | Points | Flag format |
|---|---|---|
| Cryptography | 100 | case sensitive |

## Challenge briefing
<strong>Warning: this challenge is annoying.</strong>

[Good luck!](handout/challenge.txt)

## Overview
The string `njccic{wasted-your-time}` was hex (base 16) encoded **16 times** in a row. Each round doubles the length, so the handout is about 1.5 MB of hex. Decode it 16 times to get the flag.

The `steps/` folder has every intermediate value: [`step1.txt`](steps/step1.txt) is the plaintext and [`step17.txt`](steps/step17.txt) is the final handout.

## Hint
- **blatant instructions** (cost: 75 points): "encoded in base 16, *16 times*"

## Solution
```python
s = open("handout/challenge.txt").read().strip()
while not s.startswith("njccic{"):
    s = bytes.fromhex(s).decode()
print(s)
```
In CyberChef, chain **From Hex** 16 times.

## Flag
```
njccic{wasted-your-time}
```
