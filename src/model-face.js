import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  FaceLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs";

const video = document.getElementById("video");
const statusEl = document.getElementById("status");
const pointsEl = document.getElementById("points");
const fpsEl = document.getElementById("fps");
const scanTextEl = document.getElementById("scanText");
const canvas = document.getElementById("three");

let faceLandmarker;
let lastVideoTime = -1;
let lastFpsTime = performance.now();
let frameCount = 0;

let avatarHeadMeshes = [];

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0, 8.5);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(0, 5, 5);
scene.add(dirLight);

const group = new THREE.Group();
group.scale.set(1.25, 1.25, 1.25);
scene.add(group);

const pointCount = 478;
const pointPositions = new Float32Array(pointCount * 3);

const pointGeometry = new THREE.BufferGeometry();
pointGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(pointPositions, 3)
);

const pointMaterial = new THREE.PointsMaterial({
  size: 0.035,
  color: 0xa6ff2f,
  transparent: true,
  opacity: 0.95
});

const points = new THREE.Points(pointGeometry, pointMaterial);
group.add(points);

const connections = [
  ...FaceLandmarker.FACE_LANDMARKS_TESSELATION,
  ...FaceLandmarker.FACE_LANDMARKS_FACE_OVAL
];

const linePositions = new Float32Array(connections.length * 2 * 3);

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(linePositions, 3)
);

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x9dff3a,
  transparent: true,
  opacity: 0.3
});

const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
group.add(lines);

function resizeRenderer() {
  const rect = canvas.getBoundingClientRect();

  if (!rect.width || !rect.height) return;

  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resizeRenderer);
resizeRenderer();

const headRotationDummy = new THREE.Object3D();

function loadAvatar() {
  const loader = new GLTFLoader();

  loader.load(
    "/shewolf.glb",
    (gltf) => {
      const avatar = gltf.scene;

      points.visible = false;
      lines.visible = false;

      avatarHeadMeshes = [];
      avatar.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;

          if (child.morphTargetDictionary && child.morphTargetInfluences) {
            avatarHeadMeshes.push(child);
            console.log("[GLTF] Morph mesh added:", child.name);
            console.log("[GLTF] Morph targets:", child.morphTargetDictionary);
          }
        }
      });

      // Auto-scale and center the avatar model
      const box = new THREE.Box3().setFromObject(avatar);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Center model relative to its group container
      avatar.position.x += (avatar.position.x - center.x);
      avatar.position.y += (avatar.position.y - center.y) - 0.5; // Offset down slightly
      avatar.position.z += (avatar.position.z - center.z);

      // Scale to fit target dimensions
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetScale = 3.0 / maxDim;
      avatar.scale.set(targetScale, targetScale, targetScale);

      group.add(avatar);

      statusEl.textContent = "Avatar loaded";
      scanTextEl.textContent = "Avatar loaded";

      console.log("[GLTF] Avatar loaded and auto-scaled", gltf);
    },
    (progress) => {
      if (progress.total > 0) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        statusEl.textContent = `Avatar ${percent}%`;
      }
    },
    (error) => {
      console.error("[GLTF] Failed:", error);
      statusEl.textContent = "Avatar failed";
      scanTextEl.textContent = "Wireframe mode";
      points.visible = true;
      lines.visible = true;
    }
  );
}

function mapLandmark(lm, videoAspect) {
  return {
    x: -(lm.x - 0.5) * 5.2 * videoAspect,
    y: -(lm.y - 0.5) * 5.2,
    z: -lm.z * 7
  };
}

function updateMesh(result) {
  const aspect = video.videoWidth / video.videoHeight || 1.33;
  const landmarks = result.faceLandmarks[0];

  if (landmarks) {
    for (let i = 0; i < Math.min(pointCount, landmarks.length); i++) {
      const p = mapLandmark(landmarks[i], aspect);

      pointPositions[i * 3] = p.x;
      pointPositions[i * 3 + 1] = p.y;
      pointPositions[i * 3 + 2] = p.z;
    }

    pointGeometry.attributes.position.needsUpdate = true;

    let offset = 0;

    for (const c of connections) {
      const a = mapLandmark(landmarks[c.start], aspect);
      const b = mapLandmark(landmarks[c.end], aspect);

      linePositions[offset++] = a.x;
      linePositions[offset++] = a.y;
      linePositions[offset++] = a.z;

      linePositions[offset++] = b.x;
      linePositions[offset++] = b.y;
      linePositions[offset++] = b.z;
    }

    lineGeometry.attributes.position.needsUpdate = true;
    pointsEl.textContent = landmarks.length;
  }

  if (avatarHeadMeshes.length > 0 && result.faceBlendshapes?.length > 0) {
    const blendshapes = result.faceBlendshapes[0].categories;

    for (const shape of blendshapes) {
      const blendshapeName = shape.categoryName;
      for (const mesh of avatarHeadMeshes) {
        const index = mesh.morphTargetDictionary[blendshapeName];
        if (index !== undefined) {
          mesh.morphTargetInfluences[index] = shape.score;
        }
      }
    }
  }

  if (result.facialTransformationMatrixes?.length > 0) {
    const matrix = new THREE.Matrix4().fromArray(
      result.facialTransformationMatrixes[0].data
    );

    matrix.decompose(
      headRotationDummy.position,
      headRotationDummy.quaternion,
      headRotationDummy.scale
    );

    group.quaternion.slerp(headRotationDummy.quaternion, 0.2);
  }

  statusEl.textContent = "Face locked";
  scanTextEl.textContent = avatarHeadMeshes.length > 0 ? "Avatar tracking" : "Face locked";
}

async function initCamera() {
  statusEl.textContent = "Starting camera...";

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user"
    },
    audio: false
  });

  video.srcObject = stream;

  await new Promise((resolve) => {
    video.onloadedmetadata = resolve;
  });

  await video.play();

  resizeRenderer();
}

async function initFaceLandmarker() {
  statusEl.textContent = "Loading face model...";

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true
  });
}

function updateFps() {
  frameCount++;

  const now = performance.now();

  if (now - lastFpsTime > 1000) {
    fpsEl.textContent = frameCount;
    frameCount = 0;
    lastFpsTime = now;
  }
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  renderer.render(scene, camera);
}

function detectLoop() {
  if (
    faceLandmarker &&
    video.readyState >= 2 &&
    video.currentTime !== lastVideoTime
  ) {
    const result = faceLandmarker.detectForVideo(video, performance.now());
    lastVideoTime = video.currentTime;

    if (result.faceLandmarks?.length) {
      updateMesh(result);
    } else {
      statusEl.textContent = "Searching...";
      scanTextEl.textContent = "Scanning...";
      pointsEl.textContent = "0";
    }

    updateFps();
  }

  requestAnimationFrame(detectLoop);
}

async function main() {
  try {
    renderLoop();
    loadAvatar();

    await initCamera();
    await initFaceLandmarker();

    statusEl.textContent = "Scanning...";
    scanTextEl.textContent = "Scanning...";

    detectLoop();
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Error";
    scanTextEl.textContent = "Camera/model error";
  }
}

main();