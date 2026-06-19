/**
 * AI SUMMARY: Generates lake/water scenery for the world.
 */
import { Colors } from '../utils/colors.js';

export const Lake = function() {
	this.mesh = new THREE.Object3D();
	
	// Agua
	const geom = new THREE.CylinderGeometry(40, 40, 20, 7, 1);
	const mat = new THREE.MeshPhongMaterial({
		color: 0x00d8ff, // Azul cian vibrante
		flatShading: true,
		transparent: true,
		opacity: 0.9,
		shininess: 90, // Alto brillo para simular agua
		specular: 0xffffff // Reflejo blanco del sol
	});
	
	const water = new THREE.Mesh(geom, mat);
	water.receiveShadow = true;
	this.mesh.add(water);
	
	// Borde de arena
	const borderGeom = new THREE.CylinderGeometry(48, 48, 20, 7, 1);
	const borderMat = new THREE.MeshPhongMaterial({
		color: 0xd4a373, // Color arena / tierra
		flatShading: true
	});
	const border = new THREE.Mesh(borderGeom, borderMat);
	border.position.y = -5; // Ligeramente por debajo del agua
	border.receiveShadow = true;
	this.mesh.add(border);
};

export const Lakes = function() {
	this.mesh = new THREE.Object3D();
	this.nLakes = 15;
	this.lakeData = [];
	
	const stepAngle = Math.PI * 2 / this.nLakes;
	
	for(let i=0; i<this.nLakes; i++) {
		const l = new Lake();
		
		const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
		const h = 3005; // Ligeramente más alto para evitar z-fighting y deformaciones por olas
		
		l.mesh.position.y = Math.sin(a)*h;
		l.mesh.position.x = Math.cos(a)*h;
		
		l.mesh.rotation.z = a - Math.PI/2;
		l.mesh.position.z = -400 + Math.random()*800;
		
		// Escala irregular para que no sean círculos perfectos
		const scaleX = 1 + Math.random() * 2;
		const scaleZ = 1 + Math.random() * 2;
		l.mesh.scale.set(scaleX, 1, scaleZ);
		
		this.mesh.add(l.mesh);
		
		this.lakeData.push({
			angle: a,
			z: l.mesh.position.z,
			radius: 45 * Math.max(scaleX, scaleZ)
		});
	}
};

Lakes.prototype.isInside = function(angle, z, margin = 20) {
	const r = 3000;
	const x1 = Math.cos(angle) * r;
	const y1 = Math.sin(angle) * r;
	
	for (let i = 0; i < this.lakeData.length; i++) {
		const lake = this.lakeData[i];
		const x2 = Math.cos(lake.angle) * r;
		const y2 = Math.sin(lake.angle) * r;
		
		const dx = x1 - x2;
		const dy = y1 - y2;
		const dz = z - lake.z;
		
		const distSq = dx*dx + dy*dy + dz*dz;
		const rad = lake.radius + margin;
		if (distSq < rad * rad) {
			return true;
		}
	}
	return false;
};
