import * as THREE from '../../libs/three.module.min.js';
import { Colors } from '../utils/colors.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const Mothership = function() {
	this.mesh = new THREE.Object3D();
	
	// Modelo 3D del platillo
	this.saucerModel = new THREE.Object3D();
	this.mesh.add(this.saucerModel);
	
	const loader = new GLTFLoader();
	loader.load('assets/models/Flying saucer.glb', (gltf) => {
		const model = gltf.scene;
		
		// Auto escalar a ~180 de ancho para que no ocupe toda la pantalla
		const box = new THREE.Box3().setFromObject(model);
		const size = new THREE.Vector3();
		box.getSize(size);
		const maxDim = Math.max(size.x, size.z);
		const scale = 180 / maxDim;
		model.scale.setScalar(scale);
		
		model.traverse((child) => {
			if (child.isMesh) {
				child.material.flatShading = true;
			}
		});
		
		this.saucerModel.add(model);
	});
	
	// Objetos dummy para evitar crashes en el update() (el viejo platillo los usaba)
	this.ring = new THREE.Object3D(); 
	this.portholes = [];
	this.antennaBulb = null;
	
	// Luz del motor inferior (para animaciones del rayo de la muerte)
	const engineLightGeom = new THREE.CylinderGeometry(70, 40, 42, 16);
	const engineLightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6, fog: false });
	this.engineLight = new THREE.Mesh(engineLightGeom, engineLightMat);
	this.engineLight.position.y = -30;
	this.engineLight.visible = false; // Lo ocultamos para que no tape el modelo
	this.mesh.add(this.engineLight);
	
	// Scale massive but fits on screen better
	this.mesh.scale.set(1.2, 1.2, 1.2);
	
	// Posición distante en el fondo
	this.mesh.position.set(-800, 800, -6000); // Start very far away
	
	// Tilt ominoso
	this.mesh.rotation.x = 0.2;
	this.mesh.rotation.z = -0.1;
	
	// Boss Mechanics
	this.health = 5000;
	this.maxHealth = 5000;
	this.state = "creeping"; // creeping, intro, combat, dead
	this.introTimer = 0;
	this.combatPhase = 0;
	this.attackTimer = 0;
	this.attackState = "idle"; // idle, sweeping, swarming, deathray
	
	// Hitbox for collisions 
	this.hitboxRadiusSq = (120) * (120); 
};

Mothership.prototype.startBossFight = function(skipIntro = false) {
	if (this.state === "combat" || this.state === "dead") return;
	if (skipIntro) {
		// Saltar la animación de intro e ir directo al combate
		this.state = "combat";
		this.attackState = "idle";
		this.attackTimer = 0;
		this.mesh.position.set(150, 100, -50);
		this.mesh.rotation.z = -0.2;
		this.mesh.rotation.x = 0.2;
	} else {
		this.state = "intro";
		this.introTimer = 0;
	}
};

