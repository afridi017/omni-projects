const roles = [
  "Cybersecurity Enthusiast",
  "Python Tool Developer",
  "Web Developer",
  "3D Creative Coder",
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;
const typingEl = document.getElementById("typing");

function typeLoop() {
  const current = roles[roleIndex];

  if (!typingEl) return;

  if (!deleting) {
    typingEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1300);
      return;
    }
  } else {
    typingEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeLoop, deleting ? 45 : 90);
}

typeLoop();

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.15 },
);

reveals.forEach((el) => observer.observe(el));

const filterButtons = document.querySelectorAll(".filter-btn");
const projects = document.querySelectorAll(".project");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    projects.forEach((card) => {
      const category = card.dataset.category;
      card.style.display =
        filter === "all" || category === filter ? "block" : "none";
    });
  });
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  68,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 11;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("bg"),
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const particlesGeometry = new THREE.BufferGeometry();
const count = 1500;
const posArray = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 55;
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(posArray, 3),
);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.045,
  color: 0x67f3b0,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

const sphereGeo = new THREE.IcosahedronGeometry(2.35, 2);
const sphereMat = new THREE.MeshBasicMaterial({
  color: 0xd8ff47,
  wireframe: true,
  transparent: true,
  opacity: 0.4,
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(4.8, 1.2, -2);
scene.add(sphere);

const core = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 24, 24),
  new THREE.MeshBasicMaterial({
    color: 0xd8ff47,
    transparent: true,
    opacity: 0.16,
  }),
);
core.position.copy(sphere.position);
scene.add(core);

const rings = [
  { radius: 3.1, rotation: [0.8, 0.2, 0.1] },
  { radius: 2.7, rotation: [1.3, 0.8, 0.6] },
  { radius: 2.4, rotation: [0.2, 1.1, 1.2] },
].map(({ radius, rotation }) => {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.012, 8, 96),
    new THREE.MeshBasicMaterial({
      color: 0x67f3b0,
      transparent: true,
      opacity: 0.42,
    }),
  );
  ring.position.copy(sphere.position);
  ring.rotation.set(...rotation);
  scene.add(ring);
  return ring;
});

const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
  requestAnimationFrame(animate);

  particlesMesh.rotation.y += 0.0009;
  particlesMesh.rotation.x += 0.00025;

  sphere.rotation.x += 0.0035;
  sphere.rotation.y += 0.0045;
  core.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.12);
  rings.forEach((ring, index) => {
    ring.rotation.x += 0.0012 + index * 0.0004;
    ring.rotation.z -= 0.001 + index * 0.0003;
  });

  camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.02;
  camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.02;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
