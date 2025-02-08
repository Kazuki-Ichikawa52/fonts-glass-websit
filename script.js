import * as THREE from "./build/three.module.js";
import { OrbitControls } from "./controls/OrbitControls.js";

// **背景を白くする**
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// **カメラ**
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  150
);
camera.position.set(0, 0, 0);
scene.add(camera);

// **レンダラー（影を有効化）**
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; // **影を有効化**
document.body.appendChild(renderer.domElement);

// **カメラ操作**
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// **球体の設定**
const sphereCount = 500;
const spheres = [];
const velocities = [];
const followTargets = [];
const planes = [];
const planeTimers = [];

const planeCount = 100;
const planeLifetime = 0.2;

// **影を受ける「床」を追加（影を見えるようにする）**
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.3 }); // **影のみ表示するマテリアル**
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -5;
floor.receiveShadow = true; // **影を受ける**
scene.add(floor);

// **リーダー（群れの先頭）を作成**
const leader = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x000000 })
);
leader.position.set(0, 0, -20);
leader.castShadow = true; // **影を落とす**
scene.add(leader);

// **球体を生成**
for (let i = 0; i < sphereCount; i++) {
  const size = Math.random() * 0.3 + 0.1;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x252525 })
  );

  sphere.position.set(
    leader.position.x + (Math.random() - 0.5) * 5,
    leader.position.y + (Math.random() - 0.5) * 5,
    leader.position.z + (Math.random() - 0.5) * 5
  );

  sphere.castShadow = true; // **影を落とす**
  spheres.push(sphere);
  scene.add(sphere);

  followTargets.push(i < 5 ? leader : spheres[i - 5]);
  velocities.push(
    new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      0.05
    )
  );
}

// **四角形をランダムに作成（最初は透明）**
for (let i = 0; i < planeCount; i++) {
  const planeSize = Math.random() * 1.5 + 0.5; // **サイズを小さめに**
  const planeGeometry = new THREE.PlaneGeometry(1, 1);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0,
    wireframe: true, // **枠線のみ**
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.scale.set(planeSize, planeSize, 1);

  const randomSphere = spheres[Math.floor(Math.random() * spheres.length)];
  plane.position.copy(randomSphere.position);
  scene.add(plane);

  planes.push(plane);
  planeTimers.push(Math.random() * 3);
}

// **照明（影をつける）**
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 10);
directionalLight.castShadow = true; // **影を作る**
scene.add(directionalLight);

// **影の解像度を向上**
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;

// **アニメーションループ**
let elapsedTime = 0;

function animate() {
  requestAnimationFrame(animate);
  elapsedTime += 0.004;

  // **リーダーの動きを高速化**
  leader.position.x = Math.sin(elapsedTime * 1.2) * 6;
  leader.position.y = Math.cos(elapsedTime * 0.8) * 4;
  leader.position.z += 0.05;

  spheres.forEach((sphere, index) => {
    const target = followTargets[index];

    const direction = new THREE.Vector3()
      .subVectors(target.position, sphere.position)
      .normalize()
      .multiplyScalar(0.04);
    const waveFactor = Math.sin(elapsedTime * 2 + index * 0.1) * 0.03;
    direction.x += waveFactor;
    direction.y += Math.cos(elapsedTime * 1.5 + index * 0.1) * 0.03;

    sphere.position.add(direction);
    sphere.position.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      waveFactor * 0.05
    );
  });

  // **四角のチカチカ（透明度の変化）**
  planes.forEach((plane, index) => {
    planeTimers[index] -= 0.02;

    if (planeTimers[index] <= 0) {
      plane.material.opacity = 1;
      planeTimers[index] = planeLifetime + Math.random() * 3;

      const randomSphere = spheres[Math.floor(Math.random() * spheres.length)];
      plane.position.copy(randomSphere.position);
      plane.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      // **新しいランダムサイズ**
      const newSize = Math.random() * 1.5 + 0.5;
      plane.scale.set(newSize, newSize, 1);
    } else if (planeTimers[index] <= planeLifetime) {
      plane.material.opacity = planeTimers[index] / planeLifetime;
    } else {
      plane.material.opacity = 0;
    }

    // **四角をカメラの方向に向ける**
    plane.lookAt(camera.position);
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// **ウィンドウリサイズ対応**
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
