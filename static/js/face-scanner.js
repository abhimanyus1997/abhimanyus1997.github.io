// Native Cyber Neural Face Scanner Module
const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
const REFERENCE_IMAGE = "abhimanyu-reference.jpg";
const MATCH_THRESHOLD = 0.62;

let faceMatcher = null;
let audioContext = null;
let masterGain = null;
let scanLoopTimer = null;
let statusTimer = null;
let completionCallback = null;

let scanState = "searching"; // "searching", "scanning", "verified", "unknown"
let scanProgress = 0;
let scanStartTime = 0;
let targetLockedTime = 0;

let lastSpokenTime = 0;
let lastSpokenIdentity = ""; // "ABHIMANYU", "UNKNOWN", "MULTIPLE"

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Static Landmarked coordinates for simulated/mock scan fallback
const staticLandmarks = [
  {x: 45, y: 110}, {x: 48, y: 130}, {x: 54, y: 150}, {x: 64, y: 170}, {x: 78, y: 185},
  {x: 90, y: 190}, {x: 102, y: 185}, {x: 116, y: 170}, {x: 126, y: 150}, {x: 132, y: 130},
  {x: 135, y: 110},
  {x: 90, y: 95}, {x: 90, y: 110}, {x: 90, y: 125}, {x: 90, y: 138},
  {x: 78, y: 138}, {x: 84, y: 142}, {x: 90, y: 144}, {x: 96, y: 142}, {x: 102, y: 138},
  {x: 66, y: 105}, {x: 72, y: 98}, {x: 78, y: 98}, {x: 84, y: 105}, {x: 78, y: 109}, {x: 72, y: 109},
  {x: 96, y: 105}, {x: 102, y: 98}, {x: 108, y: 98}, {x: 114, y: 105}, {x: 108, y: 109}, {x: 102, y: 109},
  {x: 72, y: 160}, {x: 80, y: 155}, {x: 90, y: 153}, {x: 100, y: 155}, {x: 108, y: 160},
  {x: 100, y: 168}, {x: 90, y: 170}, {x: 80, y: 168}
];

// Scramble text function for cyberpunk HUD text animations
function scrambleText(elementId, newText) {
  const el = document.getElementById(elementId);
  if (!el || el.textContent === newText) return;
  
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  let iterations = 0;
  
  clearInterval(el.scrambleInterval);
  el.scrambleInterval = setInterval(() => {
    el.innerHTML = newText
      .split("")
      .map((char, index) => {
        if (char === " " || char === ":" || char === "/" || char === "%" || char === ".") {
          return char;
        }
        if (index < iterations) {
          return newText[index];
        }
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");
    
    if (iterations >= newText.length) {
      clearInterval(el.scrambleInterval);
    }
    iterations += 1;
  }, 20);
}

function addHudLog(text) {
  const logs = document.getElementById("hudLogs");
  if (!logs) return;
  const time = new Date().toLocaleTimeString().split(" ")[0];
  logs.innerHTML += `\n[${time}] ${text}`;
  logs.scrollTop = logs.scrollHeight;
}

function createAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.10;
    masterGain.connect(audioContext.destination);
  } catch (e) {
    console.warn("AudioContext failed:", e);
  }
}

function tone(freq, duration, type = "sine", gain = 0.10, delay = 0) {
  if (!audioContext || audioContext.state === "suspended") return;
  try {
    const now = audioContext.currentTime + delay;
    const osc = audioContext.createOscillator();
    const gNode = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gNode.gain.setValueAtTime(0.0001, now);
    gNode.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    gNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gNode);
    gNode.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  } catch (e) {
    console.warn("Tone failed:", e);
  }
}

