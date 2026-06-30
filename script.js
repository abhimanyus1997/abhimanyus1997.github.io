const canvas=document.querySelector('#field');
document.documentElement.dataset.portfolioJs='ready';

let entryStart = 0;
let modelLoaded = false;
let modelFailed = false;
let modelLoadPercent = 0;

// Web Audio API Sound Synthesizer (100% offline, zero-latency, synthesized dynamically)
const Sfx = {
  ctx: null,
  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) this.ctx = new AudioContext();
  },
  playClick() {
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
  },
  playHover() {
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
  },
  playScramble() {
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
  },
  playSlide() {
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
  },
  playBoost() {
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
  },
  playGear(isOpen) {
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
  },
  playArrival() {
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
  },
  playManeuver() {
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
  },
  playStartup() {
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
  },
  playGlitch() {
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
  },
  playChime() {
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

async function initThree(){
  try{
    const THREE=window.THREE;
    if(!THREE?.GLTFLoader)throw new Error('Three.js or GLTFLoader did not initialize');
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(42,1,.1,100);
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0x000000,0);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
    camera.position.set(0,0,7);
    const group=new THREE.Group();
    scene.add(group);
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.38,2),new THREE.MeshBasicMaterial({color:0xc9ff36,wireframe:true,transparent:true,opacity:.28}));
    const wire=new THREE.Mesh(new THREE.IcosahedronGeometry(1.55,1),new THREE.MeshBasicMaterial({color:0xc9ff36,wireframe:true,transparent:true,opacity:.45}));
    core.position.z=-1.8;wire.position.z=-1.7;group.add(core,wire);
    
    // Glowing green starfield
    const particleData=[];
    for(let i=0;i<150;i++){
      const a=Math.random()*Math.PI*2;
      const b=Math.acos(2*Math.random()-1);
      const r=3+Math.random()*6.5;
      particleData.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b)*.65,r*Math.sin(b)*Math.sin(a));
    }
    const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.Float32BufferAttribute(particleData,3));
    const orbit=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0xc9ff36,size:.08,transparent:true,opacity:0.8}));group.add(orbit);
    
    const ring1=new THREE.Mesh(new THREE.TorusGeometry(2.15,.028,3,72),new THREE.MeshBasicMaterial({color:0xc9ff36,transparent:true,opacity:.75}));
    ring1.rotation.x=1.08;group.add(ring1);
    const ring2=ring1.clone();ring2.scale.setScalar(1.22);ring2.rotation.set(.4,.8,0);group.add(ring2);
    const carRig=new THREE.Group();carRig.visible=false;scene.add(carRig);let mixer=null;
    let gearAction=null;let gearOpen=true;
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:0x11130f,transparent:true,opacity:.13,depthWrite:false}));shadow.scale.set(2.2,.42,1);shadow.rotation.x=-Math.PI/2;scene.add(shadow);
    scene.add(new THREE.HemisphereLight(0xdde7f0,0x171915,1.2));
    const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(-4,5,6);scene.add(key);
    const fill=new THREE.DirectionalLight(0x90b900,1.2);fill.position.set(4,-3,3);scene.add(fill);
    const rim=new THREE.PointLight(0xc9ff36,7.5,12);rim.position.set(3,1,-3);scene.add(rim);
    const accent=new THREE.PointLight(0xffa31a,4.5,12);accent.position.set(-3,-1.5,-2);scene.add(accent);
    const carStatus=document.querySelector('#car-status');
    new THREE.GLTFLoader().load('./static/models/hovercar.glb',gltf=>{
      const car=gltf.scene;const box=new THREE.Box3().setFromObject(car),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
      const scale=5.1/Math.max(size.x,size.y,size.z);car.scale.setScalar(scale);car.position.copy(center).multiplyScalar(-scale);car.rotation.y=Math.PI/2-.22;
      car.traverse(node=>{if(node.isMesh){node.frustumCulled=false;const mats=Array.isArray(node.material)?node.material:[node.material];mats.forEach(m=>{if(!m)return;const name=(m.name||'').toLowerCase();const tone=name.includes('body')?0x34383d:name.includes('metal')?0x202326:name.includes('plastic')?0x111315:null;if(tone!==null){if(m.color)m.color.setHex(tone);if(m.uniforms?.diffuse?.value)m.uniforms.diffuse.value.setHex(tone)}if(m.map)m.map.encoding=THREE.sRGBEncoding;if(m.emissiveMap)m.emissiveMap.encoding=THREE.sRGBEncoding;m.side=THREE.DoubleSide;m.needsUpdate=true})}});
      carRig.add(car);carRig.visible=true;
      carStatus.classList.add('ready');carStatus.textContent='HOVERCAR ONLINE';
      document.body.classList.add('model-ready');
      
      if(gltf.animations?.length){
        mixer=new THREE.AnimationMixer(car);
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
          gearAction.time = gearClip.duration;
          gearAction.paused = true;
          gearAction.play();
        }
      }
      modelLoaded = true;
    },xhr=>{if(xhr.total){const pct=Math.round(xhr.loaded/xhr.total*100);modelLoadPercent = pct;if(carStatus.lastChild)carStatus.lastChild.textContent=` LOADING HOVERCAR · ${pct}%`}},err=>{
      carStatus.classList.add('error');
      carStatus.textContent='3D MODEL UNAVAILABLE';
      console.warn('Hovercar could not load',err);
      modelFailed = true;
      const controls = document.getElementById('flight-controls');
      if (controls) controls.style.display = 'none';
    });
    let mx=0,my=0,manualYaw=0,manualPitch=0,manualRoll=0,userScale=1.1,autoRotate=true,boostUntil=0;
    addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
    const controlDock=document.querySelector('#flight-controls'),sizeControl=document.querySelector('#flight-size');
    if (controlDock) {
      const autoBtn = controlDock.querySelector('[data-flight="auto"]');
      if (autoBtn) autoBtn.setAttribute('aria-pressed', 'true');
    }

    function fly(action,target){
      if(action==='yaw-left' || action==='yaw-right' || action==='pitch-up' || action==='pitch-down' || action==='roll-left' || action==='roll-right') {
        Sfx.playManeuver();
      }
      if(action==='yaw-left')manualYaw-=.3;
      if(action==='yaw-right')manualYaw+=.3;
      if(action==='pitch-up')manualPitch=Math.min(.55,manualPitch+.14);
      if(action==='pitch-down')manualPitch=Math.max(-.55,manualPitch-.14);
      if(action==='roll-left')manualRoll=Math.max(-.65,manualRoll-.15);
      if(action==='roll-right')manualRoll=Math.min(.65,manualRoll+.15);
      if(action==='boost') {
        boostUntil=performance.now()+900;
        Sfx.playBoost();
      }
      if(action==='auto'){autoRotate=!autoRotate;target?.setAttribute('aria-pressed',String(autoRotate))}
      if(action==='reset'){
        manualYaw=0;manualPitch=0;manualRoll=0;userScale=1.1;sizeControl.value=110;autoRotate=false;
        controlDock.querySelector('[data-flight="auto"]').setAttribute('aria-pressed','false');
      }
    }
    controlDock.addEventListener('click',e=>{const button=e.target.closest('button'),action=button?.dataset.flight;if(action)fly(action,button)});
    function resize(){
      const r=canvas.getBoundingClientRect();
      if (r.height > 0 && r.width > 0) {
        renderer.setSize(r.width,r.height,false);
        camera.aspect=r.width/r.height;
        camera.updateProjectionMatrix();
      }
    }
    addEventListener('resize',resize);resize();
    addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const action={a:'yaw-left',ArrowLeft:'yaw-left',d:'yaw-right',ArrowRight:'yaw-right',w:'pitch-up',ArrowUp:'pitch-up',s:'pitch-down',ArrowDown:'pitch-down',q:'roll-left',e:'roll-right',' ':'boost',r:'reset'}[e.key];if(action){e.preventDefault();fly(action)}});
    sizeControl.addEventListener('input',()=>{userScale=Number(sizeControl.value)/100});
    
    // Mobile Gamepad & Gyroscope Controls
    (function() {
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
          const dist = Math.min(Math.sqrt(dx*dx + dy*dy), maxDistance);
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
          mx = 0;
          my = 0;
        }
        
        joystickBase.addEventListener('touchstart', onStart, {passive: true});
        addEventListener('touchmove', onMove, {passive: false});
        addEventListener('touchend', onEnd);
      }
      
      let gyroActive = false;
      function onOrientation(e) {
        if (!gyroActive) return;
        if (e.beta !== null && e.gamma !== null) {
          const pitch = (e.beta - 48) / 22;
          const roll = e.gamma / 22;
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
            mx = 0;
            my = 0;
          } else {
            try {
              if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                const res = await DeviceOrientationEvent.requestPermission();
                if (res === 'granted') {
                  enableGyro();
                } else {
                  alert('Gyroscope access denied');
                }
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

    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,clock=new THREE.Clock();
    let last=0,previousX=0;
    function render(ms=0){
      requestAnimationFrame(render);
      if(ms-last<33)return;
      const delta=Math.min((ms-last)/1000,.05);
      last=ms;
      const t=clock.getElapsedTime(),
            boost=Math.max(0,(boostUntil-ms)/900),
            entry=entryStart?Math.max(0,Math.min(1,(ms-entryStart)/1800)):0,
            ease=1-Math.pow(1-entry,3);
      
      const isMobile=window.innerWidth<=800;
      const baseX=isMobile?0:1.75;
      const baseY=isMobile?0.08:-.02;
      const baseScale=isMobile?0.54:0.78;
      
      const x=baseX+(1-ease)*(isMobile?0:4.8)+mx*.24;
      const y=baseY+(1-ease)*(isMobile?0:.65)-my*.12+Math.sin(boost*Math.PI)*.28;
      const z=-.2+(1-ease)*(isMobile?0:-1.5)+boost*.45;
      const s=baseScale*userScale*(.35+.65*ease)*(1+Math.sin(boost*Math.PI)*.08);
      
      carRig.position.set(x,y+(!reduce?Math.sin(t*1.2)*.055:0),z);
      carRig.scale.setScalar(s);
      carRig.rotation.y=THREE.MathUtils.lerp(carRig.rotation.y,manualYaw+mx*.35+(autoRotate?t*.5:0)+(1-ease)*-1.15,.08);
      carRig.rotation.z=THREE.MathUtils.lerp(carRig.rotation.z,manualRoll+(x-previousX)*-.18+Math.sin(t*.7)*.014,.08);
      carRig.rotation.x=THREE.MathUtils.lerp(carRig.rotation.x,manualPitch-my*.14-boost*.12+(1-ease)*.12,.08);
      previousX=x;
      
      // Automatic Landing Gear based on boost state
      if (gearAction) {
        if (boost > 0.45 && gearOpen) {
          gearOpen = false;
          gearAction.paused = false;
          gearAction.timeScale = -1; // Retract
          gearAction.play();
          Sfx.playGear(false);
        } else if (boost === 0 && !gearOpen) {
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
        group.position.set(0, 0, -1.5);
        group.scale.setScalar(isMobile ? 0.65 : 0.95);
      } else {
        shadow.visible = true;
        shadow.position.set(x,y-(isMobile?.44:.62),z-.15);
        shadow.scale.set(1.9*s*(1+boost*.25),.34*s,1);
        shadow.material.opacity=.12*ease*(1-boost*.4);
        
        group.visible=true;
        group.rotation.y=t*.05;
        orbit.rotation.y=-t*.08;
        group.position.set(isMobile?0:1.8,isMobile?.1:.1,isMobile?-1.5:-1.5);
        group.scale.setScalar(isMobile?.42:.58);
      }
      
      if(mixer)mixer.update(delta);
      renderer.render(scene,camera);
    }
    render();
  }catch(err){modelFailed=true;canvas.hidden=true;console.warn('3D scene unavailable',err)}
}
initThree();

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'none'}],{duration:700,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'})}),{threshold:.12});
document.querySelectorAll('.project,.timeline article').forEach(e=>io.observe(e));

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
  
  function finishIntro() {
    if (sequenceFinished) return;
    sequenceFinished = true;
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
    }, {passive: false});
  }
  
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishIntro();
    return;
  }
  
  // Play startup triple-beep
  Sfx.playStartup();
  
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
  
  finishIntro();
}