Mothership.prototype.update = function(time, level = 1, enemyManager = null) {
	let pulse = 0.6 + Math.sin(time * 0.005) * 0.4;
	
	if (this.state === "creeping") {
		// Acercarse según el nivel (L1 a L3)
		const targetZ = -6000 + (level * 1000); 
		this.mesh.position.z += (targetZ - this.mesh.position.z) * 0.01;
		this.mesh.position.y = 800 + Math.sin(time * 0.0005) * 50;
		this.mesh.rotation.y += 0.001;
	} 
	else if (this.state === "intro") {
		this.introTimer++;
		// Acelera hacia el lado derecho de la pantalla (más lejos)
		this.mesh.position.x += (150 - this.mesh.position.x) * 0.05; 
		this.mesh.position.y += (100 - this.mesh.position.y) * 0.05; 
		this.mesh.position.z += (-50 - this.mesh.position.z) * 0.05;
		
		// Gira la nave para que se vea ligeramente de frente e inclinada hacia el jugador
		this.mesh.rotation.z += (-0.2 - this.mesh.rotation.z) * 0.05;
		this.mesh.rotation.x += (0.2 - this.mesh.rotation.x) * 0.05; 
		
		// El anillo gira más rápido
		this.ring.rotation.z -= 0.02;
		
		if (this.introTimer > 150) {
			this.state = "combat";
			this.attackState = "idle";
			this.attackTimer = 0;
		}
	}
	else if (this.state === "combat") {
		this.attackTimer++;
		// Movimiento vertical de jefe clásico
		this.mesh.position.y = 100 + Math.sin(time * 0.002) * 80;
		this.mesh.position.x = 150 + Math.sin(time * 0.001) * 30; // Hover leve en X
		
		// Mantenerlo inclinado ominosamente
		this.mesh.rotation.z = -0.2;
		this.mesh.rotation.x = 0.2;
		
		// Determinar fase según la vida
		if (this.health > 1000) this.combatPhase = 1;
		else if (this.health > 500) this.combatPhase = 2;
		else this.combatPhase = 3;
		
		// Comportamiento de ataques
		// Animaciones constantes de los detalles
		if (this.antennaBulb) {
			this.antennaBulb.material.color.setHSL((time * 0.001) % 1, 1, 0.5);
			this.antennaBulb.scale.setScalar(1 + Math.sin(time * 0.01) * 0.2);
		}
		for (let i = 0; i < this.portholes.length; i++) {
			this.portholes[i].material.color.setHSL((time * 0.0005 + i * 0.1) % 1, 0.8, 0.5);
		}
		
		if (this.attackState === "idle") {
			this.mesh.rotation.x *= 0.95;
			
			if (this.attackTimer > 100) {
				this.attackTimer = 0;
				if (this.combatPhase === 1) this.attackState = "sweeping";
				else if (this.combatPhase === 2) this.attackState = Math.random() > 0.5 ? "sweeping" : "swarming";
				else this.attackState = "deathray";
			}
		} 
		else if (this.attackState === "sweeping") {
			// Simular un barrido inclinando la nave un poco más
			this.mesh.rotation.z = -0.2 + Math.sin(this.attackTimer * 0.05) * 0.2;
			pulse = 1.0;
			
			// Disparar laseres constantemente
			if (enemyManager && this.attackTimer % 10 === 0) {
				const lx = this.mesh.position.x - 100;
				const ly = this.mesh.position.y + (Math.random() - 0.5) * 150;
				enemyManager.shootBossLaser(lx, ly, this.mesh.position.z, -10 - Math.random() * 5, 0);
			}
			
			if (this.attackTimer > 200) {
				this.attackState = "idle";
				this.attackTimer = 0;
			}
		}
		else if (this.attackState === "swarming") {
			// Brilla intermitentemente para "invocar"
			pulse = (this.attackTimer % 10 < 5) ? 1.0 : 0.2;
			
			// Tirar bombas hacia adelante (izquierda)
			if (enemyManager && this.attackTimer % 30 === 0) {
				const bx = this.mesh.position.x - 100;
				const by = this.mesh.position.y + (Math.random() - 0.5) * 200;
				enemyManager.dropBossBomb(bx, by, this.mesh.position.z);
			}
			
			if (this.attackTimer > 100) {
				this.attackState = "idle";
				this.attackTimer = 0;
			}
		}
		else if (this.attackState === "deathray") {
			// Cambiado de un rayo a una ráfaga (barrage) de lásers hacia el jugador
			if (this.attackTimer < 80) {
				// Carga: luz roja intensa
				this.engineLight.material.color.setHex(0xff0000);
				pulse = this.attackTimer / 80;
			} else if (this.attackTimer < 200) {
				// Disparo múltiple en abanico
				this.engineLight.material.color.setHex(0xffaa00);
				pulse = 1.0;
				
				if (enemyManager && this.attackTimer % 8 === 0) {
					const bx = this.mesh.position.x - 50;
					const by = this.mesh.position.y;
					
					// Disparos en abanico vertical hacia el jugador
					const angleY = (Math.random() - 0.5) * 8; 
					enemyManager.shootBossLaser(bx, by, this.mesh.position.z, -18, angleY);
				}
				
				// El platillo se sacude mientras dispara
				this.mesh.rotation.z = -0.2 + Math.sin(this.attackTimer * 0.5) * 0.05;
			} else {
				// Recuperación
				this.engineLight.material.color.setHex(0x00ff00);
				this.attackState = "idle";
				this.attackTimer = -50; 
			}
		}
	}
	else if (this.state === "dead") {
		this.mesh.position.y -= 2; // Cae al vacío
		this.mesh.rotation.x += 0.01;
		this.mesh.rotation.z += 0.02;
		pulse = Math.random() > 0.5 ? 1 : 0; // Parpadeo roto
	}
	
	if (this.state !== "dead") {
		this.engineLight.material.opacity = pulse;
		// El anillo verde parpadea como patrón de luces (si no está cargando el rayo)
		if (this.attackState !== "deathray") {
			this.ring.rotation.z -= 0.005;
		}
		
		// Hace que el platillo gire constantemente sobre su eje
		if (this.saucerModel) {
			this.saucerModel.rotation.y -= 0.03;
		}
	}
};

Mothership.prototype.reset = function() {
	this.health = 5000;
	this.maxHealth = 5000;
	this.state = "creeping";
	this.introTimer = 0;
	this.combatPhase = 0;
	this.attackTimer = 0;
	this.attackState = "idle";
	
	this.mesh.position.set(-800, 800, -6000);
	this.mesh.rotation.set(0.2, 0, -0.1);
};