// STT Speech Recognition Trigger
let _sttRec = null;
let _sttActive = false;
function startSTT() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    if (_sttActive) return;
    if (!_sttRec) {
      _sttRec = new SpeechRecognition();
    }
    const recognition = _sttRec;
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      _sttActive = true;
      console.log("Voice listening active...");
      addHudLog("VOICE LISTENING SYSTEM: ACTIVE");
      scrambleText("scanStatus", "LISTENING FOR DIRECTION...");
    };

    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex];
      if (!result.isFinal) return;
      const resultText = result[0].transcript.toLowerCase().trim();
      console.log("Speech recognized: " + resultText);
      addHudLog(`VOICE INPUT RECEIVED: "${resultText.toUpperCase()}"`);
      
      let targetHash = "#top";
      let selectionName = "HOME";

      if (resultText.includes("project") || resultText.includes("work") || resultText.includes("portfolio")) {
        targetHash = "#work";
        selectionName = "PROJECTS";
      } else if (resultText.includes("experience") || resultText.includes("career") || resultText.includes("job") || resultText.includes("resume")) {
        targetHash = "#experience";
        selectionName = "EXPERIENCE";
      } else if (resultText.includes("about") || resultText.includes("profile") || resultText.includes("bio") || resultText.includes("info")) {
        targetHash = "#about";
        selectionName = "ABOUT";
      }

      addHudLog(`COMMAND REGISTERED: ROUTING TO ${selectionName}`);
      scrambleText("scanStatus", `TARGET RESOLVED: ${selectionName}`);

      // Display the biometric navigation confirmation overlay
      const overlay = document.getElementById("hudConfirmOverlay");
      if (overlay) {
        overlay.classList.add("active");
        scrambleText("hudConfirmTarget", `TARGET: ${selectionName}`);
        
        let seconds = 3;
        const proceedBtn = document.getElementById("hudConfirmProceed");
        const cancelBtn = document.getElementById("hudConfirmCancel");
        const countdownEl = document.getElementById("hudConfirmCountdown");

        if (countdownEl) countdownEl.textContent = `TRANSFERRING DATA IN ${seconds}s...`;
        
        clearInterval(window.confirmTimer);
        window.confirmTimer = setInterval(() => {
          seconds--;
          tone(880, 0.05, "sine", 0.03); // countdown beep!
          if (countdownEl) countdownEl.textContent = `TRANSFERRING DATA IN ${seconds}s...`;

          if (seconds <= 0) {
            clearInterval(window.confirmTimer);
            executeRoute();
          }
        }, 1000);

        function executeRoute() {
          overlay.classList.remove("active");
          addHudLog(`DATA STREAM COMMITTED // ROUTING INITIALIZED`);
          if (completionCallback) completionCallback(targetHash);
        }

        if (proceedBtn) {
          proceedBtn.onclick = () => {
            clearInterval(window.confirmTimer);
            executeRoute();
          };
        }

        if (cancelBtn) {
          cancelBtn.onclick = () => {
            clearInterval(window.confirmTimer);
            overlay.classList.remove("active");
            addHudLog("WARNING: TRANSFER ABORTED BY USER DIRECTIVE");
            scrambleText("scanStatus", "SEARCHING FOR SUBJECT...");
            scanState = "searching";
          };
        }
      } else {
        // Fallback if overlay is not in DOM
        if (completionCallback) {
          setTimeout(() => completionCallback(targetHash), 1500);
        }
      }
    };
    
    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.warn("STT Error:", event.error);
      addHudLog(`VOICE LISTENING ERROR: ${event.error.toUpperCase()}`);
    };

    recognition.onend = () => {
      _sttActive = false;
      console.log("Speech recognition ended.");
    };

    _sttActive = false;
    try { recognition.start(); } catch(_) {}
  } else {
    console.warn("SpeechRecognition not supported in this browser.");
    addHudLog("VOICE LISTENING SYSTEM: NOT SUPPORTED");
    scrambleText("scanStatus", "ROUTING TO PORTFOLIO...");
    if (completionCallback) {
      setTimeout(() => completionCallback("#top"), 2000);
    }
  }
}

// iOS-safe WAV playback via AudioContext (bypasses autoplay restrictions)
async function playAudioFile(path, onEnded) {
  if (!audioContext) {
    if (onEnded) setTimeout(onEnded, 100);
    return;
  }
  if (audioContext.state === 'suspended') {
    try { await audioContext.resume(); } catch(_) {}
  }
  try {
    const resp = await fetch(path);
    if (!resp.ok) throw new Error(resp.status);
    const buf = await resp.arrayBuffer();
    const decoded = await audioContext.decodeAudioData(buf);
    const src = audioContext.createBufferSource();
    src.buffer = decoded;
    src.connect(masterGain || audioContext.destination);
    if (onEnded) src.onended = onEnded;
    src.start(0);
  } catch (e) {
    console.warn("Audio fetch/decode failed:", e);
    if (onEnded) setTimeout(onEnded, 500);
  }
}

