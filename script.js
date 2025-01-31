import * as THREE from "./build/three.module.js";
import { OrbitControls } from "./controls/OrbitControls.js";
import { FontLoader } from "./loaders/FontLoader.js";
import { TextGeometry } from "./geometries/TextGeometry.js";

// Scene
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 5);

// 光源
const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 白いラインの作成関数
function addWhiteLine(yPosition) {
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  
  // 頂点の設定（水平線）
  const points = [];
  points.push(new THREE.Vector3(-10, yPosition, 0)); // 始点
  points.push(new THREE.Vector3(10, yPosition, 0));  // 終点
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);
}

// 複数の線を追加
addWhiteLine(-2); // 高さ -2 の線
addWhiteLine(-1); // 高さ -1 の線
addWhiteLine(0);  // 高さ 0 の線
addWhiteLine(1);  // 高さ 1 の線
addWhiteLine(2);  // 高さ 2 の線

// Fonts
const fontLoader = new FontLoader();
fontLoader.load("./fonts/helvetiker_regular.typeface.json", (font) => {
  // ガラスの「S」
  const textGeometry = new TextGeometry("S", {
    font: font,
    size: 3.0,
    height: 1.0,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 4,
  });

  const textMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.95,
    roughness: 0.05,
    metalness: 0.0,
    ior: 1.5,
    thickness: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
  });

  const text = new THREE.Mesh(textGeometry, textMaterial);
  textGeometry.center();
  scene.add(text);
});

// アニメーションループ
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  // Controls の更新
  controls.update();

  // レンダリング
  renderer.render(scene, camera);
}

animate();

// ウィンドウリサイズへの対応
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
