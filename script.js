import profile from './profile.json';
import { initFaceScanner } from './static/js/face-scanner.js';
const canvas = document.querySelector('#field');
document.documentElement.dataset.portfolioJs = 'ready';

window.addEventListener('error', (event) => {
  console.error('[Global Error]', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

let entryStart = 0;
let modelLoaded = false;
let modelFailed = false;
let modelLoadPercent = 0;
let scrollProgress = 0;
let smoothScroll = 0;
let keyLight = null;
let rimLight = null;

// Web Audio API Sound Synthesizer (100% offline, zero-latency, synthesized dynamically)
const Sfx = {
  ctx: null,
  init() {
    try {
      if (this.ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    } catch (e) {
      console.warn('[Sfx] AudioContext init failed:', e);
    }
  },
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) { console.warn('[Sfx] playClick failed:', e); }
  },
  playHover() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.setValueAtTime(580, now + 0.02);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) { console.warn('[Sfx] playHover failed:', e); }
  },
  playScramble() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + Math.random() * 1800, now);
      gain.gain.setValueAtTime(0.016, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.015);
    } catch (e) { console.warn('[Sfx] playScramble failed:', e); }
  },
  playSlide() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.4);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) { console.warn('[Sfx] playSlide failed:', e); }
  },
  playBoost() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.65);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) { console.warn('[Sfx] playBoost failed:', e); }
  },
  playGear(isOpen) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      const startFreq = isOpen ? 500 : 250;
      const endFreq = isOpen ? 250 : 500;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.22);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) { console.warn('[Sfx] playGear failed:', e); }
  },
  playArrival() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.exponentialRampToValueAtTime(65, now + 2.0);

      osc2.frequency.setValueAtTime(184, now);
      osc2.frequency.exponentialRampToValueAtTime(67, now + 2.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 2.0);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.03, now + 2.0);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);

      gain.gain.setValueAtTime(0.03, now + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      osc1.stop(now + 3.0);
      osc2.stop(now + 3.0);
    } catch (e) { console.warn('[Sfx] playArrival failed:', e); }
  },
  playManeuver() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) { console.warn('[Sfx] playManeuver failed:', e); }
  },
  playStartup() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.1, 0.2].forEach((delay, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const pitch = idx === 2 ? 1600 : 1200;
        osc.frequency.setValueAtTime(pitch, now + delay);
        gain.gain.setValueAtTime(0.02, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.06);
      });
    } catch (e) { console.warn('[Sfx] playStartup failed:', e); }
  },
  playGlitch() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(3000 + Math.random() * 2000, now);
      gain.gain.setValueAtTime(0.008, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.01);
    } catch (e) { console.warn('[Sfx] playGlitch failed:', e); }
  },
  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2 + idx * 0.1);
      });
    } catch (e) { console.warn('[Sfx] playChime failed:', e); }
  }
};

// Auto-resume AudioContext on first gesture
const resumeAudio = () => {
  Sfx.init();
  if (Sfx.ctx && Sfx.ctx.state === 'suspended') {
    Sfx.ctx.resume();
  }
  removeEventListener('click', resumeAudio);
  removeEventListener('touchstart', resumeAudio);
};
addEventListener('click', resumeAudio);
addEventListener('touchstart', resumeAudio);

