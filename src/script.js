import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

const gui = new GUI();

const canvas = document.querySelector('canvas.webgl');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const scene = new THREE.Scene();

// bg galaxy
const params = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3
};

let geometry = null;
let material = null;
let points = null;

const genGalaxy = () => {

    if(points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(params.count * 3);

    for(let i=0; i < params.count; i++) {

        const i3 = i * 3;

        const radius = Math.random() * params.radius;
        const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;

        positions[i3] = Math.cos(branchAngle);
        positions[i3 + 1] = Math.sin(branchAngle);
        positions[i3 + 2] = Math.sin(branchAngle);
    };

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    material = new THREE.PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

genGalaxy();

gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(genGalaxy);
gui.add(params, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(genGalaxy);
gui.add(params, 'radius').min(0.01).max(20).step(0.01).onFinishChange(genGalaxy);
gui.add(params, 'branches').min(2).max(20).step(1).onFinishChange(genGalaxy);

const camera = new THREE.PerspectiveCamera(
    85,
    sizes.width / sizes.height,
    0.1,
    200
);

camera.position.z = 2;
camera.position.x = 2;
camera.position.y = 2;
// camera.lookAt(cube.position);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setSize(
    sizes.width, sizes.height
);

const clock = new THREE.Clock();

const tick = () => {
    const elaspedTime = clock.getElapsedTime();

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
}

tick();

const timerEl = document.getElementById('timer');

let timer = () => {
    let end = new Date("May 27, 2023 18:00:00 GMT");
    let endTime = (Date.parse(end)) / 1000;

    let now = new Date();
    let nowTime = (Date.parse(now)) / 1000;

    let timeLeft = endTime - nowTime;

    let days = Math.floor(
        timeLeft / 86400
    );
    let hours = Math.floor(
        (timeLeft - (days * 86400)) / 3600
    );
    let mins = Math.floor(
        (timeLeft - (days * 86400) - (hours * 3600)) / 60
    );
    let secs = Math.floor(
        (timeLeft - (days * 86400) - (hours * 3600) - (mins * 60))
    );

    if (hours < "10") {
        hours = "0" + hours;
    }
    if (mins < "10") {
        mins = "0" + mins;
    }
    if (secs < "10") {
        secs = "0" + secs;
    }

    timerEl.textContent = `${days} days / ${hours} hrs / ${mins} mins / ${secs} secs`;
};

setInterval(function() {
    timer();
}, 1000);
