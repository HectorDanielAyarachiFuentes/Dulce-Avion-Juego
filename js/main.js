import { scene, camera, renderer, createScene } from './scene.js';
import { createLights, ambientLight, hemisphereLight } from './lights.js';
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
import { EnemyManager } from './objects/Enemies.js';
import { initAudio, playShootSound, playMachineGunSound, playEpicSong, setMusicMuted, setSfxMuted, setSongId, playAlienLaserSound, playExplosionSound, playRescueSound } from './utils/audio.js';
import { HUD } from './ui/hud.js';

let sea, mountains, sky, airplane, lakes, forest, eagle, grass, rocks, weaponManager, enemyManager;
let mousePos = { x: 0, y: 0 };
let isShootingMG = false;
let mgTimer = 0;
let reloadTimer = 0;
let machineGunHeat = 0;
let isOverheated = false;

// Global Game State
let score = 0;
let energy = 100;
let gameState = 'welcome'; // 'welcome', 'playing', 'paused'
let currentLevel = 1;

function checkLevelUp() {
	let newLevel = 1;
	if (score >= 7000) newLevel = 4;
	else if (score >= 3500) newLevel = 3;
	else if (score >= 1500) newLevel = 2;
	
	if (newLevel > currentLevel) {
		currentLevel = newLevel;
		showLevelUpMessage();
		updateEnvironmentColor();
	}
}

function showLevelUpMessage() {
	const msgBox = document.getElementById('level-up-message');
	const levelText = document.getElementById('level-text');
	const levelSubtext = document.getElementById('level-subtext');
	
	levelText.innerText = "NIVEL " + currentLevel;
	if (currentLevel === 2) levelSubtext.innerText = "ATARDECER ROJO";
	if (currentLevel === 3) levelSubtext.innerText = "NOCHE OSCURA";
	if (currentLevel === 4) levelSubtext.innerText = "TORMENTA FINAL";
	
	msgBox.classList.remove('hidden');
	setTimeout(() => {
		msgBox.classList.add('hidden');
	}, 3000);
}

function updateEnvironmentColor() {
	const aviator = document.querySelector('.aviator');
	
	if (currentLevel === 1) { // Día Claro
		aviator.style.background = 'linear-gradient(#3b5764, #739aaf)';
		scene.fog.color.setHex(0xf7d9aa);
		ambientLight.color.setHex(0xdc8874);
		ambientLight.intensity = 0.5;
		hemisphereLight.intensity = 0.9;
	} 
	else if (currentLevel === 2) { // Atardecer
		aviator.style.background = 'linear-gradient(#e44d2e, #f2a878)';
		scene.fog.color.setHex(0xf2a878);
		ambientLight.color.setHex(0xdc8874);
		ambientLight.intensity = 0.8;
		hemisphereLight.intensity = 0.6;
	}
	else if (currentLevel === 3) { // Noche Oscura
		aviator.style.background = 'linear-gradient(#08131a, #1a2a36)';
		scene.fog.color.setHex(0x1a2a36);
		ambientLight.color.setHex(0x555577);
		ambientLight.intensity = 0.3;
		hemisphereLight.intensity = 0.3;
	}
	else if (currentLevel === 4) { // Tormenta
		aviator.style.background = 'linear-gradient(#111111, #333333)';
		scene.fog.color.setHex(0x222222);
		ambientLight.color.setHex(0x444455);
		ambientLight.intensity = 0.2;
		hemisphereLight.intensity = 0.2;
	}
}

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
	
	// Daño visual (Humo si la vida baja del 50%)
	if (energy < 50) {
		if (Math.random() < (50 - energy) * 0.015) { // Mientras menos vida, más humo
			const p = airplane.mesh.position;
			weaponManager.spawnSmoke(p.x - 20, p.y + 10, p.z);
			if (energy < 20 && Math.random() > 0.5) {
				weaponManager.spawnSpark(p.x - 20, p.y + 10, p.z); // Chispas si está crítico
			}
		}
	}
}

function handleMouseMove(event) {
	if (gameState !== 'playing') return;
	const tx = -1 + (event.clientX / window.innerWidth) * 2;
	const ty = 1 - (event.clientY / window.innerHeight) * 2;
	mousePos = { x: tx, y: ty };
}

