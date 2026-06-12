import { scene, camera, renderer, createScene } from './scene.js';
import { createLights } from './lights.js';
import { normalize } from './utils/math.js';
import { Sea } from './objects/Sea.js';
import { Mountains } from './objects/Mountains.js';
import { Sky } from './objects/Sky.js';
import { AirPlane } from './objects/Airplane.js';

let sea, mountains, sky, airplane;
let mousePos = { x: 0, y: 0 };

function createSea() {
	sea = new Sea();
	sea.mesh.position.y = -3000;
	scene.add(sea.mesh);
}

function createMountains() {
	mountains = new Mountains();
	mountains.mesh.position.y = -3000;
	scene.add(mountains.mesh);
}

function createSky() {
	sky = new Sky();
	sky.mesh.position.y = -3000;
	scene.add(sky.mesh);
}

function createPlane() {
	airplane = new AirPlane();
	airplane.mesh.scale.set(.25, .25, .25);
	airplane.mesh.position.y = 100;
	scene.add(airplane.mesh);
}

function updatePlane() {
	const targetY = normalize(mousePos.y, -.75, .75, 25, 175);
	const targetX = normalize(mousePos.x, -.75, .75, -100, 100);

	// Move the plane in Y and X
	airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;
	airplane.mesh.position.x += (targetX - airplane.mesh.position.x) * 0.1;

	// Efecto de giro más "plano" (suave)
	airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.005; 
	airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * 0.002;
	airplane.mesh.rotation.y = (targetX - airplane.mesh.position.x) * -0.005;

	airplane.propeller.rotation.x += 0.3;
}

function handleMouseMove(event) {
	const tx = -1 + (event.clientX / window.innerWidth) * 2;
	const ty = 1 - (event.clientY / window.innerHeight) * 2;
	mousePos = { x: tx, y: ty };
}

function loop() {
	airplane.propeller.rotation.x += 0.3;

	// Rotar el "treadmill" gigante
	sea.mesh.rotation.z += .002;
	mountains.mesh.rotation.z += .002;
	sky.mesh.rotation.z += .004;

	airplane.pilot.updateHairs();
	sea.moveWaves(); 
	updatePlane();

	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function init() {
	createScene();
	createLights(scene);

	createPlane();
	createSea();
	createMountains();
	createSky();

	document.addEventListener('mousemove', handleMouseMove, false);
	loop();
}

window.addEventListener('load', init, false);
