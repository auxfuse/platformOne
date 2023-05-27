import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { SlowMo } from 'gsap/all';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js';
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import galaxyVertexShader from './shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl';
import GUI from 'lil-gui';

const isMobile = /Android|iPhone/i.test(navigator.userAgent);
const loaderEl = document.querySelector('.loader');
const loaderText = document.querySelector('.loading');

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        gsap.to(
            loaderText, {
                opacity: 0,
                duration: 2,
                display: 'none',
                immediateRender: false
            }
        );
        gsap.to(
            loaderEl, {
                opacity: 0,
                duration: 1,
                display: 'none',
                immediateRender: false
            }
        );
    };
};

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
const resetButton = document.querySelector("#reset");

const gui = new GUI();
gui.close();
gui.title('🚀 Try Me! ☄️');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const scene = new THREE.Scene();

// Models
let model = null;
let modelTv = null;
let modelStar = null;
let threeLogo = null;
let text = null;

const gltfLoader = new GLTFLoader();

gltfLoader.load( '/models/rocket/rocket.gltf',
    (gltf) => {
        model = gltf.scene.children[0];
        model.scale.set(0.1, 0.125, 0.1);
        model.position.set(1, 2, 0);
        scene.add(model);

        let rocketTl = gsap.timeline({
            repeat: -1,
            yoyo: true
        });

        rocketTl.to(model.position, {
            y: 4,
            duration: 3,
            ease: "power1",
            delay: 4
        }).to(model.position, {
            y: 2,
            duration: 3,
            ease: "power1",
            delay: 4
        });
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

gltfLoader.load('/models/threejs/scene.gltf',
    (gltf) => {
        threeLogo = gltf.scene.children[0];
        threeLogo.scale.set(0.0075, 0.0075, 0.0075);
        threeLogo.position.set(-4.5, 1.0, 4.5);
        scene.add(threeLogo);

        let logoTl = gsap.timeline({
            repeat: -1,
            yoyo: true
        });

        logoTl.to(threeLogo.position, {
            x: -3, y: 3, z: -10, duration: 3, ease: "power4", delay: 3
        }).to(threeLogo.position, {
            x: -4.5, y: 1.0, z: 4.5, duration: 4, ease: SlowMo.ease.config(0.7, 0.7), delay: 2
        });
    }
);

// text

const fontLoader = new FontLoader();
const textContent = '> console...';

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
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
};

let geometry = null;
let material = null;
let points = null;
let effect = null;

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

const axesHelper = new THREE.AxesHelper( 0.5 );
scene.add( axesHelper );

let composer = null;
let sobelComposer = null;
let effectSobel = null;

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(sizes.width, sizes.height);

    effectSobel.uniforms[ 'resolution' ].value.x = sizes.width * window.devicePixelRatio;
    effectSobel.uniforms[ 'resolution' ].value.y = sizes.height * window.devicePixelRatio;
});

const camera = new THREE.PerspectiveCamera(
    45, sizes.width / sizes.height, 0.1, 500
);

camera.position.x = 0;
camera.position.y = 2;
camera.position.z = 3;
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

composer = new EffectComposer( renderer );
const renderPixelatedPass = new RenderPixelatedPass( 3, scene, camera );
composer.addPass( renderPixelatedPass );

sobelComposer = new EffectComposer( renderer );
const renderPass = new RenderPass(scene, camera);
sobelComposer.addPass( renderPass );

effect = new AnaglyphEffect( renderer );
effect.setSize( sizes.width, sizes.height );

effectSobel = new ShaderPass( SobelOperatorShader );
effectSobel.uniforms[ 'resolution' ].value.x = sizes.width * window.devicePixelRatio;
effectSobel.uniforms[ 'resolution' ].value.y = sizes.height * window.devicePixelRatio;
sobelComposer.addPass( effectSobel );

genGalaxy();

const flyControls = new FlyControls(camera, renderer.domElement);
flyControls.movementSpeed = 15;
flyControls.rollSpeed = Math.PI / 24;
flyControls.autoForward = false;
flyControls.dragToLook = true;

const lookControls = new PointerLockControls(camera, renderer.domElement);
lookControls.pointerSpeed = 0.075;

let timeline = gsap.timeline();
let pos1 = {x: 1, y: 2.5, duration: 1, ease: "power2"};
let pos2 = {x: -4.5, y: 1, z: -4, duration: 1, delay: 4};
let pos3 = {x: 2, y: 1, z: 3, duration: 1, ease: "power1.inOut", delay: 5};

