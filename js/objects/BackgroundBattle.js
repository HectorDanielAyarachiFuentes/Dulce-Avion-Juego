import * as THREE from '../../libs/three.module.min.js';
import { Colors } from '../utils/colors.js';

export const BackgroundBattle = function(scene) {
	this.scene = scene;
	this.fighters = [];
	this.lasers = [];
	
	this.active = true;
	this.mesh = new THREE.Group();
	this.scene.add(this.mesh);
	
	// Create small fighters
	for (let i = 0; i < 20; i++) {
		const isAlien = Math.random() > 0.5;
		const geom = new THREE.TetrahedronGeometry(isAlien ? 20 : 15);
		const mat = new THREE.MeshBasicMaterial({ color: isAlien ? 0x222222 : Colors.white, fog: false });
		const mesh = new THREE.Mesh(geom, mat);
		
		// Spawn them around the mothership
		mesh.position.set(
			-800 + (Math.random() - 0.5) * 2000,
			800 + (Math.random() - 0.5) * 1000,
			-5000 + (Math.random() - 0.5) * 1000
		);
		
		this.mesh.add(mesh);
		this.fighters.push({
			mesh: mesh,
			isAlien: isAlien,
			targetOffset: new THREE.Vector3(),
			angle: Math.random() * Math.PI * 2,
			speed: 5 + Math.random() * 5
		});
	}

	// Nuclear Explosion Mesh (hidden initially)
	this.nukeMesh = new THREE.Object3D();
	
	const nukeSphereGeom = new THREE.SphereGeometry(1, 32, 32);
	this.nukeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false });
	this.nukeSphere = new THREE.Mesh(nukeSphereGeom, this.nukeMat);
	this.nukeMesh.add(this.nukeSphere);
	
	const ringGeom = new THREE.TorusGeometry(1, 0.2, 16, 64);
	this.ringMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0, fog: false });
	this.nukeRing = new THREE.Mesh(ringGeom, this.ringMat);
	this.nukeRing.rotation.x = Math.PI / 2;
	this.nukeMesh.add(this.nukeRing);
	
	this.nukeMesh.position.set(-500, 400, -5000);
	this.mesh.add(this.nukeMesh);
	
	this.nukeActive = false;
	this.nukeTimer = 0;
};

BackgroundBattle.prototype.triggerNuke = function(level = 1) {
	if (this.nukeActive) return;
	this.nukeActive = true;
	this.nukeTimer = 0;
	
	const targetZ = -6000 + (level * 1000); // Same depth progression as Mothership
	
	// Random position in the background
	this.nukeMesh.position.set(
		-1000 + (Math.random() - 0.5) * 2000,
		500 + Math.random() * 500,
		targetZ + (Math.random() - 0.5) * 1000
	);
	
	this.nukeSphere.scale.set(1, 1, 1);
	this.nukeRing.scale.set(1, 1, 1);
};

BackgroundBattle.prototype.update = function(time, ambientLight, level = 1) {
	const targetZ = -6000 + (level * 1000);

	// Update fighters
	for (let i = 0; i < this.fighters.length; i++) {
		const f = this.fighters[i];
		f.angle += 0.02 * (f.isAlien ? 1 : -1);
		
		// Swarm movement
		const cx = -800 + Math.cos(time * 0.0005 + i) * 1000;
		const cy = 800 + Math.sin(time * 0.0007 + i) * 500;
		const cz = targetZ; // Center of the swarm follows the level's depth
		
		f.mesh.position.x += (cx + Math.cos(f.angle)*200 - f.mesh.position.x) * 0.01;
		f.mesh.position.y += (cy + Math.sin(f.angle)*200 - f.mesh.position.y) * 0.01;
		f.mesh.position.z += (cz + Math.sin(f.angle)*200 - f.mesh.position.z) * 0.01;
		
		// Randomly shoot lasers
		if (Math.random() < 0.01) {
			const lGeom = new THREE.BoxGeometry(40, 2, 2);
			const lMat = new THREE.MeshBasicMaterial({ color: f.isAlien ? 0x00ff00 : 0xff0000, fog: false });
			const laser = new THREE.Mesh(lGeom, lMat);
			laser.position.copy(f.mesh.position);
			laser.rotation.z = Math.random() * Math.PI * 2;
			laser.rotation.y = Math.random() * Math.PI * 2;
			
			this.mesh.add(laser);
			this.lasers.push({ mesh: laser, life: 60 });
		}
	}
	
	// Update lasers
	for (let i = this.lasers.length - 1; i >= 0; i--) {
		const l = this.lasers[i];
		l.mesh.translateX(20);
		l.life--;
		if (l.life <= 0) {
			this.mesh.remove(l.mesh);
			this.lasers.splice(i, 1);
		}
	}
	
	// Update Nuke
	if (this.nukeActive) {
		this.nukeTimer++;
		
		if (this.nukeTimer < 20) {
			// Initial flash
			this.nukeMat.opacity = 1;
			this.ringMat.opacity = 0;
			this.nukeSphere.scale.addScalar(20);
			ambientLight.intensity = 1.0 + (this.nukeTimer / 20) * 15.0; // Flash!
		} else if (this.nukeTimer < 100) {
			// Expansion and fade
			this.nukeSphere.scale.addScalar(5);
			this.nukeMat.opacity = 1 - (this.nukeTimer - 20) / 80;
			
			// Ring expansion
			this.ringMat.opacity = 1 - (this.nukeTimer - 20) / 80;
			this.nukeRing.scale.addScalar(30);
			
			// Light fade back to normal
			ambientLight.intensity = 1.0 + (1 - (this.nukeTimer - 20) / 80) * 15.0;
		} else {
			this.nukeActive = false;
			this.nukeMat.opacity = 0;
			this.ringMat.opacity = 0;
			ambientLight.intensity = 1.0; // Ensure it resets
		}
	}
};