async function initThree() {
  try {
    const THREE = window.THREE;
    if (!THREE?.GLTFLoader) throw new Error('Three.js or GLTFLoader did not initialize');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    const isMobileDevice = window.innerWidth <= 800;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobileDevice, powerPreference: 'default' });
    renderer.setPixelRatio(isMobileDevice ? 1 : Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    camera.position.set(0, 0, 7);
    const group = new THREE.Group();
    scene.add(group);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.38, 2), new THREE.MeshBasicMaterial({ color: 0xc9ff36, wireframe: true, transparent: true, opacity: .22 }));
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 1), new THREE.MeshBasicMaterial({ color: 0x6a8a3c, wireframe: true, transparent: true, opacity: .45 }));
    core.position.z = -1.8; wire.position.z = -1.7; group.add(core, wire);

    // Glowing green starfield
    const particleData = [];
    for (let i = 0; i < 150; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 6.5;
      particleData.push(r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * .65, r * Math.sin(b) * Math.sin(a));
    }
    const particleGeo = new THREE.BufferGeometry(); particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particleData, 3));
    const orbit = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0x4a5c35, size: .06, transparent: true, opacity: 0.7 })); group.add(orbit);

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.75, .008, 3, 72), new THREE.MeshBasicMaterial({ color: 0x536146, transparent: true, opacity: .45 }));
    ring1.rotation.x = 1.08; group.add(ring1);
    const ring2 = ring1.clone(); ring2.scale.setScalar(1.25); ring2.rotation.set(.4, .8, 0); group.add(ring2);
    const carRig = new THREE.Group(); carRig.visible = false; scene.add(carRig); let mixer = null;
    let gearAction = null; let gearOpen = true;
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x11130f, transparent: true, opacity: .13, depthWrite: false })); shadow.scale.set(2.2, .42, 1); shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
    scene.add(new THREE.HemisphereLight(0xdde7f0, 0x171915, 1.15));
    keyLight = new THREE.DirectionalLight(0xffffff, 2.6); keyLight.position.set(-4, 5, 6); scene.add(keyLight);
    rimLight = new THREE.PointLight(0xffa31a, 5.5, 12); rimLight.position.set(3, -1, 3); scene.add(rimLight);
    const carStatus = document.querySelector('#car-status');
    new THREE.GLTFLoader().load('static/models/hovercar.glb', gltf => {
      const car = gltf.scene; const box = new THREE.Box3().setFromObject(car), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      const scale = 5.1 / Math.max(size.x, size.y, size.z); car.scale.setScalar(scale); car.position.copy(center).multiplyScalar(-scale); car.rotation.y = Math.PI / 2 - .22;
      car.traverse(node => { if (node.isMesh) { node.frustumCulled = false; const mats = Array.isArray(node.material) ? node.material : [node.material]; mats.forEach(m => { if (!m) return; const name = (m.name || '').toLowerCase(); const tone = name.includes('body') ? 0x34383d : name.includes('metal') ? 0x202326 : name.includes('plastic') ? 0x111315 : null; if (tone !== null) { if (m.color) m.color.setHex(tone); if (m.uniforms?.diffuse?.value) m.uniforms.diffuse.value.setHex(tone) } if (m.map) m.map.encoding = THREE.sRGBEncoding; if (m.emissiveMap) m.emissiveMap.encoding = THREE.sRGBEncoding; m.side = THREE.DoubleSide; m.needsUpdate = true }) } });
      carRig.add(car); carRig.visible = true;
      carStatus.classList.add('ready'); carStatus.textContent = 'HOVERCAR ONLINE';
      document.body.classList.add('model-ready');

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(car);
        const hoverAction = mixer.clipAction(gltf.animations[0]);
        hoverAction.play();

        const gearClip = gltf.animations.find(clip => {
          const name = clip.name.toLowerCase();
          return name.includes('gear') || name.includes('land') || name.includes('close') || name.includes('open') || name.includes('retract');
        }) || (gltf.animations.length > 1 ? gltf.animations[1] : null);

        if (gearClip) {
          gearAction = mixer.clipAction(gearClip);
          gearAction.setLoop(THREE.LoopOnce);
          gearAction.clampWhenFinished = true;
          // Start at end (gear retracted/closed) then play forward to open it on load
          gearAction.reset();
          gearAction.time = 0;
          gearAction.timeScale = 1;
          gearAction.paused = false;
          gearAction.play();
          gearOpen = true;
        }
      }
      modelLoaded = true;
    }, xhr => { if (xhr.total) { const pct = Math.round(xhr.loaded / xhr.total * 100); modelLoadPercent = pct; if (carStatus.lastChild) carStatus.lastChild.textContent = ` LOADING HOVERCAR · ${pct}%` } }, err => {
      carStatus.classList.add('error');
      carStatus.textContent = '3D MODEL UNAVAILABLE';
      console.warn('Hovercar could not load', err);
      modelFailed = true;
      const controls = document.getElementById('flight-controls');
      if (controls) controls.style.display = 'none';
    });
    let mx = 0, my = 0, manualYaw = 0, manualPitch = 0, manualRoll = 0, userScale = 1.1, autoRotate = true, boostUntil = 0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 }, { passive: true });
    const controlDock = document.querySelector('#flight-controls'), sizeControl = document.querySelector('#flight-size');
    if (controlDock) {
      const autoBtn = controlDock.querySelector('[data-flight="auto"]');
      if (autoBtn) autoBtn.setAttribute('aria-pressed', 'true');
    }

    function fly(action, target) {
      if (action === 'yaw-left' || action === 'yaw-right' || action === 'pitch-up' || action === 'pitch-down' || action === 'roll-left' || action === 'roll-right') {
        Sfx.playManeuver();
      }
      if (action === 'yaw-left') manualYaw -= .3;
      if (action === 'yaw-right') manualYaw += .3;
      if (action === 'pitch-up') manualPitch = Math.min(.55, manualPitch + .14);
      if (action === 'pitch-down') manualPitch = Math.max(-.55, manualPitch - .14);
      if (action === 'roll-left') manualRoll = Math.max(-.65, manualRoll - .15);
      if (action === 'roll-right') manualRoll = Math.min(.65, manualRoll + .15);
      if (action === 'boost') {
        boostUntil = performance.now() + 900;
        Sfx.playBoost();
      }
      if (action === 'auto') { autoRotate = !autoRotate; target?.setAttribute('aria-pressed', String(autoRotate)) }
      if (action === 'reset') {
        manualYaw = 0; manualPitch = 0; manualRoll = 0; userScale = 1.1; sizeControl.value = 110; autoRotate = false;
        controlDock.querySelector('[data-flight="auto"]').setAttribute('aria-pressed', 'false');
      }
    }
    controlDock.addEventListener('click', e => { const button = e.target.closest('button'), action = button?.dataset.flight; if (action) fly(action, button) });
    function resize() {
      const r = canvas.getBoundingClientRect();
      if (r.height > 0 && r.width > 0) {
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
      }
    }
    addEventListener('resize', resize); resize();
    addEventListener('keydown', e => { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; const action = { a: 'yaw-left', ArrowLeft: 'yaw-left', d: 'yaw-right', ArrowRight: 'yaw-right', w: 'pitch-up', ArrowUp: 'pitch-up', s: 'pitch-down', ArrowDown: 'pitch-down', q: 'roll-left', e: 'roll-right', ' ': 'boost', r: 'reset' }[e.key]; if (action) { e.preventDefault(); fly(action) } });
    sizeControl.addEventListener('input', () => { userScale = Number(sizeControl.value) / 100 });

    // Mobile Gamepad & Gyroscope Controls
    (function () {
      const joystickBase = document.getElementById('joystick-base');
      const joystickStick = document.getElementById('joystick-stick');
      const gyroBtn = document.getElementById('gyro-btn');
      const gearBtn = document.getElementById('gear-btn');
      const gamepadEl = document.getElementById('mobile-gamepad');
      const toggleBtn = document.getElementById('gamepad-toggle');

      // Toggle panel open/close
      if (toggleBtn && gamepadEl) {
        toggleBtn.addEventListener('click', () => {
          const isOpen = gamepadEl.classList.toggle('open');
          toggleBtn.setAttribute('aria-expanded', String(isOpen));
          gamepadEl.setAttribute('aria-hidden', String(!isOpen));
        });
      }

      if (joystickBase && joystickStick) {
        let active = false;
        let startX = 0, startY = 0;
        const maxDistance = 32;

        function onStart(e) {
          active = true;
          const t = e.touches ? e.touches[0] : e;
          startX = t.clientX;
          startY = t.clientY;
          joystickStick.style.transition = 'none';
        }

        function onMove(e) {
          if (!active) return;
          e.preventDefault();
          const t = e.touches ? e.touches[0] : e;
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
          const angle = Math.atan2(dy, dx);
          const px = Math.cos(angle) * dist;
          const py = Math.sin(angle) * dist;
          joystickStick.style.transform = `translate(${px}px, ${py}px)`;
          mx = px / maxDistance;
          my = py / maxDistance;
        }

        function onEnd() {
          if (!active) return;
          active = false;
          joystickStick.style.transition = 'transform 0.18s ease';
          joystickStick.style.transform = 'translate(0px,0px)';
          mx = 0;
          my = 0;
        }

        joystickBase.addEventListener('touchstart', onStart, { passive: true });
        addEventListener('touchmove', onMove, { passive: false });
        addEventListener('touchend', onEnd);
      }

      let gyroActive = false;
      function onOrientation(e) {
        if (!gyroActive) return;
        if (e.beta !== null && e.gamma !== null) {
          let pitch = 0;
          let roll = 0;
          const orientation = window.orientation || (window.screen && window.screen.orientation && window.screen.orientation.angle) || 0;
          if (orientation === 90) {
            pitch = e.gamma / 22; roll = -e.beta / 22;
          } else if (orientation === -90 || orientation === 270) {
            pitch = -e.gamma / 22; roll = e.beta / 22;
          } else if (orientation === 180) {
            pitch = -(e.beta - 48) / 22; roll = -e.gamma / 22;
          } else {
            pitch = (e.beta - 48) / 22; roll = e.gamma / 22;
          }
          mx = Math.max(-1, Math.min(1, roll));
          my = Math.max(-1, Math.min(1, pitch));
        }
      }

      if (gyroBtn) {
        gyroBtn.addEventListener('click', async () => {
          if (gyroActive) {
            gyroActive = false;
            gyroBtn.classList.remove('active');
            removeEventListener('deviceorientation', onOrientation);
            mx = 0; my = 0;
          } else {
            try {
              if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                const res = await DeviceOrientationEvent.requestPermission();
                if (res === 'granted') { enableGyro(); }
                else { alert('Gyroscope access denied'); }
              } else { enableGyro(); }
            } catch (err) { console.warn('Gyro error', err); enableGyro(); }
          }
        });

        function enableGyro() {
          gyroActive = true;
          gyroBtn.classList.add('active');
          addEventListener('deviceorientation', onOrientation);
        }
      }

      // Gear button: manual override toggle
      let gearManual = false; // false = auto, true = manual force-open
      if (gearBtn) {
        gearBtn.addEventListener('click', () => {
          gearManual = !gearManual;
          if (gearManual) {
            gearBtn.classList.add('open');
            gearBtn.classList.remove('closed');
            // Force gear open via the same path as auto logic
            if (gearAction && !gearOpen) {
              gearOpen = true;
              gearAction.paused = false;
              gearAction.timeScale = 1;
              gearAction.play();
              Sfx.playGear(true);
            }
          } else {
            gearBtn.classList.remove('open');
            gearBtn.classList.add('closed');
            if (gearAction && gearOpen) {
              gearOpen = false;
              gearAction.paused = false;
              gearAction.timeScale = -1;
              gearAction.play();
              Sfx.playGear(false);
            }
          }
        });
      }

    })();

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, clock = new THREE.Clock();
    let last = 0, previousX = 0;
    function render(ms = 0) {
      requestAnimationFrame(render);
      if (ms - last < 33) return;
      const delta = Math.min((ms - last) / 1000, .05);
      last = ms;
      const t = clock.getElapsedTime(),
        boost = Math.max(0, (boostUntil - ms) / 900),
        entry = entryStart ? Math.max(0, Math.min(1, (ms - entryStart) / 1800)) : 0,
        ease = 1 - Math.pow(1 - entry, 3);

      const isMobile = window.innerWidth <= 800;
      const baseX = isMobile ? 0 : 1.75;
      const baseY = isMobile ? -0.9 : -.02;
      const baseScale = isMobile ? 0.82 : 0.78;

      // ──────────────────────────────────────────────
      // Scroll-driven 3D flight path (realistic)
      // s=0 (hero) → land approach at s=1 (footer)
      // ──────────────────────────────────────────────
      smoothScroll = THREE.MathUtils.lerp(smoothScroll, scrollProgress, 0.04);
      const sp = smoothScroll; // shorthand

      // X: gentle sinusoidal sweep left→right across scene
      const flyX = Math.sin(sp * Math.PI * 1.2) * (isMobile ? 1.2 : 2.8);
      // Y: descend slowly mid-scroll, then pull back up for landing
      const flyY = -sp * (isMobile ? 0.7 : 2.2) + Math.sin(sp * Math.PI * 0.8) * 0.5;
      // Z: push INTO background mid-scroll (sp≈0.5), return closer at footer (sp≈1)
      const flyZ = Math.sin(sp * Math.PI) * (isMobile ? -0.8 : -2.2);
      // Scale: shrink slightly as it recedes, grow back at landing
      const flyScale = 1.0 - Math.sin(sp * Math.PI) * (isMobile ? 0.12 : 0.22);

      // Banking & pitch feel realistic during turns
      const flyYaw = Math.sin(sp * Math.PI * 1.2) * 0.55;
      const flyRoll = -Math.cos(sp * Math.PI * 1.2) * 0.22 + 0.22;
      const flyPitch = -sp * 0.25 + Math.sin(sp * Math.PI * 0.8) * 0.15;

      // Lighting: key sweeps across, rim shifts warm (takeoff) → cool (cruise) → warm (land)
      if (keyLight) {
        keyLight.position.x = THREE.MathUtils.lerp(-4, 2, sp);
        keyLight.intensity = THREE.MathUtils.lerp(2.6, 1.8, sp);
      }
      if (rimLight) {
        // warm orange on ground → cyan-blue mid-flight → amber on landing
        const hue = sp < 0.5 ? THREE.MathUtils.lerp(0.08, 0.55, sp * 2) : THREE.MathUtils.lerp(0.55, 0.1, (sp - 0.5) * 2);
        rimLight.color.setHSL(hue, 1.0, 0.55);
        rimLight.intensity = 5.5 + Math.sin(sp * Math.PI) * 3.5;
      }

      const x = baseX + (1 - ease) * (isMobile ? 0 : 4.8) + mx * .24 + flyX;
      const y = baseY + (1 - ease) * (isMobile ? 0 : .65) - my * .12 + Math.sin(boost * Math.PI) * .28 + flyY;
      const z = -.2 + (1 - ease) * (isMobile ? 0 : -1.5) + boost * .45 + flyZ;
      const s = baseScale * userScale * (.35 + .65 * ease) * (1 + Math.sin(boost * Math.PI) * .08) * flyScale;

      carRig.position.set(x, y + (!reduce ? Math.sin(t * 1.2) * .055 : 0), z);
      carRig.scale.setScalar(s);
      carRig.rotation.y = THREE.MathUtils.lerp(carRig.rotation.y, manualYaw + mx * .35 + (autoRotate ? t * .5 : 0) + (1 - ease) * -1.15 + flyYaw, .08);
      carRig.rotation.z = THREE.MathUtils.lerp(carRig.rotation.z, manualRoll + (x - previousX) * -.18 + Math.sin(t * .7) * .014 + flyRoll, .08);
      carRig.rotation.x = THREE.MathUtils.lerp(carRig.rotation.x, manualPitch - my * .14 - boost * .12 + (1 - ease) * 0.12 + flyPitch, .08);
      previousX = x;

      // Landing gear: open when boosting, close at footer (sp > 0.88)
      // Landing gear: open at top (sp < 0.05) or bottom (sp > 0.88), close during flight transit or when boosting
      if (gearAction) {
        const inTransit = sp >= 0.05 && sp <= 0.88;
        const shouldClose = inTransit || boost > 0.45;
        if (shouldClose && gearOpen) {
          gearOpen = false;
          gearAction.paused = false;
          gearAction.timeScale = -1; // Retract
          gearAction.play();
          Sfx.playGear(false);
        } else if (!shouldClose && !gearOpen) {
          gearOpen = true;
          gearAction.paused = false;
          gearAction.timeScale = 1; // Extend
          gearAction.play();
          Sfx.playGear(true);
        }
      }

      if (modelFailed) {
        shadow.visible = false;
        group.visible = true;
        group.rotation.y = t * 0.05;
        orbit.rotation.y = -t * 0.08;
        group.position.set(0, isMobile ? 0 : 0, -1.5);
        group.scale.setScalar(isMobile ? 0.85 : 0.95);
      } else {
        // Shadow fades out in transit flight (between sp 0.08 and 0.88)
        let shadowFade = 0;
        if (sp < 0.08) {
          shadowFade = 1 - (sp / 0.08);
        } else if (sp > 0.88) {
          shadowFade = (sp - 0.88) / 0.12;
        }
        shadow.visible = shadowFade > 0.01;
        shadow.position.set(x, y - (isMobile ? .44 : .62), z - .15);
        shadow.scale.set(1.9 * s * (1 + boost * .25), .34 * s, 1);
        shadow.material.opacity = .12 * ease * (1 - boost * .4) * shadowFade;

        group.visible = true;
        group.rotation.y = t * .05;
        orbit.rotation.y = -t * .08;
        group.position.set(isMobile ? 0 : 1.8, isMobile ? .1 : .1, isMobile ? -1.5 : -1.5);
        group.scale.setScalar(isMobile ? .42 : .58);
      }

      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    }
    render();
  } catch (err) { modelFailed = true; canvas.hidden = true; console.warn('3D scene unavailable', err) }
}
initThree();

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }) }), { threshold: .12 });
document.querySelectorAll('.project,.timeline article').forEach(e => io.observe(e));

