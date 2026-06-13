/**
 * AI SUMMARY: Generates grass details for the world surface.
 */
import { Colors } from '../utils/colors.js';

export const Blade = function() {
	this.mesh = new THREE.Object3D();
	
	// A thin triangle/cone for a blade of grass
	const geom = new THREE.CylinderGeometry(0, 2, 10, 3, 1);
	geom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 5, 0));
	
	const mat = new THREE.MeshPhongMaterial({
		color: Colors.greenDark,
		flatShading: true
	});
	
	const mesh = new THREE.Mesh(geom, mat);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	
	// Slight random rotation for natural look
	mesh.rotation.x = (Math.random() - 0.5) * 0.5;
	mesh.rotation.z = (Math.random() - 0.5) * 0.5;
	
	this.mesh.add(mesh);
};

export const Grass = function() {
	this.mesh = new THREE.Object3D();
	this.nBlades = 200; // Lots of grass
	
	const stepAngle = Math.PI * 2 / this.nBlades;
	const h = 2998;
	
	for(let i=0; i<this.nBlades; i++) {
		const blade = new Blade();
		
		const a = stepAngle*i + (Math.random() - 0.5) * 1.5;
		
		blade.mesh.position.y = Math.sin(a)*h;
		blade.mesh.position.x = Math.cos(a)*h;
		
		blade.mesh.rotation.z = a - Math.PI/2;
		blade.mesh.position.z = -500 + Math.random()*1000;
		
		const s = 0.5 + Math.random()*1.5;
		blade.mesh.scale.set(s, s, s);
		
		this.mesh.add(blade.mesh);
	}
};
