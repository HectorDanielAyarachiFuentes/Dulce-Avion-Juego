import { Colors } from '../utils/colors.js';

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
};

MachineGunProjectile.prototype.update = function() {
	this.mesh.position.x += this.speed;
};

export const WeaponManager = function(scene) {
	this.scene = scene;
	this.projectiles = [];
	
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
	
	this.update = function() {
		for(let i=this.projectiles.length-1; i>=0; i--) {
			const p = this.projectiles[i];
			p.update(); // Cada proyectil maneja su propio avance
			
			// Remove if it goes too far
			if (p.mesh.position.x > 1500) {
				this.scene.remove(p.mesh);
				this.projectiles.splice(i, 1);
			}
		}
	};
};
