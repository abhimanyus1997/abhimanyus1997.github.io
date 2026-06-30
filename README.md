# Abhimanyu Singh — Interactive AI & Robotics Portfolio

A high-performance, minimalist, and deeply interactive developer portfolio. Built with a raw, high-contrast, brutalist-technical aesthetic, this site combines WebGL 3D rendering, local on-device LLM inference, and Progressive Web App (PWA) capabilities.

## 🚀 Key Features

### 1. Cinematic Loading Screen & Pilot Sync
- **TRON-Style Wireframe**: Displays a clean, uncrowded vector SVG sketch of the pilot (derived from a custom cyberpunk portrait).
- **Neural Flow Animation**: Features slow, glowing green pulses traveling organically across the vector paths using staggered CSS stroke-dash animations.
- **Outro Transition**: Upon loading completion, the wireframe sketch seamlessly "resolves" (fades in) into the full-colored cyberpunk portrait before the loading screen fades out.

### 2. Controllable 3D Hovercar
- **WebGL Rendering**: Powered by Three.js, rendering a high-detail cyberpunk hovercar with custom metallic/plastic shaders, real-time lighting, particle orbits, and a soft shadow projection.
- **Desktop Controls**: Rotate, tilt, roll, and scale the car using the UI control panel, mouse hover, or keyboard hotkeys (`WASD` / `arrows` to tilt/yaw, `Q`/`E` to roll, `Space` to boost, `R` to reset, `G` to toggle gear).
- **Mobile Gamepad**: Automatically replaces the desktop panel on mobile with a virtual joystick (touch dragging) and touch buttons (`GYRO`, `GEAR`, `BOOST`).
- **Gyroscope Tilting**: Utilizes device orientation sensors (with iOS permission handling) to tilt and roll the hovercar in real-time as the user tilts their mobile device.
- **Landing Gear Animation**: Dynamically controls the 3D model's built-in landing gear animation, allowing it to retract (Gear Up) or extend (Gear Down) with bi-directional playback.

### 3. On-Device Local AI Assistant
- **Private Browser Inference**: Powered by `@mlc-ai/web-llm` running a `SmolLM2-360M-Instruct` model.
- **Zero Server Latency**: Runs entirely on the user's local GPU via **WebGPU**, meaning no messages or chat history ever leave the browser.
- **Context-Aware**: Pre-prompted with Abhimanyu's skills, experience, and publications to act as an automated recruiting and portfolio assistant.

### 4. Progressive Web App (PWA)
- **Installable**: Fully installable on desktop and mobile (iOS & Android) with a custom SVG app icon.
- **Offline Capability**: Utilizes a "Stale-While-Revalidate" service worker (`sw.js`) that caches all core assets—including the **7MB 3D model** and vendor libraries—making the site load instantly on repeat visits and work completely offline.
- **Auto-Update**: Detects when a new service worker version is installed and automatically reloads the page to activate the latest updates.

### 5. Micro-Interactions & Typography
- **Scroll-Triggered Text Scramble**: Reveals headings and metrics numbers (`05+ Years`, `10+ Models`, etc.) using a futuristic matrix-like character scrambling effect as they scroll into view.
- **Custom Cursor**: Features a lagging, magnetic trailing circle on desktop that expands and glows green on hovering over interactive elements.
- **Interactive Project Icons**: Custom-designed inline SVGs for each project (MicroClaw, HealthBuddy, Langchain One, Resume Matcher) that scale, rotate, turn acid-green, and trigger micro-animations (like a pulsing orb or an ECG wave drawing itself) on hover.

---

## 🛠️ Technology Stack

- **Core**: HTML5, CSS3 (Vanilla CSS), JavaScript (ES6+)
- **3D Graphics**: Three.js (WebGL, PerspectiveCamera, AnimationMixer, GLTFLoader)
- **AI**: WebLLM (MLC-AI, WebGPU, SmolLM2)
- **PWA**: Service Workers, Cache Storage API, Web App Manifest
- **Fonts**: Google Fonts (Manrope, DM Mono)

---

## 📂 Project Structure

```text
├── index.html          # Main structure, PWA links, and custom SVG icons
├── styles.css          # Core typography, grid layouts, and color tokens
├── interactive.css     # Micro-interactions, custom cursor, mobile gamepad, and PWA styles
├── script.js           # 3D scene, gamepad/gyro handlers, WebLLM integration, and scramble logic
├── sw.js               # Stale-while-revalidate offline caching service worker
├── manifest.json       # PWA installation metadata
└── static/
    ├── images/         # Logo, pilot sync SVGs, and profile graphics
    ├── models/         # 3D hovercar GLB model
    └── vendor/         # Three.js core and GLTFLoader scripts
```

---

## 💻 Local Development

To run the portfolio locally, simply serve the root directory using any local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Open `http://localhost:8000` (or the port provided by `serve`) in a WebGPU-compatible browser (such as Google Chrome, Microsoft Edge, or Arc).
