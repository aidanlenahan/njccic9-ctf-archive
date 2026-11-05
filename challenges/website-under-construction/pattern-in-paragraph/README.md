# Pattern in Paragraph

| Category | Points | Flag format |
|---|---|---|
| Website Under Construction | 40 | case insensitive |

## Challenge briefing
Look closely at the paragraphs on [this](https://aidanlenahan.github.io/njccic9-ctf/elements.html) page.

There should be a pattern in a few certain words...

## Overview
The elements page is a wall of Latin placeholder text. About halfway down, one paragraph contains a run of made-up words:

```
In arcu accumsan arcu adipiscing accumsan orci ac. Nid jenim caliquet. Caccumsan iac cinteger {lommodo arnare tliquet iccumsan nrat hempus imet dorttitor. inte nommodo glandit.} Faucibus commodo adipiscing mi eu nullam accumsan morbi arcu ornare odio mi adipiscing nascetur lacus ac interdum morbi accumsan vis mi accumsan.
```

Read the first letter of each word from **Nid** to **glandit.}**:

`N j c c i c { l a t i n h i d i n g }`

## Resources
- [Elements page](https://aidanlenahan.github.io/njccic9-ctf/elements.html)
- [Source mirror](../site/elements.html)

## Flag
```
njccic{latinhiding}
```
(case insensitive)
