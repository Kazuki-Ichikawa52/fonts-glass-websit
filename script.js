import * as THREE from "./build/three.module.js";
import { OrbitControls } from "./controls/OrbitControls.js";

// シーンの作成
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// カメラ
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 5);
scene.add(camera);

// 光源
const pointLight = new THREE.PointLight(0xffffff, 3);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// コントロール（マウス操作）
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ** 壁の作成 **
const wallGeometry = new THREE.PlaneGeometry(10, 6);
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  roughness: 0.8,
  metalness: 0.2,
});
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.rotation.y = Math.PI / 2;
wall.position.set(-5, 0, 0); // 左側に配置
scene.add(wall);

// ** スライム（より細かい分割を持つ立方体） **
const geometry = new THREE.BoxGeometry(2, 2, 2, 20, 20, 20); // 細分化を増やして細かい潰れ
const positionAttribute = geometry.attributes.position;
const originalPositions = positionAttribute.array.slice(); // 初期状態を保存

const material = new THREE.MeshStandardMaterial({
  color: 0xffff00, // スライムの色
  roughness: 0.8,
  metalness: 0.9,
  transparent: true,
  
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// ** 状態管理変数 **
let moveSpeed = 0.05; // ゆっくりした移動
let deformTime = 0; // 壁に衝突後の時間
let isColliding = false; // 衝突状態管理
let movingRight = false; // 右移動中フラグ

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);

  if (!isColliding && !movingRight) {
    // 壁に向かって移動
    if (mesh.position.x > wall.position.x + 1) {
      mesh.position.x -= moveSpeed;
    } else {
      isColliding = true;
    }
  }

  if (isColliding) {
    deformTime += 0.02; // 衝突時間をカウント
  }

  // ** スライムらしい柔らかい潰れ（X, Y, Z すべてに影響）**
  let collisionFactor = Math.max(0.75, 1.0 - Math.sin(deformTime * 2) * 0.25);

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = originalPositions[i * 3];
    const y = originalPositions[i * 3 + 1];
    const z = originalPositions[i * 3 + 2];

    // ** X軸の位置によってY方向の潰れを変化させる **
    let deformFactorY = (1.0 - collisionFactor) * Math.sin(Math.abs(x) * Math.PI * 2) * 1.2;

    // ** Z軸にも変形を加える（Yの位置によって変化）**
    let deformFactorZ = (1.0 - collisionFactor) * Math.sin(Math.abs(y) * Math.PI * 2) * 1.0;

    // ** 頂点ごとに異なる揺れを加える（より細かい変形）**
    const bounceEffect = Math.sin(deformTime * 2 + x * 1.5 + z * 1.2) * 0.08 * Math.exp(-deformTime * 0.8);
    
    positionAttribute.setXYZ(i, x * collisionFactor, y + deformFactorY + bounceEffect, z + deformFactorZ);
  }
  positionAttribute.needsUpdate = true;

  // ** スライムらしいバウンド（ゆっくり減衰する）**
  mesh.position.x += Math.sin(deformTime * 2) * 0.08 * Math.exp(-deformTime * 0.8);

  // ** 右移動を開始 & 徐々に形を元に戻す **
  if (deformTime > 6.3) {
    movingRight = true;
    isColliding = false;
  }

  if (movingRight) {
    mesh.position.x += moveSpeed;

    // ** 徐々に元の形に戻す（ゆっくり復元）**
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = originalPositions[i * 3];
      const y = originalPositions[i * 3 + 1];
      const z = originalPositions[i * 3 + 2];

      // ** ゆっくり復元（完全に戻るまでに時間をかける）**
      let restoreFactor = Math.min(deformTime / 5, 1.0) + Math.cos(deformTime * 2 + x * 1.2 + z * 1.0) * 0.03;
      positionAttribute.setXYZ(i, x * restoreFactor, y * restoreFactor, z * restoreFactor);
    }
    positionAttribute.needsUpdate = true;

    // ** 初期位置に戻ったらループ再開 **
    if (mesh.position.x > 5) {
      movingRight = false;
      deformTime = 0;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ウィンドウリサイズ対応
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
