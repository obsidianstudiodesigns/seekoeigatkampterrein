# Seekoeigat Kampterrein

Website for Seekoeigat Kampterrein, a private caravan park on the Olifants River near Groblersdal (13 km from Loskop Dam).

Live: https://obsidianstudiodesigns.github.io/seekoeigatkampterrein/

## Structure

- `src/` page sources and shared partials (head, nav, footer, scripts)
- `tools/build.py` builds `src/*.html` into the root pages (responsive images, icons, cache busting)
- `assets/` CSS, JS, fonts (Cabinet Grotesk, Satoshi), icons (Phosphor sprite), images, brand files
- Accommodation pages (`staanplekke.html`, `safari-tente.html`, ...) come from `tools/make_units.py`
- Root `*.html` are generated: edit `src/` (or `tools/make_units.py`) and run `python tools/make_units.py && python tools/build.py`

## Features

- WebGL hero: the river surface ripples and mist drifts over the real drone photo (falls back to the still photo)
- Pinned horizontal accommodation slider, scroll-lit welcome text, campfire embers
- Booking enquiry with a live estimate from the 2026/27 rates, sent via WhatsApp or e-mail
- Open Graph image for WhatsApp/Facebook previews, sitemap, robots, schema.org Campground data
- Light and dark mode, reduced-motion support

Website designed by [Obsidian Studio Designs](https://obsidianstudiodesigns.co.za/).
