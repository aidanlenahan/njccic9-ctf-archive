# Rotazione

| Category | Points | Flag format |
|---|---|---|
| Cryptography | 20 | case sensitive |

## Challenge briefing
Decodifica haec, vexillum circumdatum est solitis "njccic{" et "}":

```alczlj-trvjri-nflcu-sv-giflu```

### Translation (Latin)
> Decode the following, the flag is surrounded by the usual "njccic{" and "}"

## Overview
The title is Italian for "rotation", a nudge toward a rotation (Caesar) cipher. The text was shifted by **17** (A → R), so shift it forward by 9 (or back by 17) to decode:

```
alczlj-trvjri-nflcu-sv-giflu  →  julius-caesar-would-be-proud
```

The translated instructions say to wrap the result in `njccic{` and `}`.

## Solution
CyberChef → **ROT13** with amount `9`, or:
```bash
echo alczlj-trvjri-nflcu-sv-giflu | tr 'a-z' 'j-za-i'
```

## Flag
```
njccic{julius-caesar-would-be-proud}
```