function playNavigationPrompt() {
  addHudLog("VOICE PROMPT: WHERE WOULD YOU LIKE TO GO?");
  const queryText = "Where would you like to go? You can say: Projects, Experience, or About.";
  playAudioFile("static/audio/welcome-prompt-query.wav", () => startSTT())
    .catch(() => { speakFallback(queryText); setTimeout(startSTT, 4000); });
}

function sweep(startFreq, endFreq, duration, gain = 0.07) {
  if (!audioContext || audioContext.state === "suspended") return;
  try {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gNode = audioContext.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gNode.gain.setValueAtTime(0.0001, now);
    gNode.gain.exponentialRampToValueAtTime(gain, now + 0.04);
    gNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gNode);
    gNode.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch (e) {
    console.warn("Sweep failed:", e);
  }
}

function noiseBurst(duration = 0.12, gain = 0.04) {
  if (!audioContext || audioContext.state === "suspended") return;
  try {
    const bufSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
    }
    const source = audioContext.createBufferSource();
    const gNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    gNode.gain.value = gain;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gNode);
    gNode.connect(masterGain);
    source.start();
  } catch (e) {
    console.warn("Noise burst failed:", e);
  }
}

function bootSound() {
  tone(180, 0.12, "sine", 0.08, 0);
  tone(360, 0.1, "triangle", 0.08, 0.11);
  tone(720, 0.12, "triangle", 0.07, 0.22);
  noiseBurst(0.14, 0.03);
}

function scanSound() {
  sweep(220, 980, 0.6, 0.03);
  tone(1200, 0.04, "square", 0.03, 0.12);
  tone(1600, 0.04, "square", 0.025, 0.32);
}

function verifiedSound() {
  tone(523.25, 0.11, "triangle", 0.07, 0);
  tone(659.25, 0.11, "triangle", 0.07, 0.1);
  tone(783.99, 0.18, "triangle", 0.08, 0.2);
  tone(1046.5, 0.24, "sine", 0.07, 0.34);
}

// Fallback TTS
function speakFallback(text) {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                    voices.find(v => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis failed:", e);
    }
  }
}

// Plays pre-generated WAV audio files (faster load & higher quality)
function playWelcomeAudio(label, gender, count) {
  const now = Date.now();
  if (now - lastSpokenTime < 15000) return;

  let filename = "";

  if (count > 1) {
    if (lastSpokenIdentity === "MULTIPLE" && now - lastSpokenTime < 30000) return;
    const idx = Math.floor(Math.random() * 3) + 1; // 1 to 3
    filename = `welcome-group-${idx}`;
    lastSpokenIdentity = "MULTIPLE";
  } else if (label === "ABHIMANYU") {
    if (lastSpokenIdentity === "ABHIMANYU") return;
    const idx = Math.floor(Math.random() * 4) + 1; // 1 to 4
    filename = `welcome-abhimanyu-${idx}`;
    lastSpokenIdentity = "ABHIMANYU";
  } else {
    if (lastSpokenIdentity === "UNKNOWN") return;
    const idx = Math.floor(Math.random() * 4) + 1; // 1 to 4
    const gSuffix = gender === "female" ? "female" : "male";
    filename = `welcome-unknown-${gSuffix}-${idx}`;
    lastSpokenIdentity = "UNKNOWN";
  }

  if (filename) {
    lastSpokenTime = now;
    const fallbackText = getFallbackText(label, gender, count);
    const audioPath = `static/audio/${filename}.wav`;
    playAudioFile(audioPath, () => playNavigationPrompt())
      .catch(() => { speakFallback(fallbackText); setTimeout(playNavigationPrompt, 4000); });
  }
}

function getFallbackText(label, gender, count) {
  if (count > 1) {
    return "I can see a lot of people around you, but I want to focus on you.";
  } else if (label === "ABHIMANYU") {
    return "Access granted. Welcome back, pilot Abhimanyu. Systems initialized.";
  } else {
    const title = gender === "female" ? "madam" : "sir";
    return `You are not Abhimanyu. But happy to welcome you, ${title}.`;
  }
}

