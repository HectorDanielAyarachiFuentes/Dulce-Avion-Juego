import { Colors } from '../utils/colors.js';

export const Projectile = function(x, y, z) {
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
	
	this.mesh.position.set(x, y, z);
	
	this.speed = 15;
};

export const WeaponManager = function(scene) {
	this.scene = scene;
	this.projectiles = [];
	
	this.fire = function(x, y, z) {
		const p = new Projectile(x, y, z);
		this.scene.add(p.mesh);
		this.projectiles.push(p);
	};
	
	this.update = function() {
		for(let i=this.projectiles.length-1; i>=0; i--) {
			const p = this.projectiles[i];
			p.mesh.position.x += p.speed;
			
			// Remove if it goes too far
			if (p.mesh.position.x > 1500) {
				this.scene.remove(p.mesh);
				this.projectiles.splice(i, 1);
			}
		}
	};
};
