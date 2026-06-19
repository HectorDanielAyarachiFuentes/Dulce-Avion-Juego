/**
 * AI SUMMARY: Manages enemy generation, enemy types (ships, disks, bosses), and collision logic.
 */
import { Colors } from '../utils/colors.js';
import { Captive } from './Captive.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let ufoModelTemplate = null;
const loader = new GLTFLoader();
loader.load('assets/models/flying_saucer.glb', function(gltf) {
	ufoModelTemplate = gltf.scene;
	ufoModelTemplate.traverse(function(child) {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
});

export const AlienLaser = function(x, y, z, vx = -15, vy = 0) {
	this.mesh = new THREE.Object3D();
	const geom = new THREE.CylinderGeometry(2, 2, 25, 6); // Más grande y visible
	geom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
	const mat = new THREE.MeshPhongMaterial({ 
		color: Colors.green,
		emissive: Colors.green, // Brillo de láser
		emissiveIntensity: 1.5,
		flatShading: true 
	});
	const body = new THREE.Mesh(geom, mat);
	this.mesh.add(body);
	this.mesh.position.set(x, y, z);
	this.speedX = vx;
	this.speedY = vy;
	this.active = true;
};

AlienLaser.prototype.update = function() {
	this.mesh.position.x += this.speedX;
	this.mesh.position.y += this.speedY;
	if (this.mesh.position.x < -150 || this.mesh.position.y < -50 || this.mesh.position.y > 600) {
		this.active = false;
	}
};

export const AlienBomb = function(x, y, z) {
	this.mesh = new THREE.Object3D();
	const geom = new THREE.SphereGeometry(2.5, 8, 8);
	const mat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true });
	const body = new THREE.Mesh(geom, mat);
	this.mesh.add(body);
	
	// Púas de la bomba
	const spikeGeom = new THREE.ConeGeometry(1, 3, 4);
	const spikeMat = new THREE.MeshPhongMaterial({ color: Colors.red });
	for (let i=0; i<6; i++) {
		const spike = new THREE.Mesh(spikeGeom, spikeMat);
		spike.position.y = 2.5;
		spike.rotation.x = Math.random() * Math.PI;
		spike.rotation.z = Math.random() * Math.PI;
		this.mesh.add(spike);
	}

	this.mesh.position.set(x, y, z);
	this.speedY = 0;
	this.speedX = -1; // Cae y avanza un poco hacia la izquierda
	this.active = true;
};

AlienBomb.prototype.update = function() {
	this.speedY -= 0.1; // Gravedad
	this.mesh.position.y += this.speedY;
	this.mesh.position.x += this.speedX;
	this.mesh.rotation.z += 0.1;
	
	if (this.mesh.position.y < -50 || this.mesh.position.x < -150) {
		this.active = false;
	}
};



export const Ufo = function(type = 'basic') {
	this.mesh = new THREE.Object3D();
	this.active = true;
	this.type = type;
	
	// Partes que rotan
	this.rotatableParts = new THREE.Object3D();
	
	if (ufoModelTemplate) {
		const model = ufoModelTemplate.clone();
		
		// Ajuste de escala a un punto intermedio, para que no sea ni gigante ni diminuto
		model.scale.setScalar(0.6); 
		
		// Diferenciación de tamaño por tipo
		if (type === 'kamikaze') {
			model.scale.setScalar(0.4);
		} else if (type === 'bomber') {
			model.scale.setScalar(0.9);
		}
		
		this.rotatableParts.add(model);
	} else {
		// Fallback simple si aún no carga
		const diskGeom = new THREE.CylinderGeometry(15, 15, 4, 12);
		const diskMat = new THREE.MeshPhongMaterial({ color: Colors.grey, flatShading: true });
		const disk = new THREE.Mesh(diskGeom, diskMat);
		this.rotatableParts.add(disk);
	}
	
	this.mesh.add(this.rotatableParts);
	this.mesh.position.z = 0; // Todos en el mismo plano Z
	this.angle = Math.random() * Math.PI * 2;
	
	if (type === 'kamikaze') {
		this.hitPoints = 1;
		this.speedX = -5 - Math.random() * 4; // Muy rápidos
		this.mesh.position.x = 250 + Math.random() * 100;
		this.mesh.position.y = 150 + Math.random() * 50; 
		this.captive = null; 
	} else if (type === 'bomber') {
		this.hitPoints = 6; 
		this.speedX = -1.5 - Math.random() * 1; 
		this.mesh.position.x = 350 + Math.random() * 100;
		this.mesh.position.y = 100 + Math.random() * 100; 
		this.captive = null;
	} else {
		this.hitPoints = 3;
		this.speedX = -2.5 - Math.random() * 3;
		this.mesh.position.x = 350 + Math.random() * 100;
		this.mesh.position.y = 20 + Math.random() * 120;
		if (Math.random() < 0.3) {
			const types = ['cow', 'human', 'goat'];
			this.captive = new Captive(types[Math.floor(Math.random() * types.length)]);
			this.captive.mesh.position.y = -8;
			this.mesh.add(this.captive.mesh);
		} else {
			this.captive = null;
		}
	}
	
	this.lastShotTime = 0;
};

