# Birthday surprise 🎂

A mobile-first, buildless birthday website. No npm, framework, backend, API keys, or external assets required.

## Personalize

Open `config.js`:

- Set `name` and `message`.
- Copy your photos into `assets/photos/`. Change each `src` to its filename, e.g. `assets/photos/01.jpg`, and edit its caption. Add more entries if you like.
- Copy your MP4 to `assets/birthday-video.mp4` and set `videoUrl: "assets/birthday-video.mp4"`. Alternatively use a direct HTTPS MP4 URL. A GitHub `blob` webpage is not a playable video URL. H.264 video with AAC audio is a good compatibility choice.
- Optionally add `assets/music.mp3` and set `musicUrl`. Otherwise a gentle built-in tune plays for approximately five seconds.

The included SVG pictures are labeled placeholders. The video shows a placeholder card until configured. All paths are relative, so the site can run under a GitHub Pages repository path.

## Run locally on Ubuntu

Inside this folder:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 in your desktop browser. Microphone access requires permission and HTTPS or localhost. Opening a phone via an HTTP LAN address usually won't allow microphone access; use the tap fallback or test on your HTTPS GitHub Pages link.

## Publish to GitHub Pages

1. Create a GitHub repository, then upload the CONTENTS of this folder to its root. `index.html` must be at the root, not inside a second birthday-surprise folder.
2. In the repository, open Settings → Pages.
3. Choose Deploy from a branch, your main branch, and / (root), then save.
4. Use the Pages URL shown by GitHub once deployment completes (usually https://USERNAME.github.io/REPOSITORY/).
5. Test the full flow on a phone before sending the link.

You can also push from your local folder:

```bash
git init
git add .
git commit -m "Add birthday surprise"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Add your photos/video BEFORE committing. Files in a public repository and public Pages website can be accessed by others with the link; only upload media you're happy to make public. If your video is too large for a normal Git push, use another direct media host instead.

## How it behaves

Start the magic initializes audio, requests the microphone, and calibrates room noise for about 1.3 seconds. A sustained sound burst extinguishes the candle. This is a sound-level heuristic: loud speech or noise can also trigger it. No audio is recorded or uploaded. Microphone tracks stop after the candle is extinguished.

The tap button works without microphone permission. After a short smoke animation, confetti and a photo slideshow appear with the five-second tune. The video button appears five seconds later. Tapping it opens a player with controls. Escape or the close button closes the player. Make another wish restarts the experience.

Mobile browsers may still block audio in some circumstances; the visual surprise continues. Video playback is initiated by a tap. Reduced-motion preferences disable decorative animations and confetti.

## Quick check before sharing

- Name, message, all photo paths, and captions are correct.
- Start button works on the HTTPS link; microphone permission denial still leaves tap available.
- Candle goes out and photos cycle.
- Tune lasts approximately five seconds.
- Video plays with sound on the recipient's type of phone.

JavaScript syntax was checked during creation. Real microphone sensitivity, mobile audio, and video compatibility must be checked on a physical phone.
