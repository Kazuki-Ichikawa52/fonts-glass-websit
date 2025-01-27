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
const pointLight = new THREE.PointLight(0xffffff, 3);
pointLight.position.set(5, 0, 5);
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

// Global variables
let text, leftText, rightText;

// 白いラインの作成
function addWhiteLine(yPosition) {
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });

  // 頂点の設定（水平線）
  const points = [];
  points.push(new THREE.Vector3(-5, yPosition, -2.5)); // 始点
  points.push(new THREE.Vector3(5, yPosition, -2.5)); // 終点

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);
}

// ラインを追加（例: 水平ラインを中央に
addWhiteLine(4.5); // 高さ -2 の線
addWhiteLine(1.2); // 高さ -1 の線
addWhiteLine(-0.9); // 高さ 0 の線
addWhiteLine(-4.5); // 高さ 1 の線

// Fonts
const fontLoader = new FontLoader();
fontLoader.load("./fonts/helvetiker_regular.typeface.json", (font) => {
  // ガラスの「S」
  const textGeometry = new TextGeometry("S", {
    font: font,
    size: 4.0,
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
    roughness: 0.0,
    metalness: 0.0,
    ior: 1.33,
    thickness: 1.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
  });

  text = new THREE.Mesh(textGeometry, textMaterial);
  textGeometry.center();
  scene.add(text);

  // 背景文字2
  const backgroundTextGeometry = new TextGeometry("ANIMATED\nTEST SURFACE", {
    font: font,
    size: 0.5,
    height: 0.01,
    curveSegments: 5,
  });

  const backgroundTextMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
  });

  const backgroundText = new THREE.Mesh(
    backgroundTextGeometry,
    backgroundTextMaterial
  );
  backgroundTextGeometry.center();
  backgroundText.position.set(-2, -2, -2.5); // 指定位置に配置
  scene.add(backgroundText);

  // スマイリーフェイスの作成
  const addSmileyFace = (position) => {
    const faceGeometry = new THREE.CircleGeometry(0.5, 32);
    const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // 黄色
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.position.set(position.x, position.y, position.z);
    scene.add(faceMesh);

    // 左目
    const eyeGeometry = new THREE.CircleGeometry(0.1, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // 黒
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.2, 0.01);
    faceMesh.add(leftEye);

    // 右目
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.2, 0.01);
    faceMesh.add(rightEye);

    // 口
    const mouthGeometry = new THREE.RingGeometry(
      0.3,
      0.35,
      32,
      1,
      Math.PI,
      Math.PI
    );
    const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // 黒
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.rotation.x = Math.PI;
    mouth.position.set(0, -0.2, 0.02);
    faceMesh.add(mouth);
  };

  // スマイリーフェイスを指定位置に追加
  addSmileyFace({ x: -3.5, y: -3.8, z: -2.5 });

  // 背景文字（左から登場する）
  const leftTextGeometry = new TextGeometry("PANTER", {
    font: font,
    size: 1.2,
    height: 0.05,
    curveSegments: 5,
  });

  const leftTextMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  leftText = new THREE.Mesh(leftTextGeometry, leftTextMaterial);
  leftTextGeometry.center();
  leftText.position.set(-14, 3.5, -2.5); // 初期位置を画面の外に設定
  scene.add(leftText);

  // 背景文字（右から登場する）
  const rightTextGeometry = new TextGeometry("VISION", {
    font: font,
    size: 1.2,
    height: 0.05,
    curveSegments: 5,
  });

  const rightTextMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  rightText = new THREE.Mesh(rightTextGeometry, rightTextMaterial);
  rightTextGeometry.center();
  rightText.position.set(14, 2, -2.5); // 初期位置を画面の外に設定
  scene.add(rightText);
});

// アニメーションループ
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  // ガラスの「S」のアニメーション
  if (text) {
    text.rotation.z += 0.01;
    text.rotation.y += 0.02;
  }

  // 背景文字のアニメーション（減速効果付きスライドイン）
  if (leftText && rightText) {
    const leftTarget = 0; // 左文字の目標位置
    const rightTarget = -2; // 右文字の目標位置

    // 減速計算（徐々に目標位置に近づく）
    leftText.position.x += (leftTarget - leftText.position.x) * 0.1;
    rightText.position.x += (rightTarget - rightText.position.x) * 0.1;
  }
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
