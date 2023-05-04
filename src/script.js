import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import galaxyVertexShader from './shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl';
import GUI from 'lil-gui';

const style = "background-color: #150c21; color: #705df2; font-style: italic; border: 3px solid #78cbf5; font-size: 1.6em; padding: 0.5em;";
console.log("%cAll ThreeJS elements inspired & learned from Bruno Simon's ThreeJS Journey Course🔗👉 https://threejs-journey.com/", style);

const canvas = document.querySelector('canvas.webgl');
const countdownContainer = document.querySelector('#countdown');
const timerEl = document.getElementById('timer');
const playButton = document.querySelector("#play");

const gui = new GUI();
gui.close();
gui.title('Try Me!');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const scene = new THREE.Scene();

// bg galaxy
const params = {
    count: 12000,
    uSize: 0.001,
    radius: 12,
    branches: 5,
    spin: -1,
    randomness: 0.3,
    randomnessPower: 2
};

const colorsM = {
    insideColor: '#2adfe9',
    outsideColor: '#e704d4'
}

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
    const colors = new Float32Array(params.count * 3);
    const scales = new Float32Array(params.count * 1);

    const colorInside = new THREE.Color(colorsM.insideColor);
    const colorOutside = new THREE.Color(colorsM.outsideColor);

    for(let i=0; i < params.count; i++) {

        const i3 = i * 3;

        const radius = Math.random() * params.radius;
        const spinAngle = radius * params.spin;
        const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
        const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
        const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = 0 + randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / params.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        scales[i] = Math.random();
    };

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    );

    geometry.setAttribute(
        'aScale',
        new THREE.BufferAttribute(scales, 1)
    )

    material = new THREE.ShaderMaterial({
        depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        uniforms: {
            uSize: { value: 20 * renderer.getPixelRatio() }
        }
    });

    points = new THREE.Points(geometry, material);
    points.position.x = -4.5;
    points.position.z = -4.5;
    scene.add(points);
};

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

gui.add(params, 'count').min(100).max(25000).step(100).onFinishChange(genGalaxy);
gui.add(params, 'radius').min(0.01).max(20).step(0.01).onFinishChange(genGalaxy);
gui.add(params, 'branches').min(2).max(20).step(1).onFinishChange(genGalaxy);
gui.add(params, 'spin').min(-5).max(5).step(0.001).onFinishChange(genGalaxy);
gui.add(params, 'randomness').min(0.01).max(2).step(0.01).onFinishChange(genGalaxy);
gui.add(params, 'randomnessPower').min(1).max(10).step(0.1).onFinishChange(genGalaxy);
gui.addColor(colorsM, 'insideColor').onFinishChange(genGalaxy);
gui.addColor(colorsM, 'outsideColor').onFinishChange(genGalaxy);

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

const camera = new THREE.PerspectiveCamera(
    45, sizes.width / sizes.height, 0.1, 500
);

camera.position.z = 2;
camera.position.x = 2;
camera.position.y = 2;
scene.add(camera);

// const controls = new OrbitControls(camera, canvas);
// controls.autoRotate = true;
// controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});

renderer.setSize(
    sizes.width, sizes.height
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

genGalaxy();

const flyControls = new FlyControls(camera, renderer.domElement);
flyControls.movementSpeed = 15;
flyControls.rollSpeed = Math.PI / 24;
flyControls.autoForward = false;
flyControls.dragToLook = true;

const lookControls = new PointerLockControls(camera, renderer.domElement);
lookControls.pointerSpeed = 0.075;

playButton.addEventListener('click', () => {
    lookControls.lock();
});

lookControls.addEventListener('lock', () => {
    playButton.style.display = 'none';
    countdownContainer.style.display = 'none';
});

lookControls.addEventListener('unlock', () => {
    playButton.style.display = '';
    countdownContainer.style.display = '';
    playButton.style.display = '';
});

const clock = new THREE.Clock();

const tick = () => {
    const elaspedTime = clock.getElapsedTime();
    
    if (lookControls.isLocked === true) {
        flyControls.update(0.0007);
    }

    points.rotation.y += 0.0007;

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
}

tick();

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
