import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Timer } from "three/examples/jsm/misc/Timer.js";
import { resizeRendererToDisplaySize } from "./utils/resize";
import GUI from "lil-gui";
import _fullscreen from "./utils/fullscreen";
import { RGBELoader } from "three/examples/jsm/Addons.js";

const gui = new GUI({
  title: "ThreeJS Starter Bun",
});

const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  console.log("started loading");
};
loadingManager.onLoad = () => {
  console.log("finished loading");
};
loadingManager.onProgress = () => {
  console.log("loading");
};
loadingManager.onError = () => {
  console.log("error loading");
};
const textureLoader = new THREE.TextureLoader(loadingManager);
const alphaTexutre = textureLoader.load("../static/textures/door/alpha.jpg");
const ambientOcclusion = textureLoader.load(
  "../static/textures/door/ambientOcclusion.jpg"
);
const colorTexture = textureLoader.load("../static/textures/door/color.jpg");
const heightTexture = textureLoader.load("../static/textures/door/height.jpg");
const metalnessTexture = textureLoader.load(
  "../static/textures/door/metalness.jpg"
);
const normalTexture = textureLoader.load("../static/textures/door/normal.jpg");
const roughnessTexture = textureLoader.load(
  "../static/textures/door/roughness.jpg"
);

const gradient3Texture = textureLoader.load(
  "../static/textures/gradients/3.jpg"
);
const gradient5Texture = textureLoader.load(
  "../static/textures/gradients/5.jpg"
);
const matcap1Texture = textureLoader.load("../static/textures/matcaps/1.png");

colorTexture.colorSpace = THREE.SRGBColorSpace;
matcap1Texture.colorSpace = THREE.SRGBColorSpace;
gradient3Texture.minFilter = THREE.NearestFilter;
gradient3Texture.magFilter = THREE.NearestFilter;
gradient3Texture.generateMipmaps = false;

const cameraFolder = gui.addFolder("camera");
const materialFolder = gui.addFolder("material");

function main() {
  const canvas = document.getElementById("c");
  if (!canvas) {
    alert("canvas not found");
    return;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
  camera.position.z = 2;
  cameraFolder
    .add(camera.position, "z")
    .min(-3)
    .max(3)
    .step(0.1)
    .name("camera position z");

  const scene = new THREE.Scene();

  const rgbeLoader = new RGBELoader(loadingManager);
  rgbeLoader.load("../static/textures/environmentMap/2k.hdr", (envmap) => {
    envmap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = envmap;
    scene.environment = envmap;
  });

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const color = 0xffffff;
  const intensity = 50;
  const light = new THREE.PointLight(color, intensity);
  light.position.set(-1, 5, 4);
  scene.add(light);

  // const material = new THREE.MeshStandardMaterial();
  // material.side = THREE.DoubleSide;
  // material.metalness = 1;
  // material.roughness = 1;
  // material.map = colorTexture;
  // material.aoMap = ambientOcclusion;
  // material.displacementMap = heightTexture;
  // // material.aoMapIntensity = 1;
  // materialFolder.add(material, "metalness").min(0).max(1).step(0.01);
  // // materialFolder.add(material, "roughness").min(0).max(1).step(0.01);
  // material.displacementScale = 0.1;
  // // material.metalnessMap = metalnessTexture;
  // material.normalMap = normalTexture;
  // material.transparent = true;
  // material.alphaMap = alphaTexutre;

  const material = new THREE.MeshPhysicalMaterial();
  material.side = THREE.DoubleSide;
  material.metalness = 1;
  material.roughness = 1;
  material.map = colorTexture;
  material.aoMap = ambientOcclusion;
  material.displacementMap = heightTexture;
  material.aoMapIntensity = 1;
  materialFolder.add(material, "metalness").min(0).max(1).step(0.01);
  materialFolder.add(material, "roughness").min(0).max(1).step(0.01);
  material.displacementScale = 0.1;
  material.metalnessMap = metalnessTexture;
  material.normalMap = normalTexture;
  material.transparent = true;
  material.alphaMap = alphaTexutre;
  // material.clearcoat = 1;
  // material.clearcoatRoughness = 0;
  // material.sheen = 1;
  // material.sheenRoughness = 0.25;
  // material.sheenColor.set(1, 1, 1);
  // material.iridescence = 1;
  // material.iridescenceIOR = 1;
  // material.iridescenceThicknessRange = [100, 800];
  material.transmission = 1;
  material.ior = 1.5;
  material.thickness = 0.5;

  materialFolder.add(material, "transmission").min(0).max(1);
  materialFolder.add(material, "ior").min(1).max(10);
  materialFolder.add(material, "thickness").min(0).max(1);

  // materialFolder.add(material, "iridescenceIOR").min(0).max(1);

  // material.gradientMap = gradient3Texture;

  // material.flatShading = true;
  // material.matcap = matcap1Texture;

  // Sphere
  const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const sphere = new THREE.Mesh(sphereGeometry, material);
  sphere.position.x = -2;
  scene.add(sphere);

  // Plane
  const planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100);
  const plane = new THREE.Mesh(planeGeometry, material);
  scene.add(plane);

  // Torus
  const torusGeometry = new THREE.TorusGeometry(0.3, 0.2, 16, 32);
  const torus = new THREE.Mesh(torusGeometry, material);
  torus.position.x = 2;
  scene.add(torus);

  const timer = new Timer();

  const tick = () => {
    const elapsedTime = timer.getElapsed();
    timer.update();
    sphere.rotation.x = elapsedTime;
    plane.rotation.x = elapsedTime;
    torus.rotation.x = elapsedTime;

    sphere.rotation.y = -elapsedTime;
    plane.rotation.y = -elapsedTime;
    torus.rotation.y = -elapsedTime;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    renderer.render(scene, camera);
    controls.update();

    requestAnimationFrame(tick);
  };

  tick();

  window.addEventListener("dblclick", () => {
    const fullScreenElement =
      document.fullscreenElement || document.webkitFullscreenElement;

    if (!fullScreenElement) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      } else if (canvas.webkitRequestFullscreen) {
        // Does not work on safari mobile
        canvas.webkitRequestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
  });
}

main();