function drawCyberBox(ctx, box, label, confidence, expression, age, gender, distanceText, canvasWidth, canvasHeight) {
  const x = canvasWidth - box.x - box.width;
  const y = box.y;
  const w = box.width;
  const h = box.height;

  const cx = x + w / 2;
  const cy = y + h / 2;

  const isKnown = label === "ABHIMANYU";
  const color = isKnown ? "#a6ff2f" : "#ffcc33";
  const glow = isKnown ? "#a6ff2f" : "#ffcc33";

  // Calculate resolution scaling factor (base = 300px width)
  const scale = canvasWidth / 300;

  ctx.save();

  // Full bounding box
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * scale;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 10 * scale;
  ctx.strokeRect(x, y, w, h);

  // Localized laser sweep scan inside the face bounding box
  const sweepPeriod = 2000;
  const sweepVal = (Date.now() % sweepPeriod) / sweepPeriod;
  const bouncePos = sweepVal < 0.5 ? (sweepVal * 2) : ((1 - sweepVal) * 2);
  const lineY = y + h * bouncePos;

  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 6 * scale;
  ctx.beginPath();
  ctx.moveTo(x, lineY);
  ctx.lineTo(x + w, lineY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, lineY - 12 * scale, 0, lineY + 12 * scale);
  grad.addColorStop(0, "rgba(166, 255, 47, 0)");
  grad.addColorStop(0.5, isKnown ? "rgba(166, 255, 47, 0.14)" : "rgba(255, 204, 51, 0.14)");
  grad.addColorStop(1, "rgba(166, 255, 47, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(x, lineY - 12 * scale, w, 24 * scale);
  ctx.restore();

  // Corner accents
  const corner = Math.min(16 * scale, w * 0.15);
  ctx.beginPath();
  ctx.moveTo(x, y + corner); ctx.lineTo(x, y); ctx.lineTo(x + corner, y);
  ctx.moveTo(x + w - corner, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + corner);
  ctx.moveTo(x + w, y + h - corner); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - corner, y + h);
  ctx.moveTo(x + corner, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - corner);
  ctx.lineWidth = 3 * scale;
  ctx.stroke();

  // Crosshairs
  ctx.shadowBlur = 6 * scale;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - 10 * scale, cy); ctx.lineTo(cx - 3 * scale, cy);
  ctx.moveTo(cx + 3 * scale, cy); ctx.lineTo(cx + 10 * scale, cy);
  ctx.moveTo(cx, cy - 10 * scale); ctx.lineTo(cx, cy - 3 * scale);
  ctx.moveTo(cx, cy + 3 * scale); ctx.lineTo(cx, cy + 10 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 14 * scale, 0, Math.PI * 2);
  ctx.stroke();

  // Label tag
  const tagWidth = (isKnown ? 145 : 125) * scale;
  const tagHeight = 44 * scale;
  const tagX = x;
  const tagY = Math.max(5 * scale, y - tagHeight - 6 * scale);

  ctx.shadowBlur = 5 * scale;
  ctx.fillStyle = "rgba(0, 0, 0, 0.76)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 * scale;
  ctx.fillRect(tagX, tagY, tagWidth, tagHeight);
  ctx.strokeRect(tagX, tagY, tagWidth, tagHeight);

  ctx.fillStyle = isKnown ? "#f4ffe9" : "#ffcc33";
  ctx.font = "bold " + Math.round(9 * scale) + "px Courier New";
  ctx.fillText(isKnown ? "PILOT: ABHIMANYU" : "UNKNOWN SUBJECT", tagX + 6 * scale, tagY + 12 * scale);

  ctx.fillStyle = color;
  ctx.font = Math.round(7 * scale) + "px Courier New";
  ctx.fillText(`CONFIDENCE: ${confidence}`, tagX + 6 * scale, tagY + 22 * scale);
  ctx.fillText(`EXPR: ${expression.toUpperCase()}`, tagX + 6 * scale, tagY + 32 * scale);

  // Live Telemetry Side Panel
  const panelW = 100 * scale;
  const panelH = 58 * scale;
  let panelX = x + w + 10 * scale;
  let panelY = y + 5 * scale;

  if (panelX + panelW > canvasWidth - 10 * scale) panelX = x - panelW - 10 * scale;
  if (panelX < 10 * scale) panelX = 10 * scale;

  ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
  ctx.strokeStyle = "rgba(166, 255, 47, 0.45)";
  ctx.shadowBlur = 4 * scale;
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.fillStyle = "#a6ff2f";
  ctx.font = Math.round(7 * scale) + "px Courier New";
  ctx.fillText("LIVE_TELEMETRY", panelX + 6 * scale, panelY + 10 * scale);
  ctx.fillText(`W: ${Math.round(w)}px H: ${Math.round(h)}px`, panelX + 6 * scale, panelY + 20 * scale);
  ctx.fillText(`GENDER: ${gender.toUpperCase()}`, panelX + 6 * scale, panelY + 30 * scale);
  ctx.fillText(`AGE: ${Math.round(age)} YRS`, panelX + 6 * scale, panelY + 40 * scale);
  ctx.fillText(`DIST: ${distanceText}`, panelX + 6 * scale, panelY + 50 * scale);

  // Connector line from side panel to center of face
  ctx.beginPath();
  ctx.moveTo(panelX, panelY + panelH / 2);
  ctx.lineTo(cx, cy);
  ctx.strokeStyle = "rgba(166, 255, 47, 0.3)";
  ctx.lineWidth = 0.8 * scale;
  ctx.stroke();

  ctx.restore();
}

