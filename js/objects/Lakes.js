import { Colors } from '../utils/colors.js';

export const Lake = function() {
	this.mesh = new THREE.Object3D();
	
	const geom = new THREE.CylinderGeometry(40, 40, 5, 8, 1);
	const mat = new THREE.MeshPhongMaterial({
		color: Colors.blue,
		flatShading: true,
		transparent: true,
		opacity: 0.8
	});
	
	const mesh = new THREE.Mesh(geom, mat);
	mesh.receiveShadow = true;
	
	this.mesh.add(mesh);
};

export const Lakes = function() {
	this.mesh = new THREE.Object3D();
	this.nLakes = 15;
	
	const stepAngle = Math.PI * 2 / this.nLakes;
	
	for(let i=0; i<this.nLakes; i++) {
		const l = new Lake();
		
		const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
		const h = 2998; // Ligeramente hundido en el suelo
		
		l.mesh.position.y = Math.sin(a)*h;
		l.mesh.position.x = Math.cos(a)*h;
		
		l.mesh.rotation.z = a - Math.PI/2;
		l.mesh.position.z = -400 + Math.random()*800;
		
		const s = 1 + Math.random()*2;
		l.mesh.scale.set(s, 1, s);
		
		this.mesh.add(l.mesh);
	}
};
