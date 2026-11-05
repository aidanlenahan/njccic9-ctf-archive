# Bees

| Category | Points | Flag format |
|---|---|---|
| Image | 20 | case sensitive |

## Challenge briefing
Did you know QR codes could store tons of data?

## Overview
The handout [`bee.png`](handout/bee.png) is a very dense QR code. Phone scanners often choke on it, so use a desktop decoder. The payload is a large block of bee-themed text; the flag is buried inside it.

## Solution
```bash
zbarimg --raw handout/bee.png | grep -o 'njccic{[^}]*}'
```
CyberChef's **Parse QR Code** operation followed by a **Regular expression** search for `njccic\{.*?\}` works too.

## Files
- [bee.png](handout/bee.png)

## Flag
```
njccic{h0n3y}
```
