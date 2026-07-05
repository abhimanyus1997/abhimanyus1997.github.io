import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const statusEl = document.getElementById("status");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 5);

const canvas = document.getElementById("three");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
directionalLight.position.set(3, 5, 5);
scene.add(directionalLight);

const loader = new GLTFLoader();

loader.load(
  "/shewolf.glb",
  (gltf) => {
    const model = gltf.scene;
    
    // Auto-fit camera to model bounding box
    console.log("Model hierarchy traversal:");
    model.traverse(node => {
      if (node.isMesh) {
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        console.log("Mesh:", node.name, "visible:", node.visible, "box:", node.geometry.boundingBox);
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log("Calculated Box - Size:", size.x, size.y, size.z, "Center:", center.x, center.y, center.z);
    
    // Center the model geometry
    model.position.x = -center.x;
    model.position.y = -center.y;
    model.position.z = -center.z;
    
    scene.add(model);
    
    // Update camera and controls target
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5; // zoom out a bit for perspective
    
    console.log("Setting camera Z to:", cameraZ);
    camera.position.set(0, 0, cameraZ || 5);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    statusEl.textContent = "Model loaded";
    console.log("Model loaded successfully. Box size:", size, "Center:", center);
  },
  (progress) => {
    if (progress.total > 0) {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      statusEl.textContent = `Loading ${percent}%`;
    }
  },
  (error) => {
    statusEl.textContent = "Model failed";
    console.error("GLB load failed:", error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

function resizeRenderer() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resizeRenderer);
resizeRenderer();