playButton.addEventListener('click', () => {
    if (isMobile) {
        countdownContainer.style.display = 'none';
        resetButton.style.opacity = 1;
        timeline.to(camera.position, pos1);
        timeline.to(camera.position, pos2);
        timeline.to(camera.position, pos3);
    } else {
        lookControls.lock();
    }
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

resetButton.addEventListener('click', () => {
    timeline.clear();
    gsap.to(camera.position, {
        x: 0, y: 2, z: 3, duration: 1, ease: "power1"
    });
    countdownContainer.style.display = '';
    resetButton.style.opacity = 0;
});

let cam1View = {x: 1, y: 2.5, duration: 1, ease: "power2"};
let cam2View = {x: -4.5, y: 1, z: -4, duration: 1, ease: "power2"};
let cam3View = {x: 2, y: 1, z: 3, duration: 1, ease: "power2"};

let guiFunc = () => {
    if (isMobile) {
        playButton.style.display = 'none';
    }
    countdownContainer.style.display = 'none';
    resetButton.style.opacity = 1;
    gui.close();
}

const extraGui = {
    RGBShift: false,
    Pixelate: false,
    Sobel: false,
    cam1: function () {
        gsap.to(camera.position, cam1View);
        guiFunc();
    },
    cam2: function () {
        gsap.to(camera.position, cam2View);
        guiFunc();
    },
    cam3: function () {
        gsap.to(camera.position, cam3View);
        guiFunc();
    },
    Psst: function() { 
        window.alert('Team sizes can be 1, 2, or 3 people! 🤜');
    }
};

const galaxyFolder = gui.addFolder('Galaxy 🌌');
const galaxyPropsFolder = galaxyFolder.addFolder('>> Galaxy Properties 🔧');
galaxyPropsFolder.close();
galaxyPropsFolder.add(params, 'radius').min(0.01).max(20).step(0.01).onFinishChange(genGalaxy);
galaxyPropsFolder.add(params, 'branches').min(2).max(20).step(1).onFinishChange(genGalaxy);
galaxyPropsFolder.add(params, 'spin').min(-5).max(5).step(0.001).onFinishChange(genGalaxy);

const galaxyStarFolder = galaxyFolder.addFolder('>> Star Properties ⭐');
galaxyStarFolder.close();
galaxyStarFolder.add(params, 'count').min(100).max(25000).step(100).onFinishChange(genGalaxy);
galaxyStarFolder.add(params, 'randomness').min(0.01).max(2).step(0.01).onFinishChange(genGalaxy);
galaxyStarFolder.add(params, 'randomnessPower').min(1).max(10).step(0.1).onFinishChange(genGalaxy);

const galaxyColorFolder = galaxyFolder.addFolder('>> Galaxy Colors 🌈');
galaxyColorFolder.close();
galaxyColorFolder.addColor(colorsM, 'insideColor').onFinishChange(genGalaxy);
galaxyColorFolder.addColor(colorsM, 'outsideColor').onFinishChange(genGalaxy);

const renderEffectFolder = gui.addFolder('Camera Effects 🪄');
renderEffectFolder.close();
renderEffectFolder.add(extraGui, 'RGBShift');
renderEffectFolder.add(extraGui, 'Pixelate');
renderEffectFolder.add(extraGui, 'Sobel');

const cameraFolder = gui.addFolder('Camera Views 🪟');
cameraFolder.close();
cameraFolder.add(extraGui, 'cam1').name('Rocket View 🚀');
cameraFolder.add(extraGui, 'cam2').name('CRT View 📺');
cameraFolder.add(extraGui, 'cam3').name('Console View 💾');

const secretsFolder = gui.addFolder('Secrets 🙈');
secretsFolder.close();
secretsFolder.add(extraGui, 'Psst');

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

    if (threeLogo) {
        threeLogo.rotation.z += 0.005;
        threeLogo.rotation.y += 0.007;
    }
    
    if (extraGui.RGBShift === false || extraGui.Pixelate === false || extraGui.Sobel === false) {
        renderer.render(scene, camera);
    }

    if (extraGui.RGBShift === true) {
        effect.render(scene, camera);
    }

    if (extraGui.Pixelate === true) {
        composer.render(scene, camera);
    }
    
    if (extraGui.Sobel === true) {
        sobelComposer.render();
    }

    window.requestAnimationFrame(tick);
}

tick();
