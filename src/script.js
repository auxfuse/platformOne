import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import galaxyVertexShader from './shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl';
import GUI from 'lil-gui';

const gui = new GUI();
gui.close();
gui.title('Try Me!');

const canvas = document.querySelector('canvas.webgl');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const scene = new THREE.Scene();

// bg galaxy
const params = {
    count: 50000,
    size: 0.001,
    radius: 10,
    branches: 6,
    spin: -1,
    randomness: 0.2,
    randomnessPower: 1.5
};

const colorsM = {
    insideColor: '#00bb00',
    outsideColor: '#c1c360'
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
    const randomness = new Float32Array(params.count * 3);

    const colorInside = new THREE.Color(colorsM.insideColor);
    const colorOutside = new THREE.Color(colorsM.outsideColor);

    for(let i=0; i < params.count; i++) {

        const i3 = i * 3;

        const radius = Math.random() * params.radius;
        const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
        const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
        const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

        positions[i3] = Math.cos(branchAngle) * radius;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = Math.sin(branchAngle) * radius;

        randomness[i3] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

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

    geometry.setAttribute(
        'aRandomness',
        new THREE.BufferAttribute(randomness, 1)
    )

    material = new THREE.ShaderMaterial({
        depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 30 * renderer.getPixelRatio() }
        }
    });

    points = new THREE.Points(geometry, material);
    points.position.x = -4.5;
    points.position.z = -4.5;
    scene.add(points);
};

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(genGalaxy);
gui.add(params, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(genGalaxy);
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
// camera.lookAt(cube.position);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
// controls.autoRotate = true;
controls.enableDamping = true;

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

const clock = new THREE.Clock();

const tick = () => {
    const elaspedTime = clock.getElapsedTime();

    material.uniforms.uTime.value = elaspedTime;
    
    controls.update();

    points.rotation.y += 0.001;

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
