import { scene, camera, renderer, createScene } from './scene.js';
import { createLights } from './lights.js';
import { normalize } from './utils/math.js';
import { Sea } from './objects/Sea.js';
import { Mountains } from './objects/Mountains.js';
import { Sky } from './objects/Sky.js';
import { AirPlane } from './objects/Airplane.js';
import { Lakes } from './objects/Lakes.js';
import { Forest } from './objects/Forest.js';
import { Eagle } from './objects/Eagle.js';
import { Grass } from './objects/Grass.js';
import { Rocks } from './objects/Rocks.js';
import { WeaponManager } from './objects/Weapons.js';
import { initAudio, playShootSound, playMachineGunSound } from './utils/audio.js';
import { HUD } from './ui/hud.js';

let sea, mountains, sky, airplane, lakes, forest, eagle, grass, rocks, weaponManager;
let mousePos = { x: 0, y: 0 };
let isShootingMG = false;
let mgTimer = 0;
let reloadTimer = 0;
let machineGunHeat = 0;
let isOverheated = false;

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

function createLakes() {
	lakes = new Lakes();
	lakes.mesh.position.y = -3000;
	scene.add(lakes.mesh);
}

function createForest() {
	forest = new Forest();
	forest.mesh.position.y = -3000;
	scene.add(forest.mesh);
}

function createGrass() {
	grass = new Grass();
	grass.mesh.position.y = -3000;
	scene.add(grass.mesh);
}

function createRocks() {
	rocks = new Rocks();
	rocks.mesh.position.y = -3000;
	scene.add(rocks.mesh);
}

function createEagle() {
	eagle = new Eagle();
	eagle.mesh.scale.set(0.3, 0.3, 0.3);
	eagle.mesh.position.set(100, 150, -300);
	scene.add(eagle.mesh);
}

function updateEagle() {
	eagle.flapWings();
	
	// Fly towards the camera
	eagle.mesh.position.x -= 0.5; // fly left slightly
	eagle.mesh.position.z += 2;   // fly towards camera
	
	// If the eagle flies past the camera, reset it far away
	if (eagle.mesh.position.z > 200) {
		eagle.mesh.position.y = 50 + Math.random() * 150;
		eagle.mesh.position.x = -200 + Math.random() * 400;
		eagle.mesh.position.z = -800 - Math.random() * 400;
	}
}

function updatePlane() {
	// Aumentamos considerablemente los límites para que el avión se mueva por toda la pantalla
	const targetY = normalize(mousePos.y, -.75, .75, 25, 220);
	const targetX = normalize(mousePos.x, -.75, .75, -200, 200);

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

function handleMouseDown(event) {
	event.preventDefault();
	initAudio();
	
	if (event.button === 0) { // Left click
		if (!isOverheated) {
			isShootingMG = true;
		}
	} else if (event.button === 2) { // Right click
		if (airplane.fireMissile()) {
			playShootSound();
			HUD.updateAmmo(airplane.ammo);
			
			const p = airplane.mesh.position;
			// El misil sale de más abajo (alas)
			weaponManager.fireMissile(p.x + 40, p.y - 5, p.z);
		}
	}
}

function handleMouseUp(event) {
	if (event.button === 0) {
		isShootingMG = false;
	}
}

function handleContextMenu(event) {
	event.preventDefault();
}

function loop() {
	airplane.propeller.rotation.x += 0.3;

	// Rotar el "treadmill" gigante
	sea.mesh.rotation.z += .002;
	lakes.mesh.rotation.z += .002;
	forest.mesh.rotation.z += .002;
	mountains.mesh.rotation.z += .002;
	sky.mesh.rotation.z += .004;
	grass.mesh.rotation.z += .002;
	rocks.mesh.rotation.z += .002;

	airplane.pilot.updateHairs();
	sea.moveWaves(); 
	updatePlane();
	updateEagle();
	
	if (isShootingMG && !isOverheated) {
		mgTimer++;
		if (mgTimer > 3) {
			mgTimer = 0;
			playMachineGunSound();
			const p = airplane.mesh.position;
			weaponManager.fireMachineGun(p.x + 55, p.y - 10, p.z);
		}
		
		machineGunHeat += 1.5;
		if (machineGunHeat >= 100) {
			machineGunHeat = 100;
			isOverheated = true;
			isShootingMG = false; // Fuerza detener el disparo
		}
	} else {
		machineGunHeat -= 0.5;
		if (machineGunHeat <= 0) {
			machineGunHeat = 0;
			isOverheated = false;
		}
	}
	
	HUD.updateHeat(machineGunHeat, isOverheated);
	
	// Auto-reload system
	if (airplane.ammo < 8) {
		reloadTimer++;
		if (reloadTimer > 180) { // Approx 3 seconds to reload 1 missile
			airplane.reloadMissile();
			HUD.updateAmmo(airplane.ammo);
			reloadTimer = 0;
		}
	} else {
		reloadTimer = 0;
	}
	
	// Update Weapons and HUD
	weaponManager.update();
	HUD.updatePosition(camera.aspect);

	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function init() {
	createScene();
	createLights(scene);
	scene.add(camera);

	createPlane();
	createSea();
	createLakes();
	createForest();
	createMountains();
	createSky();
	createEagle();
	createGrass();
	createRocks();
	
	weaponManager = new WeaponManager(scene);
	HUD.init(camera);

	document.addEventListener('mousemove', handleMouseMove, false);
	document.addEventListener('mousedown', handleMouseDown, false);
	document.addEventListener('mouseup', handleMouseUp, false);
	document.addEventListener('contextmenu', handleContextMenu, false);
	loop();
}

window.addEventListener('load', init, false);