function handleMouseDown(event) {
	if (gameState !== 'playing') return;
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
	if (gameState !== 'playing') return;
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
	
	// Efecto de relámpagos en el nivel 4
	if (currentLevel === 4) {
		if (Math.random() < 0.02) {
			// Destello intenso
			ambientLight.intensity = 3.0;
			scene.fog.color.setHex(0xffffff);
			document.querySelector('.aviator').style.background = 'linear-gradient(#ffffff, #aaaaaa)';
		} else {
			// Volver rápido a la oscuridad
			ambientLight.intensity += (0.2 - ambientLight.intensity) * 0.1;
			scene.fog.color.lerp(new THREE.Color(0x222222), 0.1);
			document.querySelector('.aviator').style.background = 'linear-gradient(#111111, #333333)';
		}
	}

	if (gameState === 'playing') {
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
				// La bala y el humo salen de la punta exacta del cañón (x=65, y=-10)
				weaponManager.fireMachineGun(p.x + 65, p.y - 10, p.z);
				weaponManager.spawnMuzzleSmoke(p.x + 65, p.y - 10, p.z);
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
		
		// Update Enemies
		enemyManager.update(Date.now(), () => {
			playAlienLaserSound();
		});
		
		// Collision Logic
		const planePos = airplane.mesh.position;
		
		// 1. Lasers vs Airplane
		for (let i = enemyManager.lasers.length - 1; i >= 0; i--) {
			const laser = enemyManager.lasers[i];
			if (laser.active && laser.mesh.position.distanceTo(planePos) < 20) {
				laser.active = false; // Destroy laser
				energy -= 10;
				HUD.updateEnergy(energy);
				weaponManager.spawnSpark(planePos.x, planePos.y, planePos.z);
				
				if (energy <= 0) {
					// Reiniciamos sin pantalla de game over para no interrumpir
					energy = 100;
					score = 0;
					HUD.updateEnergy(energy);
					HUD.updateScore(score);
				}
			}
		}
		
		// 2. Projectiles vs UFOs
		for (let i = weaponManager.projectiles.length - 1; i >= 0; i--) {
			const proj = weaponManager.projectiles[i];
			if (!proj.active) continue; // Proyectiles no tienen .active nativo aún, pero lo manejamos
			
			for (let j = enemyManager.ufos.length - 1; j >= 0; j--) {
				const ufo = enemyManager.ufos[j];
				if (!ufo.active) continue;
				
				if (proj.mesh.position.distanceTo(ufo.mesh.position) < 25) {
					// Hit
					ufo.hitPoints--;
					if (proj.speed < 10) ufo.hitPoints -= 2; // Misiles hacen más daño
					
					proj.mesh.position.x += 1000; // Move out of screen instead of complex splice logic for now
					weaponManager.spawnSpark(ufo.mesh.position.x, ufo.mesh.position.y, ufo.mesh.position.z);
					
					if (ufo.hitPoints <= 0) {
						ufo.active = false;
						playExplosionSound();
						weaponManager.spawnSmoke(ufo.mesh.position.x, ufo.mesh.position.y, ufo.mesh.position.z);
						
						score += 100;
						
						// Rescue check
						if (enemyManager.releaseCaptive(ufo)) {
							playRescueSound();
							score += 500; // 500 points por salvar a la vaca/humano
						}
						HUD.updateScore(score);
						checkLevelUp();
					}
					break; // Projectile destroyed, check next
				}
			}
		}
		
		// Update Weapons and HUD
		weaponManager.update();
		HUD.updatePosition(camera.aspect);
	}

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
	enemyManager = new EnemyManager(scene);
	HUD.init(camera);
	HUD.updateScore(score);
	HUD.updateEnergy(energy);
	
	// Botón de Inicio
	const startBtn = document.getElementById('start-btn');
	const welcomeScreen = document.getElementById('welcome-screen');
	
	// Controles de Ajustes
	const settingsBtn = document.getElementById('settings-btn');
	const settingsModal = document.getElementById('settings-modal');
	const closeSettingsBtn = document.getElementById('close-settings-btn');
	const muteMusicChk = document.getElementById('mute-music-chk');
	const muteSfxChk = document.getElementById('mute-sfx-chk');
	const trackSelect = document.getElementById('track-select');
	
	startBtn.addEventListener('click', () => {
		welcomeScreen.classList.add('hidden');
		gameState = 'playing';
		document.body.classList.add('playing');
		playEpicSong(); // Esto iniciará el loop procedural
	});
	
	settingsBtn.addEventListener('click', () => {
		settingsModal.classList.remove('hidden');
		if (gameState === 'playing') {
			gameState = 'paused'; // Pausar si estaba jugando
			document.body.classList.remove('playing');
		}
	});
	
	closeSettingsBtn.addEventListener('click', () => {
		settingsModal.classList.add('hidden');
		// Si estábamos pausados, volvemos a jugar (siempre y cuando ya hayamos pasado el menu inicial)
		if (gameState === 'paused' && welcomeScreen.classList.contains('hidden')) {
			gameState = 'playing';
			document.body.classList.add('playing');
		}
	});
	
	muteMusicChk.addEventListener('change', (e) => {
		setMusicMuted(e.target.checked);
	});
	
	muteSfxChk.addEventListener('change', (e) => {
		setSfxMuted(e.target.checked);
	});
	
	trackSelect.addEventListener('change', (e) => {
		setSongId(parseInt(e.target.value));
	});

	document.addEventListener('mousemove', handleMouseMove, false);
	document.addEventListener('mousedown', handleMouseDown, false);
	document.addEventListener('mouseup', handleMouseUp, false);
	document.addEventListener('contextmenu', handleContextMenu, false);
	loop();
}

window.addEventListener('load', init, false);
