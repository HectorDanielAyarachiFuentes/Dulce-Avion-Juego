import * as THREE from '../../libs/three.module.min.js';
import { Colors } from '../utils/colors.js';

export const Mothership = function() {
	this.mesh = new THREE.Object3D();
	
	// Plato principal (Saucer)
	const saucerGeom = new THREE.CylinderGeometry(200, 200, 40, 32);
	saucerGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0));
	const saucerMat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true, fog: false });
	const saucer = new THREE.Mesh(saucerGeom, saucerMat);
	
	// Cúpula superior
	const domeGeom = new THREE.SphereGeometry(100, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
	const domeMat = new THREE.MeshPhongMaterial({ color: 0x222222, flatShading: true, fog: false });
	const dome = new THREE.Mesh(domeGeom, domeMat);
	dome.position.y = 20;
	
	// Anillo de luces
	const ringGeom = new THREE.TorusGeometry(205, 5, 8, 32);
	const ringMat = new THREE.MeshBasicMaterial({ color: Colors.green, fog: false });
	this.ring = new THREE.Mesh(ringGeom, ringMat);
	this.ring.rotation.x = Math.PI / 2;
	
	// Propulsor inferior
	const engineGeom = new THREE.CylinderGeometry(80, 50, 40, 16);
	const engineMat = new THREE.MeshPhongMaterial({ color: 0x050505, flatShading: true, fog: false });
	const engine = new THREE.Mesh(engineGeom, engineMat);
	engine.position.y = -30;
	
	// Luz del motor inferior
	const engineLightGeom = new THREE.CylinderGeometry(70, 40, 42, 16);
	const engineLightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6, fog: false });
	this.engineLight = new THREE.Mesh(engineLightGeom, engineLightMat);
	this.engineLight.position.y = -30;

	this.mesh.add(saucer);
	this.mesh.add(dome);
	this.mesh.add(this.ring);
	this.mesh.add(engine);
	this.mesh.add(this.engineLight);
	
	// Scale massive but fits on screen
	this.mesh.scale.set(1.5, 1.5, 1.5);
	
	// Posición distante en el fondo
	this.mesh.position.set(-800, 800, -6000); // Start very far away
	
	// Tilt ominoso
	this.mesh.rotation.x = 0.2;
	this.mesh.rotation.z = -0.1;
	
	// Boss Mechanics
	this.health = 1500;
	this.maxHealth = 1500;
	this.state = "creeping"; // creeping, intro, combat, dead
	this.introTimer = 0;
	this.combatPhase = 0;
	this.attackTimer = 0;
	this.attackState = "idle"; // idle, sweeping, swarming, deathray
	
	// Death Ray Mesh (ahora apunta a la izquierda, hacia el jugador)
	const rayGeom = new THREE.CylinderGeometry(50, 50, 2000, 32);
	rayGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2)); // Girar para que dispare en X
	rayGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-1000, 0, 0)); // Mover el centro del rayo
	this.rayMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0, fog: false });
	this.deathRay = new THREE.Mesh(rayGeom, this.rayMat);
	this.deathRay.position.x = -50;
	this.mesh.add(this.deathRay);
	
	// Hitbox for collisions (radius 200 * 1.5 = 300)
	this.hitboxRadiusSq = (300) * (300); 
};

Mothership.prototype.startBossFight = function() {
	if (this.state !== "creeping") return;
	this.state = "intro";
	this.introTimer = 0;
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
		// Acelera hacia el lado derecho de la pantalla
		this.mesh.position.x += (250 - this.mesh.position.x) * 0.05; 
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
			this.health = this.maxHealth;
		}
	}
	else if (this.state === "combat") {
		this.attackTimer++;
		// Movimiento vertical de jefe clásico
		this.mesh.position.y = 100 + Math.sin(time * 0.002) * 80;
		this.mesh.position.x = 250 + Math.sin(time * 0.001) * 30; // Hover leve en X
		
		// Mantenerlo inclinado ominosamente
		this.mesh.rotation.z = -0.2;
		this.mesh.rotation.x = 0.2;
		
		// Determinar fase según la vida
		if (this.health > 1000) this.combatPhase = 1;
		else if (this.health > 500) this.combatPhase = 2;
		else this.combatPhase = 3;
		
		// Comportamiento de ataques
		if (this.attackState === "idle") {
			this.mesh.rotation.x *= 0.95;
			this.ring.rotation.z -= 0.02;
			this.rayMat.opacity = 0;
			
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
			// Carga y dispara el Rayo de la Muerte
			if (this.attackTimer < 100) {
				// Carga: anillo gira brutalmente, luz roja
				this.ring.rotation.z -= 0.1;
				this.engineLight.material.color.setHex(0xff0000);
				pulse = this.attackTimer / 100;
			} else if (this.attackTimer < 250) {
				// Disparo
				this.rayMat.opacity = 0.8 + Math.random() * 0.2;
				this.engineLight.material.color.setHex(0xffffff);
				pulse = 1.0;
				// El rayo barre ligeramente moviendo el angulo
				this.mesh.rotation.z = -0.2 + Math.sin(this.attackTimer * 0.05) * 0.1;
			} else {
				// Recuperación
				this.rayMat.opacity = 0;
				this.engineLight.material.color.setHex(0x00ff00);
				this.attackState = "idle";
				this.attackTimer = -100; // Cooldown largo después del rayo
			}
		}
	}
	else if (this.state === "dead") {
		this.mesh.position.y -= 2; // Cae al vacío
		this.mesh.rotation.x += 0.01;
		this.mesh.rotation.z += 0.02;
		this.rayMat.opacity = 0;
		pulse = Math.random() > 0.5 ? 1 : 0; // Parpadeo roto
	}
	
	if (this.state !== "dead") {
		this.engineLight.material.opacity = pulse;
		// El anillo verde parpadea como patrón de luces (si no está cargando el rayo)
		if (this.attackState !== "deathray") {
			this.ring.rotation.z -= 0.005;
		}
	}
};
