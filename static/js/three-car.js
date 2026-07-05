import { Sfx } from './sfx.js';

export const ThreeCarState = {
  entryStart: 0,
  modelLoaded: false,
  modelFailed: false,
  modelLoadPercent: 0,
  scrollProgress: 0,
  smoothScroll: 0
};

export async function initThree({ canvas, renderer, scene, camera }) {
  try {
    const THREE = window.THREE;
    if (!THREE?.GLTFLoader) throw new Error('Three.js or GLTFLoader did not initialize');
    
    // Use the existing scene, camera, and renderer passed in. No need to create new ones.
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    
    camera.position.set(0, 0, 7);
    const group = new THREE.Group();
    scene.add(group);
    
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.38, 2),
      new THREE.MeshBasicMaterial({ color: 0xc9ff36, wireframe: true, transparent: true, opacity: .1 })
    );
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 1),
      new THREE.MeshBasicMaterial({ color: 0x26301d, wireframe: true, transparent: true, opacity: .28 })
    );
    core.position.z = -1.8;
    wire.position.z = -1.7;
    group.add(core, wire);

    // Glowing green starfield
    const particleData = [];
    for (let i = 0; i < 150; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 6.5;
      particleData.push(r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * .65, r * Math.sin(b) * Math.sin(a));
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particleData, 3));
    const orbit = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0x242920, size: .045, transparent: true, opacity: 0.5 })
    );
    group.add(orbit);

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.75, .008, 3, 72),
      new THREE.MeshBasicMaterial({ color: 0x536146, transparent: true, opacity: .45 })
    );
    ring1.rotation.x = 1.08;
    group.add(ring1);
    
    const ring2 = ring1.clone();
    ring2.scale.setScalar(1.25);
    ring2.rotation.set(.4, .8, 0);
    group.add(ring2);
    
    const carRig = new THREE.Group();
    carRig.visible = false;
    scene.add(carRig);
    
    let mixer = null;
    let gearAction = null;
    let gearOpen = true;
    let keyLight = null;
    let rimLight = null;
    
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1, 48),
      new THREE.MeshBasicMaterial({ color: 0x11130f, transparent: true, opacity: .13, depthWrite: false })
    );
    shadow.scale.set(2.2, .42, 1);
    shadow.rotation.x = -Math.PI / 2;
    scene.add(shadow);
    
    scene.add(new THREE.HemisphereLight(0xdde7f0, 0x171915, 1.15));
    keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(-4, 5, 6);
    scene.add(keyLight);
    
    rimLight = new THREE.PointLight(0xffa31a, 5.5, 12);
    rimLight.position.set(3, -1, 3);
    scene.add(rimLight);
    
    const carStatus = document.querySelector('#car-status');
    
    console.log('[Hovercar] Initiating model load');
