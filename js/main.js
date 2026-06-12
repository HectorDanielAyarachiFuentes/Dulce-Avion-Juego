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
import { initAudio, playShootSound, playMachineGunSound, playEpicSong, setMusicMuted, setSfxMuted, setSongId, playAlienLaserSound, playExplosionSound, playRescueSound, playThunderSound, startRainSound, stopRainSound } from './utils/audio.js';
import { HUD } from './ui/hud.js';
import { Rain } from './objects/Rain.js';

let sea, mountains, sky, airplane, lakes, forest, eagle, grass, rocks, weaponManager, enemyManager, rain;
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
		if (HUD.updateMiniPlaneBgColor) HUD.updateMiniPlaneBgColor(0x3b5764);
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
		if (HUD.updateMiniPlaneBgColor) HUD.updateMiniPlaneBgColor(0x08131a);
	}
	else if (currentLevel === 4) { // Tormenta
		aviator.style.background = 'linear-gradient(#111111, #333333)';
		scene.fog.color.setHex(0x222222);
		ambientLight.color.setHex(0x444455);
		ambientLight.intensity = 0.2;
		hemisphereLight.intensity = 0.2;
	}

	if (typeof sky !== 'undefined' && sky.sun && sky.moon) {
		if (currentLevel === 1) {
			sky.sun.visible = true;
			sky.moon.visible = false;
			sky.sun.material.color.setHex(0xffd700); // Sol amarillo
		} else if (currentLevel === 2) {
			sky.sun.visible = true;
			sky.moon.visible = false;
			sky.sun.material.color.setHex(0xff5500); // Sol naranja de atardecer
		} else if (currentLevel === 3) {
			sky.sun.visible = false;
			sky.moon.visible = true;
			if (sky.moonMat) sky.moonMat.color.setHex(0xeef4f5); // Luna brillante
		} else if (currentLevel === 4) {
			sky.sun.visible = false;
			sky.moon.visible = true;
			if (sky.moonMat) sky.moonMat.color.setHex(0x8899aa); // Luna opacada por tormenta
		}
	}
	
	if (currentLevel === 4) {
		if (rain) rain.mesh.visible = true;
		startRainSound();
	} else {
		if (rain) rain.mesh.visible = false;
		stopRainSound();
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

function updatePlane() {
	// Cálculo exacto del límite de la pantalla basado en la cámara (FOV 60)
	const zDist = camera.position.z; // 280
	const topY = zDist * 0.57735; // Math.tan(30 * Math.PI / 180)
	const rightX = topY * (window.innerWidth / window.innerHeight);

	// Mapeo directo de la posición del ratón (-1 a 1) a las coordenadas del mundo
	// Multiplicamos por 0.95 para dejar un ligero margen y que el avión no se corte
	let targetY = camera.position.y + (mousePos.y * topY * 0.95);
	const targetX = (mousePos.x * rightX * 0.95);
	
	// Limitar para que no atraviese el suelo (El cilindro está en Y=0)
	if (targetY < 35) targetY = 35;

	// Move the plane in Y and X
	const diffY = targetY - airplane.mesh.position.y;
	const diffX = targetX - airplane.mesh.position.x;
	
	airplane.mesh.position.y += diffY * 0.1;
	airplane.mesh.position.x += diffX * 0.1;

	// Efecto de giro más "plano" (suave)
	airplane.mesh.rotation.z = diffY * 0.005; 
	airplane.mesh.rotation.x = -diffY * 0.002;
	airplane.mesh.rotation.y = -diffX * 0.005;

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
	
	// Estelas de condensación (Contrails) desde las alas SOLO en maniobras verticales bruscas
	if (Math.abs(diffY) > 15 && Math.random() > 0.2) {
		const p = airplane.mesh.position;
		weaponManager.spawnContrail(p.x - 5, p.y + 2, p.z + 18); // Ala derecha
		weaponManager.spawnContrail(p.x - 5, p.y + 2, p.z - 18); // Ala izquierda
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
	
	// Raycaster for checking if we clicked the 3D Gear Settings Icon
	const tx = -1 + (event.clientX / window.innerWidth) * 2;
	const ty = 1 - (event.clientY / window.innerHeight) * 2;
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera({x: tx, y: ty}, camera);
	
	if (HUD.gearMesh) {
		const intersects = raycaster.intersectObject(HUD.gearMesh, true);
		if (intersects.length > 0) {
			const settingsModal = document.getElementById('settings-modal');
			settingsModal.classList.remove('hidden');
			gameState = 'paused';
			document.body.classList.remove('playing');
			if (typeof initPreview === 'function') initPreview(); // Start preview
			return; // Don't shoot
		}
	}
	
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
			
			if (HUD.showMiniFlash) HUD.showMiniFlash(0xff8800); // Naranja para misiles
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

function resetGame() {
	energy = 100;
	const startSelect = document.getElementById('start-level-select');
	const selectedLevel = startSelect ? parseInt(startSelect.value) : 1;
	if (selectedLevel === 1) score = 0;
	if (selectedLevel === 2) score = 1500;
	if (selectedLevel === 3) score = 3500;
	if (selectedLevel === 4) score = 7000;
	currentLevel = selectedLevel;
	updateEnvironmentColor();
	HUD.updateEnergy(energy);
	HUD.updateScore(score);
}

function loop() {
	airplane.propeller.rotation.x += 0.3;

	// Rotar el "treadmill" gigante
	sea.mesh.rotation.z += .002;
	lakes.mesh.rotation.z += .002;
	forest.mesh.rotation.z += .002;
	mountains.mesh.rotation.z += .002;
	sky.mesh.rotation.z += .004;
	if (sky.celestials) {
		sky.sun.rotation.z += 0.002;
		sky.moon.rotation.y += 0.002;
	}
	grass.mesh.rotation.z += .002;
	rocks.mesh.rotation.z += .002;
	
	// Efecto de relámpagos en el nivel 4
	if (currentLevel === 4) {
		if (Math.random() < 0.02) {
			// Destello intenso
			ambientLight.intensity = 3.0;
			scene.fog.color.setHex(0xffffff);
			document.querySelector('.aviator').style.background = 'linear-gradient(#ffffff, #aaaaaa)';
			if (Math.random() < 0.1) playThunderSound();
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
		if (rain) rain.update();
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
				if (HUD.showMiniFlash) HUD.showMiniFlash(0xffff00); // Amarillo para ametralladora
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
		enemyManager.update(Date.now(), airplane.mesh.position.y, currentLevel, () => {
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
					resetGame();
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
				
				energy -= (ufo.type === 'kamikaze') ? 25 : 15;
				HUD.updateEnergy(energy);
				weaponManager.spawnSpark(planePos.x, planePos.y, planePos.z);
				
				if (energy <= 0) {
					resetGame();
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
				
				energy -= 30; // Las bombas hacen mucho daño
				HUD.updateEnergy(energy);
				weaponManager.spawnSpark(planePos.x, planePos.y, planePos.z);
				
				if (energy <= 0) {
					resetGame();
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
		HUD.updateMiniPlane(airplane);
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
	createRain();
	
	weaponManager = new WeaponManager(scene);
	enemyManager = new EnemyManager(scene);
	HUD.init(camera);
	HUD.addMiniPlane(airplane.mesh.clone());
	HUD.updateScore(score);
	HUD.updateEnergy(energy);
	
	// Botón de Inicio
	const startBtn = document.getElementById('start-btn');
	const welcomeScreen = document.getElementById('welcome-screen');
	
	// Controles de Ajustes
	const settingsModal = document.getElementById('settings-modal');
	const closeSettingsBtn = document.getElementById('close-settings-btn');
	const muteMusicChk = document.getElementById('mute-music-chk');
	const muteSfxChk = document.getElementById('mute-sfx-chk');
	const fullscreenBtn = document.getElementById('fullscreen-btn');
	const trackSelect = document.getElementById('track-select');
	const planeColorSelect = document.getElementById('plane-color-select');
	
	startBtn.addEventListener('click', () => {
		welcomeScreen.classList.add('hidden');
		gameState = 'playing';
		document.body.classList.add('playing');
		resetGame();
		playEpicSong(); // Esto iniciará el loop procedural
	});
	
	closeSettingsBtn.addEventListener('click', () => {
		settingsModal.classList.add('hidden');
		// Si estábamos pausados, volvemos a jugar (siempre y cuando ya hayamos pasado el menu inicial)
		if (gameState === 'paused' && welcomeScreen.classList.contains('hidden')) {
			gameState = 'playing';
			document.body.classList.add('playing');
		}
		if (typeof stopPreview === 'function') stopPreview();
	});
	
	muteMusicChk.addEventListener('change', (e) => {
		setMusicMuted(e.target.checked);
	});
	
	muteSfxChk.addEventListener('change', (e) => {
		setSfxMuted(e.target.checked);
	});
	
	if (fullscreenBtn) {
		fullscreenBtn.addEventListener('click', () => {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen().catch(err => {
					console.log(`Error al intentar activar pantalla completa: ${err.message}`);
				});
				fullscreenBtn.innerText = "Desactivar";
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
					fullscreenBtn.innerText = "Activar";
				}
			}
		});
		
		document.addEventListener('fullscreenchange', () => {
			if (!document.fullscreenElement) {
				fullscreenBtn.innerText = "Activar";
			} else {
				fullscreenBtn.innerText = "Desactivar";
			}
		});
	}
	
	trackSelect.addEventListener('change', (e) => {
		setSongId(parseInt(e.target.value));
	});

	if (planeColorSelect) {
		planeColorSelect.addEventListener('change', (e) => {
			const styleId = parseInt(e.target.value);
			airplane.applyStyle(styleId);
			if (typeof previewPlane !== 'undefined' && previewPlane) {
				previewPlane.applyStyle(styleId);
			}
		});
	}

	document.addEventListener('mousemove', handleMouseMove, false);
	document.addEventListener('mousedown', handleMouseDown, false);
	document.addEventListener('mouseup', handleMouseUp, false);
	document.addEventListener('contextmenu', handleContextMenu, false);
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
		
		previewScene = new THREE.Scene();
		previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
		previewCamera.position.set(0, 30, 120);
		previewCamera.lookAt(0, 0, 0);
		
		const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
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
