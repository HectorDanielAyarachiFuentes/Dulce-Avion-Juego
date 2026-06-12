import { Colors } from '../utils/colors.js';

export const SmokeParticle = function(x, y, z) {
	this.mesh = new THREE.Mesh(
		new THREE.BoxGeometry(3, 3, 3),
		new THREE.MeshBasicMaterial({ color: Colors.grey, transparent: true, opacity: 0.6 })
	);
	// Spawn with a slight random offset
	this.mesh.position.set(
		x + (Math.random() - 0.5) * 4,
		y + (Math.random() - 0.5) * 4,
		z + (Math.random() - 0.5) * 4
	);
	this.mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
	this.scale = 1;
	this.life = 1.0;
};

SmokeParticle.prototype.update = function() {
	this.scale += 0.3; // Grow larger
	this.mesh.scale.set(this.scale, this.scale, this.scale);
	this.life -= 0.03; // Fade out
	this.mesh.material.opacity = this.life;
	this.mesh.position.x -= 2; // Drift backwards
	this.mesh.position.y += 0.5; // Drift upwards slightly
	this.mesh.rotation.z += 0.05;
};

export const ContrailParticle = function(x, y, z) {
	this.mesh = new THREE.Mesh(
		new THREE.BoxGeometry(0.8, 0.8, 0.8), // Más pequeño
		new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 }) // Más transparente
	);
	this.mesh.position.set(x, y, z);
	this.mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
	this.scale = 1;
	this.life = 1.0;
};

ContrailParticle.prototype.update = function() {
	this.scale += 0.02; // Se expande muy sutilmente
	this.mesh.scale.set(this.scale, this.scale, this.scale);
	this.life -= 0.06; // Se desvanece un poco más rápido
	this.mesh.material.opacity = this.life;
	this.mesh.position.x -= 4; // Viento hacia atrás rápido
	this.mesh.position.y += (Math.random() - 0.5) * 0.2; // Turbulencia más suave
};

export const MuzzleSmokeParticle = function(x, y, z) {
	this.mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1.5, 1.5, 1.5),
		new THREE.MeshBasicMaterial({ color: Colors.grey, transparent: true, opacity: 0.5 })
	);
	this.mesh.position.set(
		x + (Math.random() - 0.5) * 2,
		y + (Math.random() - 0.5) * 2,
		z + (Math.random() - 0.5) * 2
	);
	this.mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
	this.scale = 1;
	this.life = 1.0;
};

MuzzleSmokeParticle.prototype.update = function() {
	this.scale += 0.15; // Grow slightly
	this.mesh.scale.set(this.scale, this.scale, this.scale);
	this.life -= 0.08; // Fade out fast
	this.mesh.material.opacity = this.life;
	this.mesh.position.x -= 3; // Drift backwards with the wind
	this.mesh.position.y += 0.2; // Drift upwards slightly
	this.mesh.rotation.z += 0.05;
};

export const SparkParticle = function(x, y, z) {
	this.mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1.5, 1.5, 1.5),
		new THREE.MeshBasicMaterial({ color: Colors.yellow, transparent: true, opacity: 1.0 })
	);
	this.mesh.position.set(
		x + (Math.random() - 0.5) * 2,
		y + (Math.random() - 0.5) * 2,
		z + (Math.random() - 0.5) * 2
	);
	this.scale = 1;
	this.life = 1.0;
};

SparkParticle.prototype.update = function() {
	this.scale *= 0.8; // Shrink quickly
	this.mesh.scale.set(this.scale, this.scale, this.scale);
	this.life -= 0.15; // Fade out very fast
	this.mesh.material.opacity = this.life;
	this.mesh.position.x -= 10; // Fast drift backwards
};

