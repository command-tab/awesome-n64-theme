import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const header = document.getElementsByClassName('page-header')[0];
const canvas = document.getElementById('logo');

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(15, window.innerWidth/header.offsetHeight, 0.1, 1000);
camera.position.z = 45;
camera.position.y = 0;

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true
});

renderer.shadowMapType = THREE.PCFSoftShadowMap;
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;

canvas.width  = canvas.clientWidth;
canvas.height = canvas.clientHeight;
renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);

const ratio = window.devicePixelRatio || 1;
renderer.setPixelRatio(ratio);

// load glb
let model;
let mixer;
const loader = new GLTFLoader();
loader.load(
  'logo.glb',
  function (gltf) {
    model = gltf.scene;
    scene.add(gltf.scene);

    console.log('animations', gltf.animations); // Array<AnimationClip>
    console.log('scene', gltf.scene); // Scene
    console.log('scenes', gltf.scenes); // Array<Scene>
    console.log('cameras', gltf.cameras); // Array<Camera>
    console.log('asset', gltf.asset); // Object

    // position model
    model.position.x = -1;
    model.rotation.x = -.5;
    
    gltf.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    var geo = new THREE.PlaneGeometry(2000, 2000);
    var mat = new THREE.ShadowMaterial({ opacity: 0.1 });
    var floor = new THREE.Mesh(geo, mat);
    floor.position.z = -10;
    floor.rotation.x = -.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // scale model based on browser viewport
    onWindowResize();
    
    mixer = new THREE.AnimationMixer(model);
    const clip = gltf.animations[0];
    const action = mixer.clipAction(clip);
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce);
    action.play();
  },
  function (error) {
    console.error('An error occurred', error);
  }
);

// Add ambient lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

// Light across front of logo
const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
frontLight.position.set(0.1, 10, 10);
frontLight.target.position.set(0.1, 0.1, 0.1);
frontLight.castShadow = true;
frontLight.shadowMapWidth = 2048;
frontLight.shadowMapHeight = 2048;
frontLight.shadow.radius = 4;
frontLight.shadow.camera.left = -100;
frontLight.shadow.camera.right = 100;
frontLight.shadow.camera.top = 10;
frontLight.shadow.camera.bottom = -10;
frontLight.shadow.camera.near = 1;
frontLight.shadow.camera.far =500;
frontLight.shadowCameraVisible = true;
scene.add(frontLight);
scene.add(frontLight.target);

// Add shine to N64
const n64TextLight = new THREE.PointLight(0xffffff, 1);
n64TextLight.position.set(5.5, 3, -1);
scene.add(n64TextLight);

// Add shine to top bevels
const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
topLight.position.set(0.1, 10, 0);
topLight.target.position.set(0.1, 0.1, 0.1);
scene.add(topLight);
scene.add(topLight.target);

// Add shine to top bevels
const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
backLight.position.set(0.1, -10, 1);
backLight.target.position.set(0.1, 0.1, 0.1);
scene.add(backLight);
scene.add(backLight.target);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  if (model) {
    mixer.update(clock.getDelta());
    if (clock.getElapsedTime() > 0.5) {
      model.rotation.y = Math.sin(clock.getElapsedTime()) * .1;
      model.rotation.z = Math.sin(clock.getElapsedTime()) * .1;
      model.position.z = Math.sin(clock.getElapsedTime()) * .5;
      model.position.y = Math.sin(clock.getElapsedTime()) * .5;
    }
    renderer.render(scene, camera);
  }
}
animate();

// Scale the model smaller at defined intervals
const MEDIA_QUERIES = [
  { query: 'screen and (min-width: 1280px)', scale: .83 },
  { query: 'screen and (min-width: 800px) and (max-width: 1200px)', scale: .75 },
  { query: 'screen and (min-width: 640px) and (max-width: 800px)', scale: .67 },
  { query: 'screen and (max-width: 640px)', scale: .65 }
];
function onWindowResize() {
  camera.aspect = (window.innerWidth) / header.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize((window.innerWidth), header.offsetHeight);

  MEDIA_QUERIES.forEach(mq => {
    if (window.matchMedia(mq.query).matches) {
      if (model) {
        model.scale.x = mq.scale;
        model.scale.y = mq.scale;
        model.scale.x = mq.scale;
      }
      const SCROLLBAR_OFFSET = 20;
      renderer.setSize(window.innerWidth - SCROLLBAR_OFFSET, header.offsetHeight);  // Resizes the underlying canvas
      camera.aspect = (window.innerWidth - SCROLLBAR_OFFSET) / header.offsetHeight;
      camera.updateProjectionMatrix();
    }
  });
}
window.addEventListener('resize', onWindowResize, false);
onWindowResize();