new THREE.GLTFLoader().load('static/models/hovercar.glb', gltf => {
      const car = gltf.scene;
      const box = new THREE.Box3().setFromObject(car);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 5.1 / Math.max(size.x, size.y, size.z);
      
      car.scale.setScalar(scale);
      car.position.copy(center).multiplyScalar(-scale);
      car.rotation.y = Math.PI / 2 - .22;
      
      car.traverse(node => {
        if (node.isMesh) {
          node.frustumCulled = false;
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(m => {
            if (!m) return;
            const name = (m.name || '').toLowerCase();
            const tone = name.includes('body') ? 0x34383d : name.includes('metal') ? 0x202326 : name.includes('plastic') ? 0x111315 : null;
            if (tone !== null) {
              if (m.color) m.color.setHex(tone);
              if (m.uniforms?.diffuse?.value) m.uniforms.diffuse.value.setHex(tone);
            }
            if (m.map) m.map.encoding = THREE.sRGBEncoding;
            if (m.emissiveMap) m.emissiveMap.encoding = THREE.sRGBEncoding;
            m.side = THREE.DoubleSide;
            m.needsUpdate = true;
          });
        }
      });
      
      carRig.add(car); console.log('[Hovercar] Model added to scene');
      carRig.visible = true;
      carStatus.classList.add('ready');
      carStatus.textContent = 'HOVERCAR ONLINE';
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
          gearAction.reset();
          gearAction.time = 0;
          gearAction.timeScale = 1;
          gearAction.paused = false;
          gearAction.play();
          gearOpen = true;
        }
      }
      ThreeCarState.modelLoaded = true;
    }, xhr => {
      if (xhr.total) {
        const pct = Math.round(xhr.loaded / xhr.total * 100);
        ThreeCarState.modelLoadPercent = pct;
        if (carStatus.lastChild) carStatus.lastChild.textContent = ` LOADING HOVERCAR · ${pct}%`;
      }
    }, err => {
      carStatus.classList.add('error'); console.error('[Hovercar] Failed to load', err);
      carStatus.textContent = '3D MODEL UNAVAILABLE';
      console.warn('Hovercar could not load', err);
      ThreeCarState.modelFailed = true;
      const controls = document.getElementById('flight-controls');
      if (controls) controls.style.display = 'none';
    });

    let mx = 0, my = 0, manualYaw = 0, manualPitch = 0, manualRoll = 0, userScale = 1.1, autoRotate = true, boostUntil = 0;
    
    addEventListener('pointermove', e => {
      mx = e.clientX / innerWidth - .5;
      my = e.clientY / innerHeight - .5;
    }, { passive: true });

    const controlDock = document.querySelector('#flight-controls');
    const sizeControl = document.querySelector('#flight-size');
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
      if (action === 'auto') {
        autoRotate = !autoRotate;
        target?.setAttribute('aria-pressed', String(autoRotate));
      }
      if (action === 'reset') {
        manualYaw = 0; manualPitch = 0; manualRoll = 0; userScale = 1.1; sizeControl.value = 110; autoRotate = false;
        controlDock.querySelector('[data-flight="auto"]').setAttribute('aria-pressed', 'false');
      }
    }

    if (controlDock) {
      controlDock.addEventListener('click', e => {
        const button = e.target.closest('button');
        const action = button?.dataset.flight;
        if (action) fly(action, button);
      });
    }

    function resize() {
      const r = canvas.getBoundingClientRect();
      if (r.height > 0 && r.width > 0) {
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
      }
    }
    addEventListener('resize', resize);
    resize();

    addEventListener('keydown', e => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const action = {
        a: 'yaw-left', ArrowLeft: 'yaw-left',
        d: 'yaw-right', ArrowRight: 'yaw-right',
        w: 'pitch-up', ArrowUp: 'pitch-up',
        s: 'pitch-down', ArrowDown: 'pitch-down',
        q: 'roll-left', e: 'roll-right',
        ' ': 'boost', r: 'reset'
      }[e.key];
      if (action) {
        e.preventDefault();
        fly(action);
      }
    });

    if (sizeControl) {
      sizeControl.addEventListener('input', () => {
        userScale = Number(sizeControl.value) / 100;
      });
    }

    // Mobile Gamepad joystick & gyroscope
    (function () {
      const joystickBase = document.getElementById('joystick-base');
      const joystickStick = document.getElementById('joystick-stick');
      const gyroBtn = document.getElementById('gyro-btn');
      const boostBtn = document.getElementById('boost-btn');

      if (joystickBase && joystickStick) {
        let active = false;
        let startX = 0, startY = 0;
        const maxDistance = 30;

        function onStart(e) {
          active = true;
          const t = e.touches ? e.touches[0] : e;
          startX = t.clientX;
          startY = t.clientY;
          joystickStick.style.transition = 'none';
        }

        function onMove(e) {
          if (!active) return;
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
          joystickStick.style.transition = 'transform 0.2s ease';
          joystickStick.style.transform = 'translate(0px,0px)';
          mx = 0; my = 0;
        }

        joystickBase.addEventListener('touchstart', onStart, { passive: true });
        addEventListener('touchmove', onMove, { passive: false });
        addEventListener('touchend', onEnd);
      }

      let gyroActive = false;
      function onOrientation(e) {
        if (!gyroActive) return;
        if (e.beta !== null && e.gamma !== null) {
          let pitch = 0, roll = 0;
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
            gyroBtn.textContent = 'GYRO: OFF';
            gyroBtn.classList.remove('active');
            removeEventListener('deviceorientation', onOrientation);
            mx = 0; my = 0;
          } else {
            try {
              if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                const res = await DeviceOrientationEvent.requestPermission();
                if (res === 'granted') enableGyro();
                else alert('Gyroscope access denied');
              } else {
                enableGyro();
              }
            } catch (err) {
              console.warn('Gyro error', err);
              enableGyro();
            }
          }
        });

        function enableGyro() {
          gyroActive = true;
          gyroBtn.textContent = 'GYRO: ON';
          gyroBtn.classList.add('active');
          addEventListener('deviceorientation', onOrientation);
        }
      }

      if (boostBtn) {
        boostBtn.addEventListener('touchstart', e => {
          e.preventDefault();
          boostUntil = performance.now() + 900;
          boostBtn.classList.add('active');
        });
        boostBtn.addEventListener('touchend', () => {
          boostBtn.classList.remove('active');
        });
      }
    })();

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let last = 0, previousX = 0;
    
    function render(ms = 0) {
      requestAnimationFrame(render);
      if (ms - last < 33) return;
      const delta = Math.min((ms - last) / 1000, .05);
      last = ms;
      
      const t = clock.getElapsedTime();
      const boost = Math.max(0, (boostUntil - ms) / 900);
      const entry = ThreeCarState.entryStart ? Math.max(0, Math.min(1, (ms - ThreeCarState.entryStart) / 1800)) : 0;
      const ease = 1 - Math.pow(1 - entry, 3);
      
      const isMobile = window.innerWidth <= 800;
      const baseX = isMobile ? 0 : 1.75;
      const baseY = isMobile ? -1.6 : -.02;
      const baseScale = isMobile ? 0.82 : 0.78;
      
      ThreeCarState.smoothScroll = THREE.MathUtils.lerp(ThreeCarState.smoothScroll, ThreeCarState.scrollProgress, 0.04);
      const sp = ThreeCarState.smoothScroll;
      
      const flyX = Math.sin(sp * Math.PI * 1.2) * (isMobile ? 1.2 : 2.8);
      const flyY = -sp * (isMobile ? 1.2 : 2.2) + Math.sin(sp * Math.PI * 0.8) * 0.5;
      const flyZ = Math.sin(sp * Math.PI) * (isMobile ? -0.8 : -2.2);
      const flyScale = 1.0 - Math.sin(sp * Math.PI) * (isMobile ? 0.12 : 0.22);
      
      const flyYaw = Math.sin(sp * Math.PI * 1.2) * 0.55;
      const flyRoll = -Math.cos(sp * Math.PI * 1.2) * 0.22 + 0.22;
      const flyPitch = -sp * 0.25 + Math.sin(sp * Math.PI * 0.8) * 0.15;
      
      if (keyLight) {
        keyLight.position.x = THREE.MathUtils.lerp(-4, 2, sp);
        keyLight.intensity = THREE.MathUtils.lerp(2.6, 1.8, sp);
      }
      if (rimLight) {
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

      if (gearAction) {
        const inTransit = sp >= 0.05 && sp <= 0.88;
        const shouldClose = inTransit || boost > 0.45;
        if (shouldClose && gearOpen) {
          gearOpen = false;
          gearAction.paused = false;
          gearAction.timeScale = -1;
          gearAction.play();
          Sfx.playGear(false);
        } else if (!shouldClose && !gearOpen) {
          gearOpen = true;
          gearAction.paused = false;
          gearAction.timeScale = 1;
          gearAction.play();
          Sfx.playGear(true);
        }
      }

      if (ThreeCarState.modelFailed) {
        shadow.visible = false;
        group.visible = true;
        group.rotation.y = t * 0.05;
        orbit.rotation.y = -t * 0.08;
        group.position.set(0, 0, -1.5);
        group.scale.setScalar(isMobile ? 0.65 : 0.95);
      } else {
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
  } catch (err) {
    console.warn('ThreeCar initialization failed', err);
    ThreeCarState.modelFailed = true;
  }
}