export const MissileProjectile = function(x, y, z) {
	this.mesh = new THREE.Object3D();
	
	const geom = new THREE.CylinderGeometry(2, 2, 15, 6);
	geom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
	
	const tipGeom = new THREE.ConeGeometry(2, 5, 6);
	tipGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
	tipGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(10, 0, 0));
	
	const mat = new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true });
	const tipMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
	
	const body = new THREE.Mesh(geom, mat);
	const tip = new THREE.Mesh(tipGeom, tipMat);
	
	this.mesh.add(body);
	this.mesh.add(tip);
	
	// Fire flash/trail
	const flashGeom = new THREE.ConeGeometry(3, 10, 6);
	flashGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
	flashGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-12, 0, 0));
	const flashMat = new THREE.MeshBasicMaterial({ color: 0xFFA500 }); // Naranja
	this.flash = new THREE.Mesh(flashGeom, flashMat);
	this.mesh.add(this.flash);
	
	this.mesh.position.set(x, y, z);
	
	this.speed = 6; // Velocidad reducida para apreciar la estela
	this.active = true;
};

MissileProjectile.prototype.update = function() {
	this.mesh.position.x += this.speed;
	// Efecto de parpadeo de fuego
	const s = 0.5 + Math.random() * 0.8;
	this.flash.scale.set(s, s, s);
};

export const MachineGunProjectile = function(x, y, z) {
	this.mesh = new THREE.Object3D();
	
	const geom = new THREE.BoxGeometry(10, 2, 2);
	const mat = new THREE.MeshBasicMaterial({ color: Colors.yellow });
	
	const body = new THREE.Mesh(geom, mat);
	this.mesh.add(body);
	
	this.mesh.position.set(x, y, z);
	
	this.speed = 30; // Más veloz
	this.active = true;
};

MachineGunProjectile.prototype.update = function() {
	this.mesh.position.x += this.speed;
};

export const WeaponManager = function(scene) {
	this.scene = scene;
	this.projectiles = [];
	this.particles = [];
	
	this.fireMissile = function(x, y, z) {
		const p = new MissileProjectile(x, y, z);
		this.scene.add(p.mesh);
		this.projectiles.push(p);
	};
	
	this.fireMachineGun = function(x, y, z) {
		const p = new MachineGunProjectile(x, y, z);
		this.scene.add(p.mesh);
		this.projectiles.push(p);
	};
	
	this.spawnSmoke = function(x, y, z) {
		const s = new SmokeParticle(x, y, z);
		this.scene.add(s.mesh);
		this.particles.push(s);
	};
	
	this.spawnSpark = function(x, y, z) {
		const s = new SparkParticle(x, y, z);
		this.scene.add(s.mesh);
		this.particles.push(s);
	};
	
	this.spawnMuzzleSmoke = function(x, y, z) {
		const s = new MuzzleSmokeParticle(x, y, z);
		this.scene.add(s.mesh);
		this.particles.push(s);
	};
	
	this.spawnContrail = function(x, y, z) {
		const s = new ContrailParticle(x, y, z);
		this.scene.add(s.mesh);
		this.particles.push(s);
	};
	
	this.update = function() {
		// Update Projectiles
		for(let i=this.projectiles.length-1; i>=0; i--) {
			const p = this.projectiles[i];
			p.update(); // Cada proyectil maneja su propio avance
			
			// Si es un misil, soltar humo
			if (p instanceof MissileProjectile) {
				// Soltar partículas de humo detrás del misil
				if (Math.random() > 0.2) {
					this.spawnSmoke(p.mesh.position.x - 15, p.mesh.position.y, p.mesh.position.z);
				}
			} else if (p instanceof MachineGunProjectile) {
				// Soltar chispas brillantes detrás de las balas
				if (Math.random() > 0.4) {
					this.spawnSpark(p.mesh.position.x - 5, p.mesh.position.y, p.mesh.position.z);
				}
			}
			
			// Remove if it goes too far
			if (p.mesh.position.x > 1500) {
				this.scene.remove(p.mesh);
				this.projectiles.splice(i, 1);
			}
		}

		// Update Smoke Particles
		for(let i=this.particles.length-1; i>=0; i--) {
			const s = this.particles[i];
			s.update();
			
			if (s.life <= 0) {
				this.scene.remove(s.mesh);
				this.particles.splice(i, 1);
			}
		}
	};
};