function scrambleText(element, duration = 1400) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const originalHTML = element.innerHTML;
  const chars = '01X_/*+-^%&$!#?@';
  const fps = 60;
  const totalFrames = Math.floor((duration / 1000) * fps);

  const tokens = [];
  let i = 0;
  while (i < originalHTML.length) {
    if (originalHTML[i] === '<') {
      const closeIdx = originalHTML.indexOf('>', i);
      if (closeIdx !== -1) {
        tokens.push({ type: 'tag', content: originalHTML.substring(i, closeIdx + 1) });
        i = closeIdx + 1;
        continue;
      }
    }
    tokens.push({ type: 'char', content: originalHTML[i] });
    i++;
  }

  const queue = [];
  for (let j = 0; j < tokens.length; j++) {
    const token = tokens[j];
    if (token.type === 'tag') {
      queue.push({ type: 'tag', to: token.content, start: 0, end: 0 });
    } else {
      const to = token.content;
      if (to === ' ' || to === '\n') {
        queue.push({ type: 'space', to, start: 0, end: 0 });
      } else {
        const start = Math.floor(Math.random() * (totalFrames * 0.35));
        const end = start + Math.floor(Math.random() * (totalFrames * 0.45)) + 8;
        queue.push({ type: 'char', to, start, end, char: '' });
      }
    }
  }

  let frame = 0;
  function update() {
    let output = '';
    let complete = 0;
    for (let j = 0; j < queue.length; j++) {
      const item = queue[j];
      if (item.type === 'tag') {
        output += item.to;
        complete++;
      } else if (item.type === 'space') {
        output += item.to;
        complete++;
      } else {
        if (frame >= item.end) {
          output += item.to;
          complete++;
        } else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = chars[Math.floor(Math.random() * chars.length)];
          }
          output += `<span class="scramble-char">${item.char}</span>`;
        } else {
          output += ' ';
        }
      }
    }
    element.innerHTML = output;
    if (complete < queue.length && frame < totalFrames + 20) {
      frame++;
      if (Math.random() < 0.12) Sfx.playScramble();
      requestAnimationFrame(update);
    } else {
      element.innerHTML = originalHTML;
    }
  }
  update();
}

const scrambleObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (!el.dataset.scrambled) {
        el.dataset.scrambled = 'true';
        scrambleText(el);
        observer.unobserve(el);
      }
    }
  });
}, { threshold: 0.15 });

