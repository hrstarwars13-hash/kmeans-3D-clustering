// K-Means 3D Clustering Demo (Frontend Only)
// Uses three.js for 3D visualization

let scene, camera, renderer;
let points = [];
let centroids = [];
let assignments = [];
let k = 3;
const N_POINTS = 100;
const COLORS = [0xff3333, 0x33ff33, 0x3333ff, 0xffe933, 0x33fff6, 0xff33e9];

function randomPoint() {
  return [
    Math.random() * 40 - 20,
    Math.random() * 40 - 20,
    Math.random() * 40 - 20
  ];
}

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 80);
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
  document.getElementById('container').appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / (window.innerHeight * 0.9);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
}

function createPoints() {
  points = [];
  for (let i = 0; i < N_POINTS; i++) {
    points.push(randomPoint());
  }
}

function createCentroids() {
  centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push(randomPoint());
  }
}

function assignPoints() {
  assignments = points.map(p => {
    let minDist = Infinity, idx = 0;
    centroids.forEach((c, i) => {
      const d = dist3(p, c);
      if (d < minDist) { minDist = d; idx = i; }
    });
    return idx;
  });
}

function moveCentroids() {
  let sums = Array(k).fill().map(() => [0,0,0]);
  let counts = Array(k).fill(0);
  points.forEach((p, i) => {
    const c = assignments[i];
    sums[c][0] += p[0];
    sums[c][1] += p[1];
    sums[c][2] += p[2];
    counts[c]++;
  });
  for (let i = 0; i < k; i++) {
    if (counts[i] > 0) {
      centroids[i] = [sums[i][0]/counts[i], sums[i][1]/counts[i], sums[i][2]/counts[i]];
    }
  }
}

function dist3(a, b) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

function clearScene() {
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0]); 
  }
}

function draw() {
  clearScene();
  // Draw points
  points.forEach((p, i) => {
    const color = assignments.length ? COLORS[assignments[i]] : 0xffffff;
    const geometry = new THREE.SphereGeometry(0.7, 8, 8);
    const material = new THREE.MeshBasicMaterial({color});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(...p);
    scene.add(sphere);
  });
  // Draw centroids
  centroids.forEach((c, i) => {
    const geometry = new THREE.SphereGeometry(2, 16, 16);
    const material = new THREE.MeshBasicMaterial({color: COLORS[i], wireframe: true});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(...c);
    scene.add(sphere);
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function resetAll() {
  assignments = [];
  centroids = [];
  createPoints();
  draw();
}

// UI Event Listeners
window.onload = () => {
  initScene();
  createPoints();
  draw();
  animate();

  document.getElementById('k-slider').addEventListener('input', e => {
    k = parseInt(e.target.value);
    document.getElementById('k-value').textContent = k;
  });
  document.getElementById('init-centroids').onclick = () => {
    createCentroids();
    assignments = [];
    draw();
  };
  document.getElementById('assign-points').onclick = () => {
    if (!centroids.length) return;
    assignPoints();
    draw();
  };
  document.getElementById('move-centroids').onclick = () => {
    if (!assignments.length) return;
    moveCentroids();
    draw();
  };
  document.getElementById('reset').onclick = () => {
    resetAll();
  };
};