function drawLandmarks(ctx, landmarks, canvasWidth) {
  const positions = landmarks.positions;
  const scale = canvasWidth / 300;

  ctx.save();
  ctx.fillStyle = "#38ff7a";
  ctx.strokeStyle = "rgba(56, 255, 122, 0.42)";
  ctx.shadowColor = "#38ff7a";
  ctx.shadowBlur = 4 * scale;
  ctx.lineWidth = 0.8 * scale;

  for (const point of positions) {
    ctx.beginPath();
    ctx.arc(canvasWidth - point.x, point.y, 1.2 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  function connectRange(start, end, close = false) {
    ctx.beginPath();
    for (let i = start; i <= end; i++) {
      const p = positions[i];
      if (i === start) ctx.moveTo(canvasWidth - p.x, p.y);
      else ctx.lineTo(canvasWidth - p.x, p.y);
    }
    if (close) {
      const p = positions[start];
      ctx.lineTo(canvasWidth - p.x, p.y);
    }
    ctx.stroke();
  }

  connectRange(0, 16, false);
  connectRange(17, 21, false);
  connectRange(22, 26, false);
  connectRange(27, 30, false);
  connectRange(31, 35, false);
  connectRange(36, 41, true);
  connectRange(42, 47, true);
  connectRange(48, 59, true);
  connectRange(60, 67, true);

  ctx.restore();
}

function drawSimulatedScan() {
  const canvas = document.getElementById("scanCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cw = canvas.width;
  const ch = canvas.height;

  ctx.clearRect(0, 0, cw, ch);

  if (scanState !== "verified") return;

  const box = {
    x: cw * 0.22,
    y: ch * 0.22,
    width: cw * 0.56,
    height: ch * 0.52
  };

  // Draw simulated cyber bounding box and metadata
  drawCyberBox(ctx, box, "ABHIMANYU", "99%", "Happy", 26, "male", "0.18", cw, ch);

  // Draw simulated face landmark points
  ctx.save();
  ctx.fillStyle = "#38ff7a";
  ctx.strokeStyle = "rgba(56, 255, 122, 0.42)";
  ctx.shadowColor = "#38ff7a";
  ctx.shadowBlur = 4;
  ctx.lineWidth = 0.8;

  // Scale functions
  const sx = x => (x / 180) * cw;
  const sy = y => (y / 240) * ch;

  for (const pt of staticLandmarks) {
    ctx.beginPath();
    ctx.arc(sx(pt.x), sy(pt.y), 1.0, 0, Math.PI * 2);
    ctx.fill();
  }

  function connect(start, end, close = false) {
    ctx.beginPath();
    for (let i = start; i <= end; i++) {
      const pt = staticLandmarks[i];
      if (i === start) ctx.moveTo(sx(pt.x), sy(pt.y));
      else ctx.lineTo(sx(pt.x), sy(pt.y));
    }
    if (close) {
      const pt = staticLandmarks[start];
      ctx.lineTo(sx(pt.x), sy(pt.y));
    }
    ctx.stroke();
  }

  connect(0, 10, false);
  connect(11, 14, false);
  connect(15, 19, false);
  connect(20, 25, true);
  connect(26, 31, true);
  connect(32, 39, true);

  ctx.restore();
}

function startStatusCycle() {
  const statusText = document.getElementById("scanStatus");
  let index = 0;
  statusText.textContent = states[index];
  addHudLog(`SIMULATED FEED: ${states[index]}`);
  
  clearInterval(statusTimer);
  statusTimer = setInterval(() => {
    index = (index + 1) % states.length;
    statusText.textContent = states[index];
    addHudLog(`SIMULATED FEED: ${states[index]}`);

    const progressEl = document.querySelector('.pilot-sync-progress');
    const simProgress = Math.round(((index + 1) / states.length) * 100);
    if (progressEl) progressEl.style.width = `${simProgress}%`;
    scrambleText("hud-sync-level", "CORRELATION: " + simProgress + "%");

    if (index === states.length - 1) {
      verifiedSound();
      const verifiedText = document.getElementById("verifiedText");
      if (verifiedText) {
        verifiedText.textContent = "IDENTIFIED";
        verifiedText.style.opacity = 1;
      }
      scanState = "verified";
      
      scrambleText("hud-identity", "IDENTITY: ABHIMANYU");
      scrambleText("hud-confidence", "MATCH LEVEL: 99.7%");
      scrambleText("hud-gender", "GENDER: MALE");
      scrambleText("hud-age", "AGE ESTIMATE: 26 YRS");
      scrambleText("hud-expression", "EXPRESSION: HAPPY");
      scrambleText("hud-sync-level", "CORRELATION: 100%");
      addHudLog("ACCESS GRANTED // CORRELATION INDEX: 99.7% // WELCOME PILOT");
      
      playWelcomeAudio("ABHIMANYU", "male", 1);
    } else {
      tone(980 + index * 70, 0.045, "square", 0.025);
    }
  }, 1050);
}

function startScanLoop() {
  clearInterval(scanLoopTimer);
  scanSound();
  scanLoopTimer = setInterval(() => {
    scanSound();
    noiseBurst(0.08, 0.018);
  }, 3150);
}

async function loadModels() {
  const statusText = document.getElementById("scanStatus");
  const progressEl = document.querySelector('.pilot-sync-progress');
  if (progressEl) progressEl.style.width = '0%';

  const steps = [
    { name: "TinyFaceDetector", load: () => faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), pct: 15 },
    { name: "FaceLandmarks68", load: () => faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL), pct: 35 },
    { name: "FaceRecognition", load: () => faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL), pct: 55 },
    { name: "FaceExpression", load: () => faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL), pct: 70 },
    { name: "AgeGenderNet", load: () => faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL), pct: 85 }
  ];

  for (const step of steps) {
    statusText.textContent = `LOADING ${step.name.toUpperCase()}...`;
    await step.load();
    addHudLog(`LOADED ${step.name.toUpperCase()} MODEL`);
    if (progressEl) progressEl.style.width = `${step.pct}%`;
    tone(600 + step.pct * 4, 0.05, "sine", 0.015);
  }

  statusText.textContent = `LOADING REFERENCE IMAGE...`;
  try {
    const img = await faceapi.fetchImage(REFERENCE_IMAGE);
    const referenceDetection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5
      }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (referenceDetection) {
      const labeledDescriptor = new faceapi.LabeledFaceDescriptors("ABHIMANYU", [
        referenceDetection.descriptor
      ]);
      faceMatcher = new faceapi.FaceMatcher(labeledDescriptor, MATCH_THRESHOLD);
      statusText.textContent = `REFERENCE LOADED`;
      addHudLog("PILOT REFERENCE REGISTRY SYNCED");
    } else {
      statusText.textContent = `REFERENCE FACE NOT FOUND`;
      addHudLog("WARNING: PILOT REGISTER CORRUPT / NO FACE DETECTED");
    }
  } catch (error) {
    console.warn("Reference image missing/load failed:", error);
    statusText.textContent = `REFERENCE IMAGE MISSING`;
    addHudLog("WARNING: REFERENCE ASSETS NOT REACHABLE");
  }

  if (progressEl) progressEl.style.width = '100%';
  await sleep(300);
}

