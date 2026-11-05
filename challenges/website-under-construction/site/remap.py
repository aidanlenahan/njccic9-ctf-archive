#!/usr/bin/env python3
"""
remap_font.py

Usage:
    python remap_font.py source_font.ttf secretfont.ttf

Requirements:
    pip install fonttools

What it does:
    - Loads source_font.ttf
    - Builds mapping to replace the glyph mapping for the visible phrase
      "Welcome to secret lab!" so that each visible char displays the glyph
      of the corresponding character from the flag: njccic{sne@kyfont3809}
    - Writes out secretfont.ttf which you can include on your website.
Notes:
    - The script assumes the source font already contains glyphs for all
      target characters (letters, digits, punctuation). Use a full Latin font
      like DejaVuSans or LiberationSans to be safe.
"""
import sys
from fontTools import ttLib

# YOU CAN CHANGE THESE:
VISIBLE_PHRASE = "Welcome to secret lab!"   # length 22
FLAG = "njccic{sne@kyfont3809}"             # length 22

if len(VISIBLE_PHRASE) != len(FLAG):
    print("VISIBLE_PHRASE and FLAG must be same length.")
    print(len(VISIBLE_PHRASE), len(FLAG))
    sys.exit(1)

def main(src_path, out_path):
    font = ttLib.TTFont(src_path)

    # Use the "best cmap" mapping: {codepoint: glyphName}
    best_cmap = font.getBestCmap()
    if not best_cmap:
        print("Font does not contain a cmap table we can use.")
        sys.exit(1)

    # Build a reverse mapping glyphName -> codepoint for targets (helpful lookups)
    glyph_for_codepoint = best_cmap  # codepoint -> glyphName

    # Build mapping: visible_codepoint -> glyphName_of_target_char
    mapping = {}
    for vis_ch, tgt_ch in zip(VISIBLE_PHRASE, FLAG):
        vis_cp = ord(vis_ch)
        tgt_cp = ord(tgt_ch)
        if tgt_cp not in glyph_for_codepoint:
            print(f"Error: target character '{tgt_ch}' (U+{tgt_cp:04X}) not present in source font cmap.")
            print("Choose a different source font that contains that glyph (e.g., DejaVuSans.ttf).")
            sys.exit(1)
        glyph_name = glyph_for_codepoint[tgt_cp]
        mapping[vis_cp] = glyph_name

    # Update all subtables in 'cmap'
    cmap_table = font['cmap']
    for subtable in cmap_table.tables:
        # subtable.cmap is a dict codepoint -> glyphName
        # We'll overwrite/add entries for the visible chars.
        for vis_cp, glyph_name in mapping.items():
            # Assign the glyph for the visible codepoint
            subtable.cmap[vis_cp] = glyph_name

    # Save modified font
    font.save(out_path)
    print(f"Wrote remapped font to {out_path}")
    print("Now include that font in your site and place the visible phrase on the page.")
    print("Displayed text should remain readable but the font cmap will reveal the flag mapping.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python remap_font.py source_font.ttf secretfont.ttf")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
