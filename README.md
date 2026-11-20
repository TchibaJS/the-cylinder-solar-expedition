# The Solar Expedition — HTML version

## Hosted cylinder version

This folder is the separate GitHub Pages project for the Igloo cylinder. Its public address is `https://tchibajs.github.io/the-cylinder-solar-expedition/`. The Capsule Edition is a different repository and is not changed by edits here.

After changing this project, commit and push it from GitHub Desktop. Wait for GitHub Pages to finish publishing, then refresh the WebView on the central computer. When `app.js` or `styles.css` changes, increase the `?v=` number on the corresponding references in `index.html` before committing; that makes the refreshed page request the newest files.

The current trial keeps the other seven planets visible as subdued, selectable landmarks during a planet or moon close-up. A moon close-up also shows its parent planet nearby.

This is a separate, offline web version of the Unity experience. In the venue's wide WebView it renders a flat panoramic strip for the cylinder. It does not need Unity, the Igloo Unity Toolkit, Spout, or a Windows build. See [Cylinder starter guide](../CYLINDER_STARTER_GUIDE.md) for the current installation findings and setup steps.

## Included

- Eight selectable planets arranged around the 360° panorama.
- Planet images, 461 entries from the existing moon catalogue, English and French descriptions.
- Existing Anna and Charles English narration and Estelle French narration. Narration starts when a visitor selects a planet. Browser audio requires that first interaction.
- A visible Back button, moon page controls, and Esc/arrow keyboard shortcuts.
- Animated planet positions and textures, orbiting moon markers, Saturn and Uranus rings, a floating astronaut, and a denser star field.
- The original Hologram box ambient music, started with the ♪ button. Browsers require a visitor click before music can play.

The planet and moon sizes, separations, and movements are illustrative. The overview is not to scale. This first version uses textured 2D globes in a panoramic web page; it does not yet reproduce Unity's 3D lighting or moon orbits.

## Try it on your computer

Open `index.html` in a browser. Keep the `assets`, `audio`, and `data` folders alongside it. The content and narration are local; no internet is needed. The default page is a larger desktop view for editing and testing. Add `?projection=1` to the URL for the 2:1 cylinder view.

## Try it on the Igloo computer

1. Copy the whole `HTML` folder to the central computer. Do not copy only `index.html`.
2. In Igloo, add a **WebView** layer. Enter a local `file:///` URL to its `index.html` with `?projection=1`, for example `file:///C:/SolarSystem360/HTML/index.html?projection=1`. If that Igloo installation refuses local file URLs, serve the folder on the central computer over local HTTP and use its `http://127.0.0.1:<port>/?projection=1` URL. Keep the server running while the session is active.
3. Set the WebView's rendering resolution to the working wide-strip setting, **10876 × 999/1000**, and make the layer fill the intended canvas region. Test Dynamic Browser Resolution on the installed system; a fixed strip size may work better with it off.
4. Keep the page on the flat panoramic-strip route used in the venue tests. Do not add True Perspective or cubemap conversion without deliberately changing the content format and verifying it in the room.
5. Turn on **Canvas UI**, select the WebView layer, then use **Cast Mouse** on the Igloo tablet to move and click the page. Test selecting a planet, changing language and voice, paging moons, and Back. The tablet's Game Controller casting is a different path and is not needed for this web version.
6. Save the working Igloo layer as a session or layer preset.

The exact crop, scale, mouse mapping, and audio routing must be checked on the real cylinder. This local computer cannot verify those parts. The page keeps important content near the horizon to reduce vertical cropping; adjust the Igloo True Perspective settings after seeing it on site.

## Files

- `index.html`, `styles.css`, `app.js`: the web experience.
- `data/catalogue.js`: planet and moon data loaded without a network request, so local file access can work.
- `data/catalogue.json`: an editable copy of the same catalogue. If it changes, regenerate `catalogue.js` before running the page.
- `assets/`: copied planet and background images from the existing Unity project.
- `audio/`: copied narration from the existing Unity project.

Source material was reused from `Cylinder/Unity_Spout/SolarSystem360_SpoutTest/Assets/Resources/SolarSystem`. Keep the original asset provenance and permissions with the project when distributing it.
