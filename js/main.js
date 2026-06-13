/**
 * AI SUMMARY: Main entry point. Initializes Three.js, manages game loop, user inputs, level progression, and object updates.
 */
import * as THREE from '../libs/three.module.min.js';
window.THREE = THREE;
THREE.ColorManagement.enabled = false;

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
import { initAudio, playShootSound, playMachineGunSound, playEpicSong, setMusicMuted, setSfxMuted, setSongId, playAlienLaserSound, playExplosionSound, playRescueSound, playThunderSound, startRainSound, stopRainSound, startPropellerSound, stopPropellerSound, setPropellerPitch, playSalsaSong, stopSalsaSong, playRadioTuningSound } from './utils/audio.js';
import { HUD } from './ui/hud.js';
import { Rain } from './objects/Rain.js';
import { Mothership } from './objects/Mothership.js';
import { BackgroundBattle } from './objects/BackgroundBattle.js';
import { VictoryScene } from './objects/VictoryScene.js';

import { GameState } from './core/GameState.js';
import { InputManager } from './managers/InputManager.js';
import { LevelManager } from './managers/LevelManager.js';
import { UIManager } from './managers/UIManager.js';

let sea, mountains, sky, airplane, lakes, forest, eagle, grass, rocks, weaponManager, enemyManager, rain, mothership, bgBattle, victoryScene;


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
	scene.add(sky.celestials);
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