async function startWebcam() {
  const video = document.getElementById("scanVideo");
  const canvas = document.getElementById("scanCanvas");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: isMobile ? 480 : 640 },
      height: { ideal: isMobile ? 640 : 480 }
    },
    audio: false
  });

  video.srcObject = stream;
  await new Promise((resolve) => {
    video.onloadedmetadata = resolve;
  });
  await video.play();

  // Hide fallback media
  const fallbackMedia = document.querySelector('.live-fallback-media');
  if (fallbackMedia) fallbackMedia.style.display = 'none';

  video.style.display = 'block';
  canvas.style.display = 'block';
  
  addHudLog("WEBCAM STREAM ESTABLISHED // CAPTURING FEED");
}

function resizeCanvas() {
  const canvas = document.getElementById("scanCanvas");
  const video = document.getElementById("scanVideo");
  if (!canvas || !video) return;
  
  // Align canvas resolution with webcam's internal video resolution
  if (video.videoWidth) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  } else {
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 400;
  }
}

async function detectLoop() {
  const video = document.getElementById("scanVideo");
  const canvas = document.getElementById("scanCanvas");
  if (!video || !canvas) return;
  const ctx = canvas.getContext("2d");
  const progressEl = document.querySelector('.pilot-sync-progress');
  const statusText = document.getElementById("scanStatus");

  if (video.paused || video.ended) {
    requestAnimationFrame(detectLoop);
    return;
  }

  resizeCanvas();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.5
  });

  try {
    const detections = await faceapi
      .detectAllFaces(video, options)
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const resized = faceapi.resizeResults(detections, { width: canvas.width, height: canvas.height });

    if (resized.length === 0) {
      if (scanState !== "searching" && Date.now() - targetLockedTime > 2000) {
        scanState = "searching";
        scanProgress = 0;
        if (progressEl) progressEl.style.width = '0%';
        statusText.textContent = "SEARCHING FOR SUBJECT...";
        statusText.classList.remove('error-hud');
        document.getElementById("verifiedText").style.opacity = 0;
        
        scrambleText("hud-identity", "IDENTITY: ACQUIRING...");
        scrambleText("hud-confidence", "MATCH LEVEL: 00%");
        scrambleText("hud-gender", "GENDER: PENDING");
        scrambleText("hud-age", "AGE ESTIMATE: PENDING");
        scrambleText("hud-expression", "EXPRESSION: ANALYZING");
        scrambleText("hud-sync-level", "CORRELATION: 0%");
        addHudLog("TARGET LOST // BIOMETRIC FOCUS DRIFTED");
      }
    } else {
      const result = resized[0];
      const box = result.detection.box;
      const [expr, exprScore] = Object.entries(result.expressions).sort((a, b) => b[1] - a[1])[0];
      
      let label = "UNKNOWN";
      let distanceText = "--";

      if (faceMatcher) {
        const bestMatch = faceMatcher.findBestMatch(result.descriptor);
        distanceText = bestMatch.distance.toFixed(2);
        if (bestMatch.label === "ABHIMANYU" && bestMatch.distance <= MATCH_THRESHOLD) {
          label = "ABHIMANYU";
        }
      }

      if (scanState === "searching") {
        scanState = "scanning";
        scanStartTime = Date.now();
        bootSound();
        addHudLog("BIOMETRIC CAPTURED // RUNNING BIO_DECRYPTION");
      }

      if (scanState === "scanning") {
        const elapsed = Date.now() - scanStartTime;
        scanProgress = Math.min(100, Math.floor((elapsed / 3000) * 100));
        if (progressEl) progressEl.style.width = `${scanProgress}%`;
        scrambleText("hud-sync-level", "CORRELATION: " + scanProgress + "%");

        const scanPhase = Math.floor(elapsed / 750);
        let currentPhaseText = "";
        if (scanPhase === 0) currentPhaseText = "SCANNING FACIAL GEOMETRY...";
        else if (scanPhase === 1) currentPhaseText = "MAPPING EYE LANDMARKS...";
        else if (scanPhase === 2) currentPhaseText = "ANALYZING BEARD SIGNATURE...";
        else if (scanPhase === 3) currentPhaseText = "MATCHING NEURAL PATTERN...";
        
        statusText.textContent = currentPhaseText;
        scrambleText("hud-identity", "IDENTITY: ANALYZING...");

        if (scanProgress >= 100) {
          if (label === "ABHIMANYU") {
            scanState = "verified";
            statusText.textContent = "CONFIDENCE: 99.7%";
            statusText.classList.remove('error-hud');
            const verifiedText = document.getElementById("verifiedText");
            if (verifiedText) {
              verifiedText.textContent = "IDENTIFIED";
              verifiedText.style.opacity = 1;
            }
            verifiedSound();
            
            scrambleText("hud-identity", "IDENTITY: ABHIMANYU");
            scrambleText("hud-confidence", "MATCH LEVEL: 99.7%");
            scrambleText("hud-gender", "GENDER: " + result.gender.toUpperCase());
            scrambleText("hud-age", "AGE ESTIMATE: " + Math.round(result.age) + " YRS");
            scrambleText("hud-expression", "EXPRESSION: " + expr.toUpperCase());
            scrambleText("hud-sync-level", "CORRELATION: 100%");
            addHudLog("ACCESS GRANTED // CORRELATION INDEX: 99.7% // WELCOME PILOT");
            
            playWelcomeAudio("ABHIMANYU", result.gender, resized.length);
          } else {
            scanState = "unknown";
            statusText.textContent = "IDENTITY UNKNOWN";
            statusText.classList.add('error-hud');
            const verifiedText = document.getElementById("verifiedText");
            if (verifiedText) {
              verifiedText.textContent = "UNKNOWN";
              verifiedText.style.opacity = 1;
            }
            noiseBurst(0.2, 0.05);
            tone(220, 0.15, "sawtooth", 0.06);
            
            scrambleText("hud-identity", "IDENTITY: UNKNOWN");
            scrambleText("hud-confidence", "MATCH LEVEL: 00%");
            scrambleText("hud-gender", "GENDER: " + result.gender.toUpperCase());
            scrambleText("hud-age", "AGE ESTIMATE: " + Math.round(result.age) + " YRS");
            scrambleText("hud-expression", "EXPRESSION: " + expr.toUpperCase());
            scrambleText("hud-sync-level", "CORRELATION: 100%");
            addHudLog("ACCESS DENIED // CORRELATION FAILURE // ID MISMATCH");
            
            playWelcomeAudio("UNKNOWN", result.gender, resized.length);
          }
        } else {
          if (elapsed % 600 < 50) scanSound();
        }
      } else if (scanState === "verified" || scanState === "unknown") {
        if (progressEl) progressEl.style.width = '100%';
        if (resized.length > 1) {
          playWelcomeAudio(label, result.gender, resized.length);
        }
      }

      targetLockedTime = Date.now();

      const confidence = `${Math.round(result.detection.score * 100)}%`;
      drawCyberBox(ctx, box, label, confidence, expr, result.age, result.gender, distanceText, canvas.width, canvas.height);
      drawLandmarks(ctx, result.landmarks, canvas.width);
    }
  } catch (e) {
    console.warn("Detection loop cycle exception:", e);
  }

  requestAnimationFrame(detectLoop);
}

