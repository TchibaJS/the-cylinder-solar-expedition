# The Solar Expedition — cylinder web atlas

**Current project release: v29 (23 November 2026).** This folder holds the editable web source. In the local project workspace, the numbered offline release files, `The SolarExpedition_v29.html` and `The SolarExpedition_v29.zip`, are in `Cylinder/HTML`; they are not part of the GitHub Pages repository. The hosted copy lives in the separate `the-cylinder-solar-expedition` repository. The Hologram Box Capsule Edition is a separate project.

## What visitors can do

- Explore eight planets spaced around a flat 360° cylinder panorama. Select a planet to see its close-up, English or French description, NASA-linked measurements, and information panel. The Overview button returns to all eight planets.
- See up to four orbiting moons at once and choose any other catalogue moon from the searchable library. Selecting one opens a moon close-up and information panel; the Planet button returns to its parent planet. The runtime catalogue has **456 moons**: Earth 1, Mars 2, Jupiter 115, Saturn 293, Uranus 29, and Neptune 16. Mercury and Venus have none.
- Open “What am I seeing?” on planet and moon close-ups. Planet pages also have a Scale moment comparing equatorial diameter with Earth. Image status and NASA source links appear in the panel.
- Select the astronaut, spacecraft, or space station to open a bilingual learning guide. Each guide starts with its title and introduction; selecting a topic opens that topic's text, NASA images where available, and source links. The three decorative figures are artistic illustrations, not models of a particular mission or person.
- Choose English narration (Anna or Charles) or French narration (Estelle), turn narration on or off, and replay the current selection. The 1,467 MP3 recordings cover the overview, planets, catalogue moons, learning moments, and guide topics. Ambient music is enabled by default and ducks during speech. Browsers may delay sound until the first visitor interaction.

The planet textures rotate and the first four moon markers move on illustrative orbit tracks. Saturn and Uranus have rings. The astronaut, spacecraft, and station move in the background; during close-ups, the other planets stay in their overview positions as subdued, slightly blurred landmarks. Planet and moon sizes, distances, and orbital speeds are illustrative, not a scale simulation.

## Current cylinder presentation

Use the same URL in a normal browser and in Igloo: **`https://tchibajs.github.io/the-cylinder-solar-expedition/`**. The page selects desktop layout at ordinary screen sizes and cylinder layout when the WebView has the venue's very wide 10876 × 999 viewport. The plain URL is the intended permanent Igloo link. The `?projection=1` option remains available only for manual troubleshooting if a future Igloo setup reports the wrong viewport size; it is not part of normal use.

The Igloo WebView has been tested as a flat panorama at about **10876 × 999 pixels**. Its controls can be operated with the Igloo tablet's Cast Mouse. This web version does not need Unity, the Igloo Unity Toolkit, Spout, or a Windows executable. Keep the WebView as a flat panoramic strip unless a different mapping is deliberately tested in the room.

**v26 performance work:** moon markers now use transforms during animation, dimmed background globes stop spinning, and the page uses smaller display copies of the original planet and star images. The original image files remain in `assets/`.

**v27 colour work:** the cylinder uses a single 10876 × 999 star background with a consistent dark base instead of repeating the original two-to-one sky image. This addresses alternating dark-blue/light-blue bands seen with this project in the venue. Check the result on the actual cylinder; Igloo's projector and browser settings can still affect the final image.

**v28 website layout fix:** the root GitHub Pages URL no longer forces cylinder mode on every visitor. The same plain URL selects the desktop or cylinder view from the actual viewport shape.

**v29 cache fix:** the page requests `app.js?v=29`. GitHub Pages had published the v28 layout code, but an older cached script still made the live root URL look squeezed. Update this query version whenever `app.js` changes in a future release.

## Publish and refresh

The hosted site is built from the **root of the `main` branch** of the separate `the-cylinder-solar-expedition` repository. After editing this source, copy the changed site files into that repository, commit and push from GitHub Desktop, wait for GitHub Pages to publish, then refresh the existing Igloo WebView at the plain URL above. If Igloo still shows older content, use a full reload or clear that WebView's cache. The GitHub repository contains the site source and does **not** contain a numbered `v29` HTML file; the current release number is recorded here and in the local workspace's `Cylinder/HTML/RELEASE.md`. The local `Cylinder/HTML/site/dist` directory is an older prototype, not the GitHub Pages source; do not publish it.

For an offline handoff, use `The SolarExpedition_v29.html` from the parent folder. It embeds visuals and narration in one file. The ZIP contains the editable source and supporting files. The source site needs its `assets`, `audio`, and `data` folders alongside `index.html`.

## Main files and sources

- `index.html`, `styles.css`, `app.js`, `music.js`: page, layout, interaction, and generated ambient sound.
- `data/catalogue.js`: **runtime** NASA-backed planet and moon catalogue. `data/catalogue.json` is now synchronized as an editable copy. After changing the runtime catalogue, run `sync_catalogue_json.py` from the parent `HTML` folder to refresh both JSON copies.
- `data/craft_guides.js`, `data/craft_visuals.js`, `assets/craft/`: guide text, visual records, and images.
- `assets/display/`: optimized planet textures plus `StarsCylinder.jpg` for the wide canvas. Original images remain in `assets/`.
- `assets/moons/photos/`: 35 NASA-linked moon images in the runtime catalogue, including the mapped Earth Moon. Some source photographs have low native resolution; moons without a verified image use a neutral model.
- `audio/narration/`: 1,467 narration clips. The hosted page requests clips as needed; the standalone HTML embeds them all.

Planet measurements and summaries, moon catalogue records, image provenance, and their limits are described in the parent `NASA_SOURCES.md`. The narration generation workflow is in `NARRATION.md`. French text is a translation of the sourced English material. External NASA links require an internet connection; the core exhibit and local audio do not.