function createRain() {
	rain = new Rain();
	scene.add(rain.mesh);
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

let isLooping = false;
let loopAngle = 0;
let lastTargetX = 0;

function updatePlane() {
	// Cálculo exacto del límite de la pantalla basado en la cámara (FOV 60)
	const zDist = camera.position.z; // 280
	const topY = zDist * 0.57735; // Math.tan(30 * Math.PI / 180)
	const rightX = topY * (window.innerWidth / window.innerHeight);

	// Mapeo directo de la posición del ratón (-1 a 1) a las coordenadas del mundo
	// Multiplicamos por 0.95 para dejar un ligero margen y que el avión no se corte
	let targetY = camera.position.y + (InputManager.mousePos.y * topY * 0.95);
	const targetX = (InputManager.mousePos.x * rightX * 0.95);
	
	const mouseDeltaX = targetX - lastTargetX;
	lastTargetX = targetX;
	
	// Limitar para que no atraviese el suelo (El cilindro está en Y=0)
	if (targetY < 35) targetY = 35;

	// Move the plane in Y and X
	const diffY = targetY - airplane.mesh.position.y;
	const diffX = targetX - airplane.mesh.position.x;
	
	airplane.mesh.position.y += diffY * 0.1;
	airplane.mesh.position.x += diffX * 0.1;

	// Rizo (Loop-the-loop) solo cuando hay un "flick" brusco del ratón hacia atrás
	if (!isLooping && mouseDeltaX < -10 && diffX < -10) {
		isLooping = true;
		loopAngle = 0;
		// Soltar un poco de humo en las alas al iniciar la acrobacia
		const p = airplane.mesh.position;
		weaponManager.spawnContrail(p.x - 5, p.y + 2, p.z + 18);
		weaponManager.spawnContrail(p.x - 5, p.y + 2, p.z - 18);
	}

	if (isLooping) {
		loopAngle += 0.12; // Velocidad de giro más suave y natural (~52 frames)
		if (loopAngle >= Math.PI * 2) {
			isLooping = false;
			loopAngle = 0;
		}
	}
	
	// Factor de pitch de la hélice basado en la velocidad (qué tan lejos está el objetivo y cuánto se mueve)
	// InputManager.mousePos.y va de -1 a 1 (arriba es 1). Al acelerar hacia arriba (+1) el motor ruge más.
	const planeSpeed = Math.sqrt(diffX*diffX + diffY*diffY) * 0.1; 
	const pitchFactor = Math.min(Math.max((InputManager.mousePos.y + 1) / 2 + (planeSpeed / 10), 0), 1.0);
	setPropellerPitch(pitchFactor, isLooping);

	// Aplicar rotaciones
	if (isLooping) {
		// Rotación completa de backflip en Z, más un poco de los otros ejes para suavidad
		airplane.mesh.rotation.z = loopAngle;
		airplane.mesh.rotation.x = -diffY * 0.002;
		airplane.mesh.rotation.y = -diffX * 0.005;
	} else {
		// Efecto de giro más "plano" (suave) normal
		airplane.mesh.rotation.z = diffY * 0.005; 
		airplane.mesh.rotation.x = -diffY * 0.002;
		airplane.mesh.rotation.y = -diffX * 0.005;
	}

	airplane.propeller.rotation.x += 0.3;
	
	// Daño visual (Humo si la vida baja del 50%)
	if (GameState.energy < 50) {
		if (Math.random() < (50 - GameState.energy) * 0.015) { // Mientras menos vida, más humo
			const p = airplane.mesh.position;
			weaponManager.spawnSmoke(p.x - 20, p.y + 10, p.z);
			if (GameState.energy < 20 && Math.random() > 0.5) {
				weaponManager.spawnSpark(p.x - 20, p.y + 10, p.z); // Chispas si está crítico
			}
		}
	}
	
	// Estelas de condensación (Contrails) desde las alas SOLO en maniobras verticales bruscas
	if (Math.abs(diffY) > 15 && Math.random() > 0.2) {
		const p = airplane.mesh.position;
		weaponManager.spawnContrail(p.x - 5, p.y + 2, p.z + 18); // Ala derecha
		weaponManager.spawnContrail(p.x - 5, p.y + 2, p.z - 18); // Ala izquierda
	}
}



function loop() {
	airplane.propeller.rotation.x += 0.3;

	// Smoothly interpolate gameSpeed
	GameState.gameSpeed += (GameState.targetGameSpeed - GameState.gameSpeed) * 0.02;

	// Rotar el "treadmill" gigante
	sea.mesh.rotation.z += GameState.gameSpeed;
	lakes.mesh.rotation.z += GameState.gameSpeed;
	forest.mesh.rotation.z += GameState.gameSpeed;
	mountains.mesh.rotation.z += GameState.gameSpeed;
	sky.mesh.rotation.z += GameState.gameSpeed * 2;
	if (sky.celestials) {
		sky.sun.rotation.z += GameState.gameSpeed;
		sky.moon.rotation.y += GameState.gameSpeed;
	}
	grass.mesh.rotation.z += GameState.gameSpeed;
	rocks.mesh.rotation.z += GameState.gameSpeed;
	
	// Transición de altitud del mundo
	if (GameState.currentWorldY !== GameState.targetWorldY) {
		GameState.currentWorldY += (GameState.targetWorldY - GameState.currentWorldY) * 0.01;
		sea.mesh.position.y = GameState.currentWorldY;
		lakes.mesh.position.y = GameState.currentWorldY;
		forest.mesh.position.y = GameState.currentWorldY;
		mountains.mesh.position.y = GameState.currentWorldY;
		grass.mesh.position.y = GameState.currentWorldY;
		rocks.mesh.position.y = GameState.currentWorldY;
	}
	
	// Efecto de relámpagos en el nivel 4
	if (GameState.currentLevel === 4) {
		if (Math.random() < 0.02) {
			// Destello intenso
			ambientLight.intensity = 3.0;
			scene.fog.color.setHex(0xffffff);
			document.querySelector('.aviator').style.background = 'linear-gradient(#ffffff, #aaaaaa)';
			if (Math.random() < 0.1) playThunderSound();
		} else {
			// Volver rápido a la oscuridad
			ambientLight.intensity += (0.2 - ambientLight.intensity) * 0.1;
			scene.fog.color.lerp(new window.THREE.Color(0x222222), 0.1);
			document.querySelector('.aviator').style.background = 'linear-gradient(#111111, #333333)';
		}
	}

	if (GameState.gameState === 'playing') {
		airplane.pilot.update(airplane.isSearchingRadio, airplane.showMotivationAura);
		sea.moveWaves(); 
		if (rain) rain.update();
		updatePlane();
		updateEagle();
		
		if (GameState.isShootingMG && !GameState.isOverheated) {
			GameState.mgTimer++;
			if (GameState.mgTimer > 3) {
				GameState.mgTimer = 0;
				playMachineGunSound();
				const p = airplane.mesh.position;
				
				// Disparamos dos balas simultáneamente desde los cañones de las alas
				weaponManager.fireMachineGun(p.x + 15, p.y - 5, p.z + 30);
				weaponManager.spawnMuzzleSmoke(p.x + 15, p.y - 5, p.z + 30);
				
				weaponManager.fireMachineGun(p.x + 15, p.y - 5, p.z - 30);
				weaponManager.spawnMuzzleSmoke(p.x + 15, p.y - 5, p.z - 30);
				
				if (HUD.showMiniFlash) HUD.showMiniFlash(0xffff00); // Amarillo para ametralladora
			}
			
			GameState.machineGunHeat += 0.6;
			if (GameState.machineGunHeat >= 100) {
				GameState.machineGunHeat = 100;
				GameState.isOverheated = true;
				GameState.isShootingMG = false; // Fuerza detener el disparo
			}
		} else {
			GameState.machineGunHeat -= 0.6;
			if (GameState.machineGunHeat <= 0) {
				GameState.machineGunHeat = 0;
				GameState.isOverheated = false;
			}
		}
		
		HUD.updateHeat(GameState.machineGunHeat, GameState.isOverheated);
		
		// Auto-reload system
		if (airplane.ammo < 8) {
			GameState.reloadTimer++;
			if (GameState.reloadTimer > 180) { // Approx 3 seconds to reload 1 missile
				airplane.reloadMissile();
				HUD.updateAmmo(airplane.ammo);
				GameState.reloadTimer = 0;
			}
		} else {
			GameState.reloadTimer = 0;
		}
		
		// Update Enemies
		enemyManager.update(Date.now(), airplane.mesh.position.y, GameState.currentLevel, () => {
			playAlienLaserSound();
		});
		
		// Collision Logic
		const planePos = airplane.mesh.position;
		
		// 1. Lasers vs Airplane
		for (let i = enemyManager.lasers.length - 1; i >= 0; i--) {
			const laser = enemyManager.lasers[i];
			if (laser.active && laser.mesh.position.distanceTo(planePos) < 20) {
				laser.active = false; // Destroy laser
				GameState.energy -= 5; // Reduced from 10
				HUD.updateEnergy(GameState.energy);
				weaponManager.spawnSpark(planePos.x, planePos.y, planePos.z);
				
				if (GameState.energy <= 0) {
					LevelManager.resetGame();
				}
			}
		}
		
		// 1.b Kamikaze/UFOs vs Airplane
		for (let i = enemyManager.ufos.length - 1; i >= 0; i--) {
			const ufo = enemyManager.ufos[i];
			if (ufo.active && ufo.mesh.position.distanceTo(planePos) < 25) {
				ufo.active = false;
				playExplosionSound();
				weaponManager.spawnSmoke(ufo.mesh.position.x, ufo.mesh.position.y, ufo.mesh.position.z);
				
				GameState.energy -= (ufo.type === 'kamikaze') ? 15 : 10; // Reduced from 25 : 15
				HUD.updateEnergy(GameState.energy);
				weaponManager.spawnSpark(planePos.x, planePos.y, planePos.z);
				
				if (GameState.energy <= 0) {
					LevelManager.resetGame();
				}
			}
		}
		
		// 1.c Bombs vs Airplane
		for (let i = enemyManager.bombs.length - 1; i >= 0; i--) {
			const bomb = enemyManager.bombs[i];
			if (bomb.active && bomb.mesh.position.distanceTo(planePos) < 20) {
				bomb.active = false;
				playExplosionSound();
				weaponManager.spawnSmoke(bomb.mesh.position.x, bomb.mesh.position.y, bomb.mesh.position.z);
				
				GameState.energy -= 15; // Las bombas hacen menos daño, reducido de 30
				HUD.updateEnergy(GameState.energy);
				weaponManager.spawnSpark(planePos.x, planePos.y, planePos.z);
				
				if (GameState.energy <= 0) {
					LevelManager.resetGame();
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
				
				const dx = proj.mesh.position.x - ufo.mesh.position.x;
				const dy = proj.mesh.position.y - ufo.mesh.position.y;
				const distSq = dx*dx + dy*dy;
				
				if (distSq < 625) { // 25 * 25
					// Hit
					ufo.hitPoints--;
					if (proj.speed < 10) ufo.hitPoints -= 2; // Misiles hacen más daño
					
					proj.mesh.position.x += 1000; // Move out of screen instead of complex splice logic for now
					weaponManager.spawnSpark(ufo.mesh.position.x, ufo.mesh.position.y, ufo.mesh.position.z);
					
					if (ufo.hitPoints <= 0) {
						ufo.active = false;
						playExplosionSound();
						weaponManager.spawnSmoke(ufo.mesh.position.x, ufo.mesh.position.y, ufo.mesh.position.z);
						
						GameState.score += 100;
						
						// Rescue check
						if (enemyManager.releaseCaptive(ufo)) {
							playRescueSound();
							GameState.score += 500; // 500 points por salvar a la vaca/humano
						}
						HUD.updateScore(GameState.score);
						LevelManager.checkLevelUp();
					}
					break; // Projectile destroyed, check next
				}
			}
		}
		
		// Update Weapons and HUD
		weaponManager.update();
		HUD.updatePosition(camera.aspect);
		HUD.updateMiniPlane(airplane);
		
		// Update epic background
		if (mothership) {
			mothership.update(Date.now(), GameState.currentLevel, enemyManager);
			if (mothership.state === "combat" || mothership.state === "intro") {
				HUD.updateBossHealth(mothership.health, mothership.maxHealth);
				
				// Death Ray Collision (Instant Energy Drain!)
				if (mothership.attackState === "deathray" && mothership.attackTimer > 100 && mothership.attackTimer < 250) {
					// Extremely simplified: if player is roughly in center of screen
					if (Math.abs(airplane.mesh.position.y - 100) < 60) {
						GameState.energy -= 1.0;
						HUD.updateEnergy(GameState.energy);
						if (GameState.energy <= 0) LevelManager.resetGame();
					}
				}
				
				// Projectile collision with Boss
				for (let i = weaponManager.projectiles.length - 1; i >= 0; i--) {
					const proj = weaponManager.projectiles[i];
					const dx = proj.mesh.position.x - mothership.mesh.position.x;
					const dy = proj.mesh.position.y - mothership.mesh.position.y;
					const dz = proj.mesh.position.z - mothership.mesh.position.z;
					const distSq = dx*dx + dy*dy + dz*dz;
					
					// Hitbox is massive
					if (distSq < mothership.hitboxRadiusSq) {
						weaponManager.spawnSmoke(proj.mesh.position.x, proj.mesh.position.y, proj.mesh.position.z);
						weaponManager.projectiles.splice(i, 1);
						scene.remove(proj.mesh);
						
						mothership.health -= (proj.type === 'missile' ? 50 : 5);
						
						if (mothership.health <= 0 && mothership.state !== "dead") {
							mothership.state = "dead";
							bgBattle.triggerNuke(GameState.currentLevel); // Massive death explosion
							GameState.score += 5000;
							HUD.hideBossUI();
							
							LevelManager.triggerVictory();
						}
					}
				}
			}
		}
		if (bgBattle) {
			bgBattle.update(Date.now(), ambientLight, GameState.currentLevel);
			if (Math.random() < 0.0005) { // ~ once every 33 seconds at 60fps
				bgBattle.triggerNuke(GameState.currentLevel);
			}
		}
	}
	
	// Actualizar escena de victoria
	if (victoryScene) victoryScene.update();

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
	createRain();
	
	mothership = new Mothership();
	scene.add(mothership.mesh);
	
	bgBattle = new BackgroundBattle(scene);
	
	victoryScene = new VictoryScene(scene);
	scene.add(victoryScene.mesh);
	
	weaponManager = new WeaponManager(scene);
	enemyManager = new EnemyManager(scene);
	HUD.init(camera);
	HUD.addMiniPlane(airplane.mesh.clone());
	HUD.updateScore(GameState.score);
	HUD.updateEnergy(GameState.energy);
	
	// Inicializar Managers
	InputManager.init(window.innerWidth, window.innerHeight, { camera, HUD, airplane, weaponManager });
	LevelManager.init({ scene, camera, airplane, mothership, victoryScene, enemyManager, weaponManager, sea, mountains, lakes, forest, eagle, grass, rocks, sky, rain, bgBattle, ambientLight, hemisphereLight });
	UIManager.init(airplane, mothership);

	document.addEventListener('styleChanged', (e) => {
		if (typeof previewPlane !== 'undefined' && previewPlane) {
			previewPlane.applyStyle(e.detail);
		}
	});

	loop();
}

// ==========================================
// 3D PREVIEW FOR SETTINGS
// ==========================================
let previewScene, previewCamera, previewRenderer, previewPlane, previewAnimId;

function initPreview() {
	const canvas = document.getElementById('plane-preview-canvas');
	if (!canvas) return;
	
	if (!previewScene) {
		previewRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
		previewRenderer.setSize(300, 300);
		previewRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;
		
		previewScene = new THREE.Scene();
		previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
		previewCamera.position.set(0, 30, 120);
		previewCamera.lookAt(0, 0, 0);
		
		const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 3.0);
		const dirLight = new THREE.DirectionalLight(0xffffff, 3.5);
		dirLight.position.set(150, 350, 350);
		previewScene.add(hemiLight);
		previewScene.add(dirLight);
		
		previewPlane = new AirPlane();
		previewPlane.mesh.scale.set(0.4, 0.4, 0.4);
		previewScene.add(previewPlane.mesh);
	}
	
	const planeSelect = document.getElementById('plane-color-select');
	if (planeSelect) {
		const styleId = parseInt(planeSelect.value);
		previewPlane.applyStyle(styleId);
	}
	
	function renderPreview() {
		previewAnimId = requestAnimationFrame(renderPreview);
		previewPlane.propeller.rotation.x += 0.3;
		previewPlane.mesh.rotation.y += 0.015;
		previewPlane.mesh.rotation.z = Math.sin(Date.now() * 0.002) * 0.1;
		previewPlane.mesh.position.y = Math.sin(Date.now() * 0.003) * 5; 
		previewRenderer.render(previewScene, previewCamera);
	}
	
	stopPreview(); // Ensure no duplicates
	renderPreview();
}

function stopPreview() {
	if (previewAnimId) {
		cancelAnimationFrame(previewAnimId);
		previewAnimId = null;
	}
}

window.addEventListener('load', init, false);
