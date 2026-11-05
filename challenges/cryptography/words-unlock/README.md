# Words Unlock

| Category | Points | Flag format |
|---|---|---|
| Cryptography | 30 | case insensitive |

## Challenge briefing
What language were the instructions of the [Rotazione](../rotazione/README.md) challenge in?

```yjvkvn{feit-fnewpvew!}```

## Overview
The instructions of Rotazione were written in **Latin**. That word is the key to a Vigenère cipher. Decrypting `yjvkvn{feit-fnewpvew!}` with the key `latin` gives the flag. The key only advances on letters, so the punctuation stays in place.

## Solution
CyberChef → **Vigenère Decode**, key `latin`.

## Flag
```
njccic{flag-unlocked!}
```
(case insensitive)
