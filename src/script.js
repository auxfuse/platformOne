import './style.css';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import galaxyVertexShader from './shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl';
import GUI from 'lil-gui';

const style = "background-color: #150c21; color: #705df2; font-style: italic; border: 3px solid #78cbf5; font-size: 1.6em; padding: 0.5em;";
const terminalStyle = "background-color: #262b27; color: #74ad72; border: 2px solid #0b0d0b; font-size: 1.2em; padding: 0.2em;";
console.log("%cAll ThreeJS elements inspired & learned from Bruno Simon's ThreeJS Journey Course🔗👉 https://threejs-journey.com/", style);

const transcript = `
    >> HackCorp DevGames Division
    >> Transmission Relay
    >> Partial Decryption
    -----------------------------
    Pilot:          Only we've been drifting a while now...
    Co-Pilot:       No...have we? It's **** ** **** game now.
    Pilot:          Ever notice anything during *** **** **?
            -- break -- static -- break --
    Pilot:          Look *** **** got a feeling about this mission.
    Co-Pilot:       Even still, in 0.02 Parsecs we will know.
    Pilot:          Vouching for them even *** **** ** *****.
    Co-Pilot:       Everything rides on **** **** well.
    Pilot:          Lab-techs will know...wait...what was ***
            -- break -- static -- break --
            -- Lost source transmission --
    -----------------------------
    >> End Decryption
`;
console.log(`%c${transcript}`, terminalStyle);

const canvas = document.querySelector('canvas.webgl');
const countdownContainer = document.querySelector('#countdown');
const timerEl = document.getElementById('timer');
const playButton = document.querySelector("#play");
const playGui = document.querySelector("#play-gui");

const gui = new GUI();
gui.close();
gui.title('Try Me!');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const scene = new THREE.Scene();

// Models
let model = null;
let modelTv = null;
let modelStar = null;
let text = null;

const gltfLoader = new GLTFLoader();

gltfLoader.load( '/models/rocket/rocket.gltf',
    (gltf) => {
        model = gltf.scene.children[0];
        model.scale.set(0.1, 0.125, 0.1);
        model.position.set(1, 2, 0);
        scene.add(model);
    }
);

gltfLoader.load( '/models/oldtv/oldTv.gltf',
    (gltf) => {
        modelTv = gltf.scene.children[0];
        modelTv.scale.set(0.2, 0.2, 0.2);
        modelTv.position.set(-4.5, 0.95, -4.5);
        modelTv.rotateY(90);
        scene.add(modelTv);
    }
);

// extra models
gltfLoader.load('/models/extras/star.gltf',
    (gltf) => {
        modelStar = gltf.scene.children[0];
        modelStar.scale.set(0.03, 0.03, 0.03);
        modelStar.position.set(-4.5, 1.0, -4.5);
        scene.add(modelStar);
    }
);

// text

const fontLoader = new FontLoader();
const textContent = '> console...';

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        console.log('font load');
        const textGeometry = new TextGeometry(
            textContent, {
                font: font,
                size: 0.025,
                height: 0.025,
                width: 0.1,
                curveSegments: 8
            }
        );
        textGeometry.center();
        const textMaterial = new THREE.MeshBasicMaterial({
            color: 0x705df2,
        });
        text = new THREE.Mesh(textGeometry, textMaterial);
        text.scale.set(0.5, 0.5, 0.25);
        text.position.set(2, 1, 2);
        text.rotateX(-45);
        scene.add(text);
    }
);

const light = new THREE.AmbientLight(0x78cbf5, 2.5);
const spotLight = new THREE.SpotLight(0x78cbf5, 10, 5, Math.PI * 0.6, 0.25, 1);
spotLight.position.set(-8, 1.5, -3);

// const spotHelper = new THREE.SpotLightHelper( spotLight );
scene.add(light, spotLight);

spotLight.target.position.x = -5;
spotLight.rotateY(45);
scene.add(spotLight.target);

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
    points.position.y = 1;
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

camera.position.z = 3;
camera.position.x = 0;
camera.position.y = 2;
scene.add(camera);

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
    playGui.style.opacity = 1;
});

lookControls.addEventListener('unlock', () => {
    playButton.style.display = '';
    countdownContainer.style.display = '';
    playGui.style.opacity = 0;
});

const clock = new THREE.Clock();

const tick = () => {
    const elaspedTime = clock.getElapsedTime();

    flyControls.update(0.001);

    points.rotation.y += 0.0007;

    if (model) {
        model.rotation.y -= 0.007;
    };

    if (modelTv) {
        modelTv.rotation.y -= 0.002;
    };

    if (text) {
        text.rotation.x -= 0.01;
    };

    if (modelStar) {
        modelStar.rotation.z -= 0.0025;
    };

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