const states = [
  "SCANNING FACIAL GEOMETRY...",
  "MAPPING EYE LANDMARKS...",
  "ANALYZING BEARD SIGNATURE...",
  "MATCHING NEURAL PATTERN...",
  "CONFIDENCE: 99.7%",
  "IDENTIFIED AS ABHIMANYU"
];

export async function initFaceScanner(onComplete) {
  completionCallback = onComplete;
  const scanCard = document.getElementById("scanCard");
  const statusText = document.getElementById("scanStatus");
  if (!scanCard || !statusText) return;

  try {
    createAudio();
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }

    scanCard.classList.add("active");

    await loadModels();
    await startWebcam();
    
    statusText.textContent = `SEARCHING FOR SUBJECT...`;
    detectLoop();
  } catch (err) {
    console.warn("System load failed, falling back to mock scanner:", err);
    scanCard.classList.add("active");

    const progressEl = document.querySelector('.pilot-sync-progress');
    if (progressEl) {
      progressEl.style.animation = '';
      progressEl.style.width = '';
    }

    bootSound();
    startStatusCycle();
    
    const canvas = document.getElementById("scanCanvas");
    if (canvas) canvas.style.display = 'block';

    let simLoop = () => {
      drawSimulatedScan();
      requestAnimationFrame(simLoop);
    };
    simLoop();

    setTimeout(() => {
      startScanLoop();
    }, 500);
  }
}
