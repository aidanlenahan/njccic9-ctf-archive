# Metadata

| Category | Points | Flag format |
|---|---|---|
| Website Under Construction | 40 | case sensitive |

## Challenge briefing
Take a look at a few of the images on the [website](https://aidanlenahan.github.io/njccic9-ctf). Maybe you can find the flag using one of the images...

## Overview
The homepage uses an image called `city.jpg`. Its EXIF **Maker Note** field contains the flag (inserted with EXIFdata.com). Download the image and read its metadata:

```bash
exiftool city.jpg | grep -i maker
```

Online EXIF viewers work as well.

## Files
- [city.jpg](city.jpg)
- [Website Under Construction](https://aidanlenahan.github.io/njccic9-ctf)

## Flag
```
njccic{ex!f-data-is-sneaky}
```