function startScrambleAnimations() {
  document.querySelectorAll('.scramble-text').forEach(el => scrambleObserver.observe(el));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runBootSequence() {
  const slides = document.querySelectorAll('.intro-slide');
  const skipBtn = document.getElementById('skip-intro');

  let currentSlideIdx = 0;
  let sequenceFinished = false;
  let autoSkipTimer = setTimeout(finishIntro, 30000);

  function finishIntro() {
    if (sequenceFinished) return;
    sequenceFinished = true;
    clearTimeout(autoSkipTimer);
    window.scrollTo(0, 0);
    document.body.classList.add('cinematic-ready');
    entryStart = performance.now() + 1800;
    setTimeout(startScrambleAnimations, 1800);
    Sfx.playArrival();
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', finishIntro);
    skipBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      finishIntro();
    }, { passive: false });
  }

  const AUTH_TTL = 2 * 60 * 60 * 1000; // 2 hours
  const authTs = parseInt(localStorage.getItem('auth_done') || '0', 10);
  const authValid = authTs && (Date.now() - authTs < AUTH_TTL);
  const sessionAuthDone = sessionStorage.getItem('auth_done') === '1';
  if (authValid || sessionAuthDone || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishIntro();
    if (sessionAuthDone && window.location.hash) {
      const targetHash = window.location.hash;
      setTimeout(() => {
        const el = document.querySelector(targetHash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 950);
    }
    return;
  }

  // Play startup triple-beep
  Sfx.playStartup();

  // Start the modular face scanner component with voice route callback
  initFaceScanner((sectionHash) => {
    finishIntro();
    if (sectionHash && sectionHash !== '#top') {
      setTimeout(() => {
        const el = document.querySelector(sectionHash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 950);
    }
  });

  const slideDuration = 2400; // 2.4s per slide

  while (currentSlideIdx < slides.length) {
    if (currentSlideIdx === slides.length - 1) {
      slides.forEach(s => s.classList.remove('active'));
      slides[currentSlideIdx].classList.add('active');

      const statusEl = slides[currentSlideIdx].querySelector('.intro-status');
      if (statusEl) {
        const startTime = performance.now();
        let lastPercent = -1;
        while (!modelLoaded && !modelFailed) {
          statusEl.innerHTML = `LOADING HOVERCAR TELEMETRY [${modelLoadPercent}%]...`;
          if (modelLoadPercent !== lastPercent) {
            lastPercent = modelLoadPercent;
            Sfx.playGlitch();
          }
          if (performance.now() - startTime > 8000) {
            console.warn('Hovercar loading timed out. Proceeding in 2D mode.');
            modelFailed = true;
            break;
          }
          await sleep(100);
        }
        if (modelFailed) {
          statusEl.innerHTML = `HOVERCAR TELEMETRY OFFLINE · 2D MODE`;
        } else {
          statusEl.innerHTML = `HOVERCAR TELEMETRY ONLINE · READY`;
          Sfx.playChime();
        }
        const container = document.querySelector('.pilot-sync-container');
        if (container) container.classList.add('fully-loaded');
      }
      await sleep(1500);
      break;
    }

    slides.forEach(s => s.classList.remove('active'));
    slides[currentSlideIdx].classList.add('active');
    Sfx.playSlide();

    await sleep(slideDuration);
    currentSlideIdx++;
  }
}

runBootSequence();

fetch('static/images/pilot_sync.svg')
  .then(r => r.text())
  .then(svgText => {
    const container = document.querySelector('.pilot-sync-svg-container');
    if (container) container.innerHTML = svgText;
  })
  .catch(err => console.warn('Could not load pilot sync SVG', err));





const launch = document.querySelector('#chat-launch'), panel = document.querySelector('#chat-panel'), close = document.querySelector('#chat-close'), clearBtn = document.querySelector('#clear-chat'), start = document.querySelector('#start-ai'), statusEl = document.querySelector('#model-status'), progressEl = document.querySelector('#model-progress'), gate = document.querySelector('#model-gate'), form = document.querySelector('#chat-form'), input = document.querySelector('#chat-input'), send = form.querySelector('button'), messages = document.querySelector('#chat-messages'), suggestions = document.querySelector('#suggestions'), micBtn = document.querySelector('#mic-btn');
const modeLabel = document.querySelector('#chat-mode-label');
const modelSelect = document.querySelector('#model-select');
const chatNote = document.querySelector('#chat-note');

// Voice Mode DOM elements
const voiceModeContainer = document.querySelector('#voice-mode-container');
const voiceStatus = document.querySelector('#voice-status');
const voiceVisualizer = document.querySelector('#voice-visualizer');
const centralMicBtn = document.querySelector('#central-mic-btn');
const voiceTranscript = document.querySelector('#voice-transcript');
const switchToTextBtn = document.querySelector('#switch-to-text');
const toggleVoiceModeBtn = document.querySelector('#toggle-voice-mode');

let isVoiceModeActive = true; // Voice mode by default
let autoListenAfterSpeak = true;
let autoSpeakResponse = false;
let recognition = null;
let voiceListeningActive = false;

function startVoiceListening() {
  try {
    if (!ready || voiceListeningActive) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      if (voiceStatus) voiceStatus.textContent = 'Speech recognition not supported';
      console.warn('[Voice] SpeechRecognition not available');
      return;
    }
    if (recognition) { try { recognition.stop(); } catch (e) { console.warn('[Voice] Stop previous recognition failed:', e); } }
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    voiceListeningActive = true;
    if (centralMicBtn) { centralMicBtn.classList.add('listening'); centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getMicIcon(); centralMicBtn.disabled = false; }
    if (voiceStatus) voiceStatus.textContent = 'Listening...';
    if (voiceTranscript) voiceTranscript.textContent = '...';
    recognition.onresult = (e) => {
      try {
        let interim = ''; let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) { final += e.results[i][0].transcript; }
          else { interim += e.results[i][0].transcript; }
        }
        if (voiceTranscript) voiceTranscript.textContent = final || interim || '...';
        if (final) {
          input.value = final;
          console.log('[Voice] Final transcript:', final);
        }
      } catch (err) { console.warn('[Voice] onresult error:', err); }
    };
    recognition.onend = () => {
      try {
        voiceListeningActive = false;
        if (centralMicBtn) centralMicBtn.classList.remove('listening');
        const spoken = input.value.trim();
        if (spoken && ready) {
          autoSpeakResponse = true;
          form.requestSubmit();
        } else if (isVoiceModeActive) {
          if (voiceStatus) voiceStatus.textContent = 'Tap mic to speak';
        }
      } catch (err) { console.warn('[Voice] onend error:', err); }
    };
    recognition.onerror = (e) => {
      try {
        voiceListeningActive = false;
        if (centralMicBtn) centralMicBtn.classList.remove('listening');
        if (voiceStatus) voiceStatus.textContent = e.error === 'not-allowed' ? 'Mic permission denied' : 'Try again';
        console.warn('[Voice] SpeechRecognition error:', e.error);
      } catch (err) { console.warn('[Voice] onerror handler failed:', err); }
    };
    recognition.start();
    console.log('[Voice] Recognition started');
  } catch (e) {
    console.warn('[Voice] startVoiceListening failed:', e);
    voiceListeningActive = false;
  }
}

function stopVoiceListening() {
  try {
    voiceListeningActive = false;
    if (recognition) {
      try { recognition.stop(); } catch (e) { console.warn('[Voice] Stop recognition failed:', e); }
      recognition = null;
    }
    if (centralMicBtn) { centralMicBtn.classList.remove('listening'); centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getMicIcon(); }
    if (voiceStatus) voiceStatus.textContent = 'Voice paused';
    console.log('[Voice] Recognition stopped');
  } catch (e) {
    console.warn('[Voice] stopVoiceListening failed:', e);
  }
}

