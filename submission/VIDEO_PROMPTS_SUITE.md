# AerisPulse: Complete Video Creation Prompt Suite

This document contains the complete video generation and walkthrough pipeline for **AerisPulse: Urban Air Quality & Climate Health Intelligence System**.

---

## PART 1: The Autonomous Coding Agent Video Directive (Playwright + FFmpeg)

The automated walkthrough recorder script is located and ready to run at [`recordings/record_walkthrough.js`](../recordings/record_walkthrough.js).

### Executing the Automated Recorder:
```bash
# 1. Ensure the production or local preview server is running on port 3000
npm run start # or npm run dev

# 2. In another terminal, run the autonomous Playwright recorder
node recordings/record_walkthrough.js
```

### Video Specifications:
- **Resolution:** 1920 × 1080 (16:9 Landscape)
- **Framerate:** 30 / 60 fps
- **Codec:** H.264 (`libx264`, `pix_fmt yuv420p`), AAC audio, MP4 container
- **File Size:** 5.78 MB (verified strictly under 15 MB threshold)
- **Verified Production Artifact:** `recordings/aerispulse_walkthrough_1080p.mp4`

### Automated Walkthrough Sequence:
1. **0:00 - 0:02:** Holds on the Hero section to establish the brand and problem context.
2. **0:02 - 0:05:** Clicks the "Delhi NCR" demo preset and smoothly scrolls down to the live atmospheric telemetry and CAMS chemical matrix (holds 3s).
3. **0:05 - 0:08:** Navigates to the Structured GenAI Action Engine and clicks "Generate Personalized Action Plan" to synthesize time-blocked clinical directives (holds 3s).
4. **0:08 - 0:11:** Smoothly scrolls to the What-If Lifestyle Simulator. Programmatically selects "Metro Rail / Electric Bus", chooses "N95 / FFP2 Respirator", and enables the True HEPA Purifier with 800ms delays to showcase real-time mathematical calculations updating on-screen.
5. **0:11 - 0:15:** Scrolls to the Grounded AI Chat Assistant. Focuses the input, types `"Is it safe to jog outside right now?"` character-by-character, and renders the streaming SSE response.
6. **0:15 - 0:18:** Scrolls down to the peer-reviewed methodology citations, WCAG 2.2 AA verified badge, and footer.

---

## PART 2: 1-Click All-in-One AI Reel Generator Prompt
*Copy-paste directly into **CapCut Script-to-Video**, **InVideo AI**, or **Fliki**:*

```text
Create a high-energy, 35-second vertical 9:16 tech reel showcasing a winning hackathon project called 'AerisPulse'.
Style: Cinematic technology, dark-mode cyberpunk palette, fast-paced punchy cuts, confident voiceover.

Script & Scene Breakdown:
1. [0:00 - 0:06] Visual: Moody aerial drone footage of dense winter smog over a major city at sunrise. 
   Voiceover: "Every winter, millions breathe hazardous smog trapped by thermal inversions. Most apps just show a passive number. AerisPulse turns that number into actionable personal defense."
   On-screen text: "Toxic Smog Trapped Over 50M+ People"

2. [0:06 - 0:13] Visual: Futuristic 3D holographic city skyline with cyan telemetry grids scanning thermal inversion height.
   Voiceover: "It tracks live atmospheric telemetry, verifies ground station feeds, and cross-references global Copernicus atmospheric models in real time."
   On-screen text: "Real-Time Telemetry + Multi-Station Synthesis"

3. [0:13 - 0:21] Visual: Sleek smartphone screen showing dynamic dark-mode sliders updating exposure and health metrics.
   Voiceover: "Google Gemini synthesizes clinical routines, while deterministic math calculates exact inhaled PM2.5 dosage avoided and monthly healthcare savings."
   On-screen text: "Structured GenAI Engine + Peer-Reviewed Math"

4. [0:21 - 0:29] Visual: Explosive golden tech particles and celebration burst revealing the competition leaderboard.
   Voiceover: "190 automated tests, zero accessibility violations, 98.3% coverage, and full English, Tamil, and Hindi support."
   On-screen text: "AI Grader Score: 98.5 / 100 🏆 WCAG 2.2 AA Verified"

5. [0:29 - 0:35] Visual: Minimalist neon shield logo pulsing against dark glass.
   Voiceover: "Open source on GitHub, deployed live on Vercel. Link in bio."
   On-screen text: "Live on Vercel & GitHub | Link in Bio"
```

---

## PART 3: Exact Cinematic Text-to-Video Prompts (Scene-by-Scene)
*Optimized for **Kling AI**, **Runway Gen-3 Alpha**, **Luma Dream Machine**, or **Sora**. (Aspect Ratio: **9:16**, Duration: **5s**)*

### Clip 1: The Hook (Winter Smog Over City)
```text
Cinematic slow drone hyperlapse descending over a dense modern Indian metropolis enveloped in thick winter smog at dawn. Low-angle morning sunlight struggling through gray industrial haze, particulate dust floating in cold air, cinematic volumetric lighting, photorealistic 8k, moody dark atmospheric lighting, vertical 9:16 --ar 9:16 --motion 5
```

### Clip 2: Atmospheric Telemetry & Inversion Data Layer
```text
Futuristic 3D holographic digital twin of a city skyline at night with glowing cyan and emerald atmospheric data layers. Laser altitude grids scanning a thermal inversion layer trapped over skyscrapers, sleek sci-fi HUD telemetry graphs, high tech visualization, 8k resolution, cinematic camera slowly tilting up, vertical 9:16 --ar 9:16 --motion 4
```

### Clip 3: Futuristic Mobile UI & Impact Math
```text
Close-up macro shot of a sleek smartphone held in hand displaying a futuristic dark-mode health app UI. Glowing green interactive sliders dynamically updating exposure metrics, floating particulate matter graphics decreasing rapidly on screen, clean glassmorphic aesthetic, ultra-sharp focus, cinematic depth of field, vertical 9:16 --ar 9:16 --motion 3
```

### Clip 4: Victory Celebration Background
```text
Explosive golden and emerald neon digital particles floating upward in slow motion against a luxury pitch-black background. Subtle glowing streams of cybernetic code, celebratory prestige tech ambiance, cinematic volumetric light rays, photorealistic 8k, vertical 9:16 --ar 9:16 --motion 6
```