Ufo.prototype.update = function(time, planeY) {
	this.mesh.position.x += this.speedX;
	
	if (this.type === 'kamikaze') {
		// Persigue la Y del avión
		if (planeY !== undefined) {
			if (this.mesh.position.y > planeY) this.mesh.position.y -= 1.5;
			else if (this.mesh.position.y < planeY) this.mesh.position.y += 1.5;
		}
		this.mesh.rotation.z = -0.2; // Inclinados hacia adelante
	} else {
		// Movimiento oscilante (Hover)
		this.angle += 0.05;
		this.mesh.position.y += Math.sin(this.angle) * 0.5;
	}
	
	// Rotación sobre sí mismo (solo las partes mecánicas)
	this.rotatableParts.rotation.y += 0.05;
	
	// Humour: Animar la antenita del alien para que parezca que tiembla con el viento
	if (this.antennaBase) {
		this.antennaBase.rotation.z = Math.sin(time * 0.01) * 0.2;
		this.antennaBulb.scale.setScalar(1 + Math.sin(time * 0.02) * 0.2);
	}
	
	// Desactivar si sale de pantalla
	if (this.mesh.position.x < -150) {
		this.active = false;
	}
};

export const EnemyManager = function(scene) {
	this.scene = scene;
	this.ufos = [];
	this.lasers = [];
	this.bombs = []; // Add bombs
	this.fallingCaptives = [];
	this.spawnTimer = 0;
	
	// Sistema Director de Combate (AI Pacing)
	this.combatState = 'intro'; // 'calm', 'intro', 'intense'
	this.stateTimer = 0;
	this.stateDuration = 300; // frames iniciales
};

EnemyManager.prototype.shootLaser = function(ufo) {
	const laser = new AlienLaser(ufo.mesh.position.x - 10, ufo.mesh.position.y, ufo.mesh.position.z);
	this.scene.add(laser.mesh);
	this.lasers.push(laser);
};

EnemyManager.prototype.shootBossLaser = function(x, y, z, vx, vy) {
	const laser = new AlienLaser(x, y, z, vx, vy);
	this.scene.add(laser.mesh);
	this.lasers.push(laser);
};

EnemyManager.prototype.dropBomb = function(ufo) {
	const bomb = new AlienBomb(ufo.mesh.position.x, ufo.mesh.position.y - 10, ufo.mesh.position.z);
	this.scene.add(bomb.mesh);
	this.bombs.push(bomb);
};

EnemyManager.prototype.dropBossBomb = function(x, y, z) {
	const bomb = new AlienBomb(x, y, z);
	this.scene.add(bomb.mesh);
	this.bombs.push(bomb);
};

EnemyManager.prototype.spawnUfo = function(level = 1) {
	let type = 'basic';
	if (level >= 2 && Math.random() < 0.3) type = 'kamikaze';
	if (level >= 3 && Math.random() < 0.2) type = 'bomber';
	
	const ufo = new Ufo(type);
	this.scene.add(ufo.mesh);
	this.ufos.push(ufo);
};