runBootSequence();

fetch('./static/images/pilot_sync.svg')
  .then(r => r.text())
  .then(svgText => {
    const container = document.querySelector('.pilot-sync-svg-container');
    if (container) container.innerHTML = svgText;
  })
  .catch(err => console.warn('Could not load pilot sync SVG', err));





const launch=document.querySelector('#chat-launch'),panel=document.querySelector('#chat-panel'),close=document.querySelector('#chat-close'),start=document.querySelector('#start-ai'),statusEl=document.querySelector('#model-status'),progressEl=document.querySelector('#model-progress'),gate=document.querySelector('#model-gate'),form=document.querySelector('#chat-form'),input=document.querySelector('#chat-input'),send=form.querySelector('button'),messages=document.querySelector('#chat-messages'),suggestions=document.querySelector('#suggestions');
let engine=null,ready=false,busy=false,pendingPrompt='';
const history=[{role:'system',content:`You are the concise portfolio assistant for Abhimanyu Singh. Use only these facts. He is a Data Scientist Manager and AI/robotics engineer in Noida with 4+ years of industry and 2 years of research experience. HDFC Bank (Dec 2025-present): building Neev Agent Catalogue over LiteLLM and an internal Streamlit MLOps annotation platform. Quantiphi (Sep-Nov 2025): GCP Vertex AI Document OCR pipeline for financial documents. Alphadroid (Jun 2024-Sep 2025): lift-PLC and GeoJSON robot navigation, multilingual RAG on SageMaker, Flutter/TFLite MobileFaceNet at 99.5% accuracy, MQTT/ECR/Vault fleet systems. IIT Guwahati (Jun 2023-May 2024): GroundingDINO underwater data pipelines improved quality 35%; ONNX reduced latency 3-4 seconds. HealthView (2019-2021): NLP curation and D3.js dashboards. Projects: MicroClaw agentic ESP32 firmware using C++, FreeRTOS, Gemini/Groq and FastAPI; HealthBuddy with Flutter, Health Connect, Groq and BYOK; Resume JD Matcher with Gemini 2.5, LangChain, TF-IDF and Plotly; Langchain One multimodal OCR assistant. Education: M.Tech Automation and Robotics at DIAT/DRDO, CGPA 8.47; B.Tech Mechanical Engineering at LNMIIT, CGPA 8.16. Published an IndiaAI object-detection article and presented subaqueous crack detection at RCRM 2024. Contact: abhimanyusingh1997.work@gmail.com. If asked beyond these facts, say you do not know and suggest emailing him. Never invent claims. Keep answers under 100 words.`}];
function toggle(open){panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',String(!open));launch.setAttribute('aria-expanded',String(open));launch.style.visibility=open?'hidden':'visible';if(open&&ready)input.focus()}
launch.addEventListener('click',()=>toggle(true));
close.addEventListener('click',()=>toggle(false));
addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});
function addMessage(text,who='bot'){const row=document.createElement('div');row.className=`message ${who}`;const badge=document.createElement('span');badge.textContent=who==='bot'?'AI':'YOU';const p=document.createElement('p');p.textContent=text;row.append(badge,p);messages.append(row);messages.scrollTop=messages.scrollHeight;return p}
async function loadAI(){
  if(ready||busy)return;
  if(!('gpu'in navigator)){statusEl.textContent='WEBGPU IS NOT AVAILABLE IN THIS BROWSER';addMessage('This browser cannot run the local model. Chrome or Edge with WebGPU enabled is recommended. You can still reach Abhimanyu by email.');return}
  busy=true;start.disabled=true;statusEl.textContent='LOADING WEBLLM RUNTIME…';
  try{
    const webllm=await import('https://esm.run/@mlc-ai/web-llm@0.2.84');
    engine=await webllm.CreateMLCEngine('SmolLM2-360M-Instruct-q4f16_1-MLC',{initProgressCallback:p=>{const pct=Math.round((p.progress||0)*100);progressEl.style.width=`${pct}%`;statusEl.textContent=`${p.text||'LOADING MODEL'} · ${pct}%`}});
    ready=true;busy=false;gate.remove();input.disabled=false;send.disabled=false;addMessage('I’m ready. What would you like to know?');input.focus();
    if(pendingPrompt){input.value=pendingPrompt;pendingPrompt='';form.requestSubmit()}
  }catch(err){busy=false;start.disabled=false;statusEl.textContent='MODEL COULD NOT LOAD · TRY AGAIN';addMessage('The local model could not start. Check WebGPU support and available device memory, then try again.');console.error(err)}
}
start.addEventListener('click',loadAI);
suggestions.addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')return;if(!ready){pendingPrompt=e.target.textContent;loadAI()}else{input.value=e.target.textContent;form.requestSubmit()}});
form.addEventListener('submit',async e=>{
  e.preventDefault();const text=input.value.trim();if(!text||!ready||busy)return;input.value='';addMessage(text,'user');history.push({role:'user',content:text});busy=true;input.disabled=true;send.disabled=true;const out=addMessage('');
  try{const stream=await engine.chat.completions.create({messages:history,temperature:.25,max_tokens:180,stream:true});let answer='';for await(const chunk of stream){answer+=chunk.choices[0]?.delta?.content||'';out.textContent=answer;messages.scrollTop=messages.scrollHeight}history.push({role:'assistant',content:answer})}
  catch(err){out.textContent='I hit a local inference error. Please try once more.';console.error(err)}
  finally{busy=false;input.disabled=false;send.disabled=false;input.focus()}
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
(function() {
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
})();
