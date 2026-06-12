import { Colors } from '../utils/colors.js';

export const Mountain = function() {
	this.mesh = new THREE.Object3D();
	
	// Create a pyramid-like shape for a low-poly mountain
	const geom = new THREE.CylinderGeometry(0, 30, 60, 4, 1);
	const mat = new THREE.MeshPhongMaterial({
		color: Colors.brownDark,
		flatShading: true
	});
	
	const mesh = new THREE.Mesh(geom, mat);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	
	// Shift geometry so the origin is at the base of the mountain instead of the center
	geom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 30, 0));
	
	this.mesh.add(mesh);
};

export const Mountains = function() {
	this.mesh = new THREE.Object3D();
	this.nMountains = 40;
	
	const stepAngle = Math.PI * 2 / this.nMountains;
	
	for(let i=0; i<this.nMountains; i++) {
		const m = new Mountain();
		
		// Random angle around the giant cylinder
		const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
		
		// The sea radius is 3000, we sink them slightly (2980) so they don't float above the waves
		const h = 2980;
		
		m.mesh.position.y = Math.sin(a)*h;
		m.mesh.position.x = Math.cos(a)*h;
		
		// Point outwards from the cylinder
		m.mesh.rotation.z = a - Math.PI/2;
		
		// Scatter along the depth of the sea (width of cylinder is 1200)
		m.mesh.position.z = -500 + Math.random()*1000;
		
		const s = 1 + Math.random()*3;
		m.mesh.scale.set(s,s,s);
		
		this.mesh.add(m.mesh);
	}
};