EnemyManager.prototype.update = function(time, planeY, currentLevel, onShootLaser) {
	this.spawnTimer++;
	this.stateTimer++;
	
	// Máquina de estados del ritmo de combate
	if (this.stateTimer > this.stateDuration) {
		this.stateTimer = 0;
		if (this.combatState === 'calm') {
			this.combatState = 'intro';
			this.stateDuration = 180 + Math.random() * 180; // 3 a 6 segundos de calentamiento
		} else if (this.combatState === 'intro') {
			this.combatState = 'intense';
			this.stateDuration = 400 + Math.random() * 400; // 6 a 13 segundos de combate feroz
		} else { // intense
			this.combatState = 'calm';
			this.stateDuration = 180 + Math.random() * 180; // 3 a 6 segundos de respiro
		}
	}
	
	let baseRate = 65;
	let spawnProb = 0.2; 
	
	// Ajustar la dificultad según el estado del Director
	if (this.combatState === 'calm') {
		baseRate = 120; // Aparición muy lenta
		spawnProb = 0.8; // Solo 20% de probabilidad real (casi nulo)
	} else if (this.combatState === 'intro') {
		baseRate = 70; // Ritmo normal
		spawnProb = 0.5; // 50% de probabilidad
	} else if (this.combatState === 'intense') {
		baseRate = 35; // Lluvia de naves
		spawnProb = 0.1; // 90% de probabilidad
	}

	const spawnRate = Math.max(15, baseRate - (currentLevel * 10)); 
	
	if (this.spawnTimer > spawnRate) { 
		this.spawnTimer = 0;
		if (Math.random() > spawnProb) {
			this.spawnUfo(currentLevel);
		}
	}
	
	// Actualizar UFOs
	for (let i = this.ufos.length - 1; i >= 0; i--) {
		const ufo = this.ufos[i];
		ufo.update(time, planeY);
		
		if (ufo.type === 'basic') {
			if (time - ufo.lastShotTime > 1000) {
				if (Math.random() < 0.04 * currentLevel) {
					this.shootLaser(ufo);
					if (onShootLaser) onShootLaser();
					ufo.lastShotTime = time;
				}
			}
		} else if (ufo.type === 'bomber') {
			if (time - ufo.lastShotTime > 2000) { // Tira bombas
				if (Math.random() < 0.05) {
					this.dropBomb(ufo);
					ufo.lastShotTime = time;
				}
			}
		}
		
		if (!ufo.active) {
			this.scene.remove(ufo.mesh);
			this.ufos.splice(i, 1);
		}
	}
	
	// Actualizar Láseres
	for (let i = this.lasers.length - 1; i >= 0; i--) {
		const laser = this.lasers[i];
		laser.update();
		if (!laser.active) {
			this.scene.remove(laser.mesh);
			this.lasers.splice(i, 1);
		}
	}

	// Actualizar Bombas
	for (let i = this.bombs.length - 1; i >= 0; i--) {
		const bomb = this.bombs[i];
		bomb.update();
		if (!bomb.active) {
			this.scene.remove(bomb.mesh);
			this.bombs.splice(i, 1);
		}
	}
	
	// Actualizar Cautivos cayendo
	for (let i = this.fallingCaptives.length - 1; i >= 0; i--) {
		const cap = this.fallingCaptives[i];
		cap.update();
		if (!cap.active) {
			this.scene.remove(cap.mesh);
			this.fallingCaptives.splice(i, 1);
		}
	}
};

EnemyManager.prototype.releaseCaptive = function(ufo) {
	if (ufo.captive) {
		const cap = ufo.captive;
		// Quitar del UFO y añadir a la escena con la posición global
		ufo.mesh.remove(cap.mesh);
		const globalPos = new THREE.Vector3();
		ufo.mesh.getWorldPosition(globalPos);
		cap.mesh.position.copy(globalPos);
		cap.mesh.position.y -= 8;
		
		this.scene.add(cap.mesh);
		this.fallingCaptives.push(cap);
		cap.drop();
		return true; // Rescate iniciado
	}
	return false;
};

EnemyManager.prototype.reset = function() {
	for (let ufo of this.ufos) this.scene.remove(ufo.mesh);
	for (let laser of this.lasers) this.scene.remove(laser.mesh);
	for (let bomb of this.bombs) this.scene.remove(bomb.mesh);
	for (let cap of this.fallingCaptives) this.scene.remove(cap.mesh);
	
	this.ufos = [];
	this.lasers = [];
	this.bombs = [];
	this.fallingCaptives = [];
	this.spawnTimer = 0;
	this.combatState = 'intro';
	this.stateTimer = 0;
};
