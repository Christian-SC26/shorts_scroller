<p align="center">
  <img src="assets/logo.png" width="128" alt="YouTube Shorts Auto-Scroll Logo">
</p>

<h1 align="center">YouTube Shorts Auto-Scroll & Speed Control</h1>

<p align="center">
  A lightweight Chrome / Chromium browser extension (Manifest V3) that automatically scrolls through YouTube Shorts as soon as they finish, with full playback speed controls.
</p>

## Features

- **Infinite Auto-Scroll**: Seamlessly advances to the next YouTube Short as soon as the current one ends.
- **Speed Control**: Adjust playback speed from `0.5x` up to `3.0x` via a clean popup interface.
- **Speed Shortcuts**: Use standard `<` and `>` keys (`Shift + ,` / `Shift + .`) to adjust speed by `±0.25x` on the fly.
- **Smart Input Detection**: Hotkeys automatically disable when typing in comments or search bars.
- **Universal Compatibility**: Works on all Chromium-based browsers (Helium, Chrome, Brave, Edge, Opera, Vivaldi).

## Installation

### Option 1: Load Unpacked Folder (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Christian-SC26/shorts_scroller.git
   ```
2. Open your browser and navigate to `chrome://extensions` (or `brave://extensions`, `helium://extensions`).
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the **`src`** folder of this project.

### Option 2: Quick Install via ZIP

1. Download [youtube-shorts-autoscroll.zip](https://github.com/user-attachments/files/30742433/youtube-shorts-autoscroll.zip) from this repository.
2. Unzip it on your computer.
3. Open `chrome://extensions` -> **Load unpacked** -> select the unzipped folder.

## Shortcuts

| Shortcut | Action |
| --- | --- |
| `<` | Decrease playback speed by `-0.25x` |
| `>` | Increase playback speed by `+0.25x` |

## Repository Structure

```
yt-shorts-autoscroll/
├── assets/          # Logo and repository graphics
├── src/             # Extension Source Code (Target for Load Unpacked)
├── README.md        # Documentation
└── youtube-shorts-autoscroll.zip
```

## License

MIT License. Free for everyone!