function updateModeUI() {
  try {
    if (isVoiceModeActive) {
      if (voiceModeContainer) voiceModeContainer.style.display = 'flex';
      if (messages) messages.style.display = 'none';
      if (document.querySelector('.suggestions')) document.querySelector('.suggestions').style.display = 'none';
      if (toggleVoiceModeBtn) { toggleVoiceModeBtn.title = 'Switch to keyboard mode'; toggleVoiceModeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>`; }
    } else {
      if (voiceModeContainer) voiceModeContainer.style.display = 'none';
      if (messages) messages.style.display = 'flex';
      if (document.querySelector('.suggestions')) document.querySelector('.suggestions').style.display = 'flex';
      if (toggleVoiceModeBtn) { toggleVoiceModeBtn.title = 'Switch to voice mode'; toggleVoiceModeBtn.innerHTML = getMicIcon(); }
    }
  } catch (e) {
    console.warn('[Voice] updateModeUI failed:', e);
  }
}

let engine = null, ready = false, busy = false, pendingPrompt = '';
let apiType = 'local'; // 'proxy' | 'direct' | 'local'
let selectedModel = '';
let availableModels = [];

const TTS_FALLBACK_URL = 'https://tts.abhimanyu.fyi/tts';

const getEnvValue = (key, fallback = '') => {
  try {
    return import.meta?.env?.[key] || fallback;
  } catch (err) {
    console.warn(`[Config] Could not read env ${key}:`, err);
    return fallback;
  }
};

const normalizeTtsUrl = (url) => {
  try {
    const value = String(url || '').trim();

    if (!value) {
      console.warn('[Config] Empty TTS URL. Using fallback:', TTS_FALLBACK_URL);
      return TTS_FALLBACK_URL;
    }

    if (value.includes('localhost') || value.includes('127.0.0.1')) {
      console.warn('[Config] Localhost TTS URL blocked. Using fallback:', TTS_FALLBACK_URL);
      return TTS_FALLBACK_URL;
    }

    if (window.location.protocol === 'https:' && value.startsWith('http://')) {
      console.warn('[Config] HTTP TTS URL blocked on HTTPS page. Using fallback:', TTS_FALLBACK_URL);
      return TTS_FALLBACK_URL;
    }

    return value;
  } catch (err) {
    console.warn('[Config] normalizeTtsUrl failed. Using fallback:', err);
    return TTS_FALLBACK_URL;
  }
};

const baseUrl = getEnvValue('VITE_LITELLM_BASE_URL', 'http://13.126.102.204:4000');
const apiKey = getEnvValue('VITE_LITELLM_API_KEY', '');
const TTS_DIRECT_URL = normalizeTtsUrl(
  getEnvValue('VITE_TTS_BACKEND_URL', TTS_FALLBACK_URL)
);

console.log('[Config] TTS URL:', TTS_DIRECT_URL);
console.log('[Config] LiteLLM URL:', baseUrl);


function typeOutAnimation(element, text, fast = false) {
  try {
    if (!element || !text) return;
    element.textContent = '';
    const chars = text.split('');
    let i = 0;
    const delay = fast ? Math.max(4, Math.floor(1000 / chars.length)) : 30;
    const interval = setInterval(() => {
      try {
        if (i < chars.length) {
          element.textContent += chars[i];
          i++;
        } else {
          clearInterval(interval);
        }
      } catch (e) {
        clearInterval(interval);
        console.warn('[Animation] typeOutAnimation interval error:', e);
      }
    }, delay);
  } catch (e) {
    console.warn('[Animation] typeOutAnimation failed:', e);
  }
}

const systemPrompt = `You are the concise portfolio assistant for ${profile.name}. Use only these facts.
Title: ${profile.title}
Location: ${profile.location}
Bio: ${profile.bio}
Experience: ${profile.experience.industry} industry, ${profile.experience.research} research.
Contact: Email: ${profile.email}, GitHub: ${profile.github}, LinkedIn: ${profile.linkedin}.
Roles:
${profile.roles.map(r => `- ${r.company} (${r.period}): ${r.achievements.join(', ')}`).join('\n')}
Projects:
${profile.projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}
Education:
${profile.education.map(e => `- ${e.degree} at ${e.institution} (GPA: ${e.gpa})`).join('\n')}
Publications & Articles:
${profile.publications_articles.map(p => `- ${p}`).join('\n')}
Skills:
- Agentic AI: ${profile.skills.agentic_ai.join(', ')}
- Edge & Hardware: ${profile.skills.edge_hardware.join(', ')}
- Cloud & MLOps: ${profile.skills.cloud_mlops.join(', ')}
- Full-Stack AI: ${profile.skills.full_stack_ai.join(', ')}

If asked beyond these facts, say you do not know and suggest emailing him at ${profile.email}. Never invent claims. Keep answers under 100 words.`;

const history = [{ role: 'system', content: systemPrompt }];

async function initAI() {
  try {
    if (ready || busy) return;
    busy = true;
    if (modeLabel) modeLabel.textContent = 'CONNECTING AI...';
    console.log('[AI] Initializing AI connection...');

    // 1. Try Backend API Proxy (no auth needed for proxy)
    try {
      console.log('[AI] Trying proxy /api/models...');
      const res = await fetch('/api/models');
      if (res.status === 401) {
        console.warn('[AI] Proxy returned 401, trying direct API...');
      } else if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          apiType = 'proxy';
          availableModels = data.data.map(m => m.id);
          console.log('[AI] Proxy connected, models:', availableModels.length);
          setupCloudAI('PORTFOLIO CLOUD AI');
          return;
        }
      }
    } catch (e) {
      console.warn('[AI] Backend proxy models API failed:', e.message);
    }

    // 2. Try direct LiteLLM API (may have auth)
    try {
      console.log('[AI] Trying direct LiteLLM at:', baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      const res = await fetch(`${baseUrl}/v1/models`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          apiType = 'direct';
          availableModels = data.data.map(m => m.id);
          console.log('[AI] Direct API connected, models:', availableModels.length);
          setupCloudAI('LITELLM CLOUD AI');
          return;
        }
      } else if (res.status === 401 && !apiKey) {
        console.warn('[AI] Direct API requires auth key. Set VITE_LITELLM_API_KEY env var.');
      }
    } catch (e) {
      console.warn('[AI] Direct LiteLLM connection failed:', e.message);
    }

    // 3. Fallback to Local WebGPU AI
    console.log('[AI] Falling back to local WebGPU AI');
    apiType = 'local';
    busy = false;
    if (modeLabel) modeLabel.textContent = 'LOCAL PRIVATE AI';
    if (chatNote) chatNote.textContent = 'ON-DEVICE AI · NO MESSAGES LEAVE YOUR BROWSER';
    if (gate) gate.style.display = 'block';
  } catch (e) {
    console.error('[AI] initAI failed completely:', e);
    busy = false;
    apiType = 'local';
    if (modeLabel) modeLabel.textContent = 'AI ERROR';
    if (chatNote) chatNote.textContent = 'Failed to initialize AI';
  }
}

function setupCloudAI(labelName) {
  try {
    ready = true;
    busy = false;
    if (modeLabel) modeLabel.textContent = labelName;
    if (chatNote) chatNote.textContent = `POWERED BY LITELLM & ${apiType === 'proxy' ? 'BACKEND PROXY' : 'DIRECT'}`;

    if (gate) gate.style.display = 'none';
    input.disabled = false;
    send.disabled = false;
    if (micBtn) micBtn.disabled = false;
    if (centralMicBtn) {
      centralMicBtn.disabled = false;
      if (voiceStatus) voiceStatus.textContent = 'Voice Mode Connected';
      if (voiceTranscript) voiceTranscript.textContent = 'Tap to start speaking';
    }

    if (modelSelect && availableModels.length > 0) {
      modelSelect.innerHTML = '';
      availableModels.forEach(modelId => {
        const opt = document.createElement('option');
        opt.value = modelId;
        opt.textContent = modelId;
        modelSelect.appendChild(opt);
      });
      // Default model preference
      const preferred = availableModels.find(m => m.includes('deepseek') || m.includes('glm-5'));
      selectedModel = preferred || availableModels[0];
      modelSelect.value = selectedModel;
      modelSelect.style.display = 'block';

      modelSelect.addEventListener('change', (e) => {
        selectedModel = e.target.value;
      });
    }

    addMessage(`Connected to ${labelName}. Ready to chat.`);
    if (pendingPrompt) {
      input.value = pendingPrompt;
      pendingPrompt = '';
      form.requestSubmit();
    }
    console.log('[AI] Cloud AI setup complete:', labelName);
  } catch (e) {
    console.error('[AI] setupCloudAI failed:', e);
    ready = false;
    busy = false;
  }
}

function toggle(open) {
  try {
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    launch.setAttribute('aria-expanded', String(open));
    launch.style.visibility = open ? 'hidden' : 'visible';
    if (open) {
      if (!ready && !busy && apiType === 'local') {
        initAI();
      }
      updateModeUI();
      if (isVoiceModeActive && ready) {
        setTimeout(startVoiceListening, 400);
      }
      if (ready && !isVoiceModeActive) { /* no autofocus */ }
    } else {
      stopVoiceListening();
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    }
  } catch (e) {
    console.warn('[UI] toggle failed:', e);
  }
}

launch.addEventListener('click', () => toggle(true));
close.addEventListener('click', () => toggle(false));
if (clearBtn) {
  clearBtn.addEventListener('click', clearChat);
  clearBtn.addEventListener('mouseenter', () => { clearBtn.style.opacity = '1'; clearBtn.style.color = 'var(--acid)'; });
  clearBtn.addEventListener('mouseleave', () => { clearBtn.style.opacity = '0.6'; clearBtn.style.color = 'var(--muted)'; });
}
addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false) });

// Voice mode toggle header button
if (toggleVoiceModeBtn) {
  toggleVoiceModeBtn.addEventListener('click', () => {
    isVoiceModeActive = !isVoiceModeActive;
    updateModeUI();
    if (isVoiceModeActive && ready) {
      setTimeout(startVoiceListening, 250);
    } else {
      stopVoiceListening();
    }
  });
}

// Central mic button
if (centralMicBtn) {
  centralMicBtn.addEventListener('click', () => {
    if (voiceListeningActive) {
      stopVoiceListening();
    } else if (currentAudio) {
      currentAudio.pause(); currentAudio = null;
      centralMicBtn.classList.remove('speaking');
      centralMicBtn.innerHTML = '🎙️';
    } else {
      startVoiceListening();
    }
  });
}

// Switch to text mode button
if (switchToTextBtn) {
  switchToTextBtn.addEventListener('click', () => {
    isVoiceModeActive = false;
    stopVoiceListening();
    updateModeUI();
  });
}

let currentAudio = null;
let streamingPlayer = null;

// Streaming WAV Player - plays audio as it's being generated
class StreamingWavPlayer {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "playback" });
    this.sampleRate = 0;
    this.numChannels = 0;
    this.headerParsed = false;
    this.headerBuffer = new Uint8Array(44);
    this.headerBytesReceived = 0;
    this.nextStartTime = 0;
    this.isPlaying = false;
    this.minBufferSize = 8192; // Lower threshold for faster startup
    this.pcmData = new Uint8Array(0);
    this.onFirstAudio = null;
    this.onEnded = null;
    this.stopped = false;
  }

  parseWavHeader(header) {
    const view = new DataView(header.buffer);
    const riff = String.fromCharCode.apply(null, Array.from(header.slice(0, 4)));
    const wave = String.fromCharCode.apply(null, Array.from(header.slice(8, 12)));
    if (riff !== 'RIFF' || wave !== 'WAVE') {
      throw new Error('Invalid WAV file');
    }
    this.numChannels = view.getUint16(22, true);
    this.sampleRate = view.getUint32(24, true);
    this.headerParsed = true;
  }

  appendPcmData(newData) {
    const newBuffer = new Uint8Array(this.pcmData.length + newData.length);
    newBuffer.set(this.pcmData);
    newBuffer.set(newData, this.pcmData.length);
    this.pcmData = newBuffer;
  }

  async tryPlayBuffer() {
    if (!this.headerParsed || this.pcmData.length < this.minBufferSize || this.stopped) return;

    const bytesPerSample = this.numChannels * 2;
    const samplesToPlay = Math.floor(this.pcmData.length / bytesPerSample);
    const bytesToPlay = samplesToPlay * bytesPerSample;
    if (bytesToPlay === 0) return;

    const dataToPlay = this.pcmData.slice(0, bytesToPlay);
    this.pcmData = this.pcmData.slice(bytesToPlay);

    const audioBuffer = this.audioContext.createBuffer(this.numChannels, samplesToPlay, this.sampleRate);
    const int16Data = new Int16Array(dataToPlay.buffer, dataToPlay.byteOffset, samplesToPlay * this.numChannels);

    for (let channel = 0; channel < this.numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < samplesToPlay; i++) {
        channelData[i] = int16Data[i * this.numChannels + channel] / 32768;
      }
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    source.start(startTime);

    if (!this.firstAudioPlayed && this.onFirstAudio) {
      this.firstAudioPlayed = true;
      this.onFirstAudio();
    }

    this.nextStartTime = startTime + audioBuffer.duration;
    this.isPlaying = true;

    if (this.pcmData.length >= this.minBufferSize && !this.stopped) {
      setTimeout(() => this.tryPlayBuffer(), 10);
    }
  }

  addChunk(chunk) {
    if (this.stopped) return;
    if (!this.headerParsed) {
      const headerBytesNeeded = 44 - this.headerBytesReceived;
      const bytesToCopy = Math.min(headerBytesNeeded, chunk.length);
      this.headerBuffer.set(chunk.slice(0, bytesToCopy), this.headerBytesReceived);
      this.headerBytesReceived += bytesToCopy;
      if (this.headerBytesReceived >= 44) {
        this.parseWavHeader(this.headerBuffer);
        if (chunk.length > bytesToCopy) {
          this.appendPcmData(chunk.slice(bytesToCopy));
        }
      }
    } else {
      this.appendPcmData(chunk);
    }
    this.tryPlayBuffer();
  }

  stop() {
    this.stopped = true;
    this.isPlaying = false;
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

function speakNative(text) {
  try {
    if (!window.speechSynthesis) {
      console.warn('[TTS] speechSynthesis not available');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05; utter.pitch = 1.0; utter.lang = 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha'));
    if (preferred) utter.voice = preferred;
    utter.onend = () => {
      try {
        if (centralMicBtn) { centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getSpeakerIcon({ animated: false }); }
        if (isVoiceModeActive && autoListenAfterSpeak) startVoiceListening();
      } catch (e) { console.warn('[TTS] speakNative onend error:', e); }
    };
    utter.onerror = (e) => {
      console.warn('[TTS] speakNative error:', e);
      if (centralMicBtn) { centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getSpeakerIcon({ animated: false }); }
    };
    window.speechSynthesis.speak(utter);
    console.log('[TTS] Native speech started');
  } catch (e) {
    console.error('[TTS] speakNative failed:', e);
  }
}

async function speakText(text, buttonElement) {
  try {
    // Stop any current playback
    if (streamingPlayer) {
      streamingPlayer.stop();
      streamingPlayer = null;
      if (buttonElement) buttonElement.innerHTML = getSpeakerIcon({ animated: false });
      if (centralMicBtn) { centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getMicIcon(); }
      return;
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
      if (buttonElement) buttonElement.innerHTML = getSpeakerIcon({ animated: false });
      if (centralMicBtn) { centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getMicIcon(); }
      return;
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (buttonElement) buttonElement.innerHTML = getSpeakerIcon({ animated: false });
      if (centralMicBtn) { centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getMicIcon(); }
      return;
    }

    // Stop voice recognition while speaking to prevent hearing itself
    if (voiceListeningActive) {
      stopVoiceListening();
    }

    // Show loading state
    if (buttonElement) { buttonElement.innerHTML = getLoadingIcon(); buttonElement.disabled = true; }
    if (isVoiceModeActive && centralMicBtn) { centralMicBtn.classList.add('speaking'); centralMicBtn.innerHTML = getSpeakerIcon({ animated: true }); }

    const cleanText = text.replace(/[*_`#\-]/g, '').trim();
    console.log('[TTS] Starting TTS for:', cleanText.substring(0, 50) + '...');

    // Show text with typing animation immediately
    let messageP = null;
    if (buttonElement) {
      messageP = buttonElement.parentElement.querySelector('p');
    } else {
      const lastBotMessage = messages.querySelector('.message.bot:last-of-type');
      if (lastBotMessage) {
        const p = lastBotMessage.querySelector('p');
        if (p && p.textContent.trim() === cleanText) {
          messageP = p;
        }
      }
    }
    if (messageP && !messageP.textContent.trim()) {
      // For voice mode, reveal line by line
      if (isVoiceModeActive) {
        const lines = cleanText.split(/\n|(?<=\.) /g).filter(line => line.trim().length > 0);
        let lineIndex = 0;
        const showNextLine = () => {
          if (lineIndex < lines.length) {
            messageP.textContent = lines.slice(0, lineIndex + 1).join('\n');
            lineIndex++;
            setTimeout(showNextLine, 300);
          }
        };
        showNextLine();
      } else {
        typeOutAnimation(messageP, cleanText, true); // keyboard mode: fast 8ms/char
      }
    }

    const TTS_TIMEOUT_MS = 15000;

    let response = null;

    try {
      const formData = new FormData();
      formData.append('text', cleanText);

      // Try proxy first (avoids CORS issues in development)
      try {
        console.log('[TTS] Trying proxy /api/tts...');
        const proxyPromise = fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: cleanText })
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Proxy timeout')), TTS_TIMEOUT_MS));
        response = await Promise.race([proxyPromise, timeoutPromise]);
        if (!response.ok) throw new Error(`Proxy failed with status ${response.status}`);
        console.log('[TTS] Proxy connected');
      } catch (proxyError) {
        console.warn('[TTS] Proxy failed, trying direct:', proxyError.message);
        // Try direct TTS (may fail due to CORS in development)
        console.log('[TTS] Trying direct TTS at:', TTS_DIRECT_URL);
        const directPromise = fetch(TTS_DIRECT_URL, {
          method: 'POST',
          body: formData,
          mode: 'cors'
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Direct timeout')), TTS_TIMEOUT_MS));
        response = await Promise.race([directPromise, timeoutPromise]);
        if (!response.ok) throw new Error(`Direct TTS failed with status ${response.status}`);
        console.log('[TTS] Direct TTS connected');
      }

      // Use streaming player for immediate playback
      if (!response?.body) {
        throw new Error('TTS response body is empty or not streamable');
      }

      const reader = response.body.getReader();
      streamingPlayer = new StreamingWavPlayer();

      streamingPlayer.onFirstAudio = () => {
        // First audio chunk received - update UI
        if (buttonElement) { buttonElement.innerHTML = getStopIcon(); buttonElement.disabled = false; }
        if (centralMicBtn) { centralMicBtn.classList.add('speaking'); centralMicBtn.innerHTML = getStopIcon(); }
      };

      streamingPlayer.onEnded = () => {
        if (buttonElement) { buttonElement.innerHTML = getSpeakerIcon({ animated: false }); buttonElement.disabled = false; }
        if (centralMicBtn) { centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getMicIcon(); }
        streamingPlayer = null;
        if (isVoiceModeActive && autoListenAfterSpeak) startVoiceListening();
      };

      // Process stream
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Stream complete - wait for audio to finish
              setTimeout(() => {
                if (streamingPlayer && !streamingPlayer.stopped) {
                  streamingPlayer.onEnded?.();
                }
              }, 500);
              break;
            }
            if (value && streamingPlayer) {
              streamingPlayer.addChunk(value);
            }
          }
        } catch (e) {
          console.error('Stream error:', e);
          streamingPlayer?.stop();
          streamingPlayer = null;
        }
      };

      processStream();

    } catch (error) {
      console.warn('[TTS] Streaming TTS failed, falling back to native:', error);
      if (buttonElement) { buttonElement.innerHTML = getSpeakerIcon({ animated: false }); buttonElement.disabled = false; }
      if (centralMicBtn) { centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getMicIcon(); }
      streamingPlayer = null;
      speakNative(cleanText);
    }
  } catch (e) {
    console.error('[TTS] speakText failed completely:', e);
    if (buttonElement) { buttonElement.innerHTML = getSpeakerIcon({ animated: false }); buttonElement.disabled = false; }
    if (centralMicBtn) { centralMicBtn.classList.remove('speaking'); centralMicBtn.innerHTML = getMicIcon(); }
    speakNative(text.replace(/[*_`#\-]/g, '').trim());
  }
}

// SVG Icon Helpers with animations
function getMicIcon() {
  return `<svg class="mic-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/></svg>`;
}

function getSpeakerIcon({ animated = false } = {}) {
  const animClass = animated ? 'animating' : '';
  return `<svg class="speaker-icon ${animClass}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path class="wave1" d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path class="wave2" d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
}

function getLoadingIcon() {
  return `<svg class="loading-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"><animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite"/></circle></svg>`;
}

function getStopIcon() {
  return `<svg class="stop-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>`;
}

function getClearIcon() {
  return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
}

// Clear chat history
function clearChat() {
  try {
    history.length = 1; // Keep only system prompt
    messages.innerHTML = '';
    addMessage('Chat cleared. How can I help you?');
    Sfx.playClick();
    console.log('[Chat] Chat cleared');
  } catch (e) {
    console.error('[Chat] clearChat failed:', e);
  }
}

function addMessage(text, who = 'bot') {
  try {
    const row = document.createElement('div');
    row.className = `message ${who}`;
    row.style.cssText = 'display:flex;align-items:flex-start;gap:8px;margin-bottom:12px;';
    const badge = document.createElement('span');
    badge.textContent = who === 'bot' ? 'AI' : 'YOU';
    const p = document.createElement('p');
    p.style.flex = '1'; p.style.margin = '0';
    if (text) p.textContent = text;
    row.append(badge, p);
    if (who === 'bot' && text) {
      const ttsBtn = document.createElement('button');
      ttsBtn.className = 'tts-btn';
      ttsBtn.innerHTML = getSpeakerIcon({ animated: false });
      ttsBtn.title = 'Speak text';
      ttsBtn.onclick = () => speakText(text, ttsBtn);
      row.append(ttsBtn);
    }
    messages.append(row);
    messages.scrollTop = messages.scrollHeight;
    return p;
  } catch (e) {
    console.error('[Chat] addMessage failed:', e);
    return null;
  }
}
function addTypingIndicator() {
  const row = document.createElement('div');
  row.className = `message bot typing-row`;
  row.style.display = 'flex';
  row.style.alignItems = 'flex-start';
  row.style.gap = '8px';
  row.style.marginBottom = '12px';
  const badge = document.createElement('span');
  badge.textContent = 'AI';
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  row.append(badge, indicator);
  messages.append(row);
  messages.scrollTop = messages.scrollHeight;
  return row;
}
async function loadAI() {
  if (ready || busy) return;
  if (!('gpu' in navigator)) { statusEl.textContent = 'WEBGPU IS NOT AVAILABLE IN THIS BROWSER'; addMessage('This browser cannot run the local model. Chrome or Edge with WebGPU enabled is recommended. You can still reach Abhimanyu by email.'); return }
  busy = true; start.disabled = true; statusEl.textContent = 'LOADING WEBLLM RUNTIME…';
  try {
    const webllm = await import('https://esm.run/@mlc-ai/web-llm@0.2.84');
    engine = await webllm.CreateMLCEngine('SmolLM2-360M-Instruct-q4f16_1-MLC', { initProgressCallback: p => { const pct = Math.round((p.progress || 0) * 100); progressEl.style.width = `${pct}%`; statusEl.textContent = `${p.text || 'LOADING MODEL'} · ${pct}%` } });
    ready = true; busy = false; gate.style.display = 'none'; input.disabled = false; send.disabled = false; if (micBtn) micBtn.disabled = false; if (centralMicBtn) { centralMicBtn.disabled = false; if (voiceStatus) voiceStatus.textContent = 'Voice Mode Connected'; } addMessage("I'm ready. What would you like to know?");
    if (pendingPrompt) { input.value = pendingPrompt; pendingPrompt = ''; form.requestSubmit() }
  } catch (err) { busy = false; start.disabled = false; statusEl.textContent = 'MODEL COULD NOT LOAD · TRY AGAIN'; addMessage('The local model could not start. Check WebGPU support and available device memory, then try again.'); console.error(err) }
}
start.addEventListener('click', loadAI);
suggestions.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') return; if (!ready) { pendingPrompt = e.target.textContent; if (apiType === 'local') { loadAI() } else { initAI() } } else { input.value = e.target.textContent; form.requestSubmit() } });
form.addEventListener('submit', async e => {
  e.preventDefault(); const text = input.value.trim(); if (!text || !ready || busy) return; input.value = ''; addMessage(text, 'user'); history.push({ role: 'user', content: text }); busy = true; input.disabled = true; send.disabled = true; if (micBtn) micBtn.disabled = true; if (centralMicBtn) centralMicBtn.disabled = true;

  const typingRow = addTypingIndicator();
  let out = null;

  if (apiType === 'proxy' || apiType === 'direct') {
    try {
      const endpoint = apiType === 'proxy' ? '/api/chat' : `${baseUrl}/v1/chat/completions`;
      const headers = { 'Content-Type': 'application/json' };
      if (apiType === 'direct') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: selectedModel,
          messages: history,
          stream: true,
          temperature: 0.25,
          max_tokens: 180
        })
      });

      if (!response.ok) {
        throw new Error(`Cloud API returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned) continue;
          if (cleaned.startsWith('data: ')) {
            const dataStr = cleaned.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const deltaContent = parsed.choices[0]?.delta?.content || '';
              if (deltaContent) {
                if (!out) {
                  typingRow.remove();
                  out = addMessage('');
                  out.classList.add('typing-cursor');
                }
                answer += deltaContent;
                out.textContent = answer;
                messages.scrollTop = messages.scrollHeight;
              }
            } catch (e) { }
          }
        }
      }
      if (typingRow.parentNode) typingRow.remove();
      if (!out) out = addMessage(answer || 'No response.');
      else out.classList.remove('typing-cursor');
      history.push({ role: 'assistant', content: answer });
      if (autoSpeakResponse) {
        autoSpeakResponse = false;
        speakText(answer, null); // fire concurrently, no await (uses voice mode if isVoiceModeActive)
      }
    } catch (err) {
      if (typingRow.parentNode) typingRow.remove();
      if (!out) out = addMessage('');
      out.textContent = 'Cloud AI error. Falling back to local/webgpu option...';
      console.error(err);
      ready = false;
      apiType = 'local';
      if (modeLabel) modeLabel.textContent = 'LOCAL PRIVATE AI';
      if (chatNote) chatNote.textContent = 'ON-DEVICE AI · NO MESSAGES LEAVE YOUR BROWSER';
      if (modelSelect) modelSelect.style.display = 'none';
      if (gate) gate.style.display = 'block';
    } finally {
      busy = false; input.disabled = false; send.disabled = false; if (micBtn) micBtn.disabled = false; if (centralMicBtn) centralMicBtn.disabled = false;
    }
  } else {
    try {
      const stream = await engine.chat.completions.create({ messages: history, temperature: .25, max_tokens: 180, stream: true });
      let answer = '';
      for await (const chunk of stream) {
        const deltaContent = chunk.choices[0]?.delta?.content || '';
        if (deltaContent) {
          if (!out) {
            typingRow.remove();
            out = addMessage('');
            out.classList.add('typing-cursor');
          }
          answer += deltaContent;
          out.textContent = answer;
          messages.scrollTop = messages.scrollHeight;
        }
      }
      if (typingRow.parentNode) typingRow.remove();
      if (!out) out = addMessage(answer || 'No response.');
      else out.classList.remove('typing-cursor');
      history.push({ role: 'assistant', content: answer });
      if (autoSpeakResponse) {
        autoSpeakResponse = false;
        speakText(answer, null); // fire concurrently, no await (uses voice mode if isVoiceModeActive)
      }
    }
    catch (err) {
      if (typingRow.parentNode) typingRow.remove();
      if (!out) out = addMessage('');
      out.textContent = 'I hit a local inference error. Please try once more.';
      console.error(err);
    }
    finally { busy = false; input.disabled = false; send.disabled = false; if (micBtn) micBtn.disabled = false; if (centralMicBtn) centralMicBtn.disabled = false; input.focus() }
  }
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('Service Worker registered', reg);
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('New content available; reloading...');
                  location.reload();
                }
              }
            };
          }
        };
      })
      .catch(err => console.warn('Service Worker registration failed', err));
  });
}

// PWA Install Prompt handling
let deferredPrompt;
const installBtn = document.getElementById('pwa-install');
addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) {
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener('click', () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        } else {
          console.log('User dismissed the PWA install prompt');
        }
        deferredPrompt = null;
      });
    });
  }
});
addEventListener('appinstalled', () => {
  console.log('PWA installed successfully');
  if (installBtn) installBtn.style.display = 'none';
});

// Custom Cursor Logic
(function () {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function tick() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(tick);
  }
  tick();

  const interactives = 'a, button, input, textarea, [data-flight], .project, .chat-launch';
  addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) {
      if (!document.body.classList.contains('cursor-hover')) {
        Sfx.playHover();
      }
      document.body.classList.add('cursor-hover');
    } else {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Global click sound effect
  addEventListener('click', e => {
    if (e.target.closest(interactives)) {
      Sfx.playClick();
    }
  });

  // Interactive Timeline Expansion
  document.querySelectorAll('.timeline article').forEach(article => {
    article.addEventListener('click', () => {
      const isExpanded = article.classList.contains('expanded');
      // Collapse all other timeline articles
      document.querySelectorAll('.timeline article').forEach(a => a.classList.remove('expanded'));
      // Toggle this one
      if (!isExpanded) {
        article.classList.add('expanded');
        Sfx.playClick();
      } else {
        Sfx.playHover();
      }
    });
  });

  // Scroll-Driven Interactive Progress, Active Roles & Parallax
  const timeline = document.querySelector('.timeline');
  const progressLine = document.querySelector('.timeline-progress-line');
  const timelineArticles = document.querySelectorAll('.timeline article');

  function handleScroll() {
    // 1. Timeline progress and active state tracking (smoothly bound to first/last items)
    if (timeline && progressLine && timelineArticles.length > 0) {
      const firstArt = timelineArticles[0];
      const lastArt = timelineArticles[timelineArticles.length - 1];
      const firstRect = firstArt.getBoundingClientRect();
      const lastRect = lastArt.getBoundingClientRect();
      
      const startActiveY = window.innerHeight * 0.65;
      
      const totalHeight = lastRect.bottom - firstRect.top;
      const passed = Math.max(0, Math.min(totalHeight, startActiveY - firstRect.top));
      const percent = (passed / totalHeight) * 100;
      progressLine.style.height = `${percent}%`;

      let currentActive = null;
      timelineArticles.forEach(article => {
        const artRect = article.getBoundingClientRect();
        if (artRect.top < startActiveY) {
          currentActive = article;
        }
      });

      timelineArticles.forEach(article => {
        if (article === currentActive) {
          article.classList.add('active-role');
        } else {
          article.classList.remove('active-role');
        }
      });
    }

    // 2. Active header navigation scroll spy highlight
    const sections = ['experience', 'work', 'about'];
    let activeSec = null;
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.15) {
          activeSec = id;
        }
      }
    });

    const navLinks = document.querySelectorAll('header nav a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (activeSec && href === `#${activeSec}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const headerEl = document.querySelector('header');
    if (headerEl) {
      // Dark header when over dark sections (experience)
      const darkSections = ['experience'];
      const isDark = darkSections.some(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
      });
      if (isDark) {
        headerEl.classList.add('dark-header');
      } else {
        headerEl.classList.remove('dark-header');
      }
      // Mobile: show header after scrolling past hero (top ~80px)
      if (window.innerWidth <= 800) {
        if (window.scrollY > 80) {
          headerEl.classList.add('header-visible');
        } else {
          headerEl.classList.remove('header-visible');
        }
      } else {
        // Desktop: always show header
        headerEl.classList.add('header-visible');
      }
    }

    // 2. Hero 3D spaceship scroll parallax
    const canvas = document.getElementById('field');
    const hero = document.querySelector('.hero');
    if (canvas && hero) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        scrollProgress = window.scrollY / docHeight;
      }

      if (scrollProgress > 0.82) {
        canvas.style.opacity = `${(1.0 - scrollProgress) / 0.18}`;
      } else {
        canvas.style.opacity = '1';
      }
      canvas.style.transform = 'none';
    }

    // 3. Project card & about-visual scroll parallax
    document.querySelectorAll('.project, .about-visual').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const speed = el.classList.contains('about-visual') ? 0.06 : 0.04;
        const yOffset = (rect.top - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${yOffset}px)`;
      }
    });
  }

  addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial run on load
})();

// micBtn in the text bar also starts voice mode
if (micBtn) {
  micBtn.addEventListener('click', () => {
    isVoiceModeActive = true;
    updateModeUI();
    startVoiceListening();
  });
}
