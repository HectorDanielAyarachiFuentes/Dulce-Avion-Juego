/**
 * AI SUMMARY: Defines the Sea/World base object (the rotating cylinder).
 */
import { Colors } from '../utils/colors.js';

export const Sea = function () {
	// Cilindro GIGANTE para simular un suelo plano e infinito (Mario style)
	let geom = new THREE.CylinderGeometry(3000, 3000, 4000, 80, 10);
	geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	geom = geom.toNonIndexed();

	const pos = geom.attributes.position;
	const l = pos.count;

	this.waves = [];
	this.uniqueWaves = {};

	for (let i = 0; i < l; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		const z = pos.getZ(i);
		const key = Math.round(x * 100) + '_' + Math.round(y * 100) + '_' + Math.round(z * 100);
        
		if (!this.uniqueWaves[key]) {
			this.uniqueWaves[key] = {
				y: y,
				x: x,
				z: z,
				ang: Math.random() * Math.PI * 2,
				amp: 5 + Math.random() * 15,
				speed: 0.016 + Math.random() * 0.032
			};
		}
		this.waves.push(this.uniqueWaves[key]);
	}

	let mat = new THREE.MeshPhongMaterial({
		color: Colors.green,
		transparent: true,
		opacity: .8,
		flatShading: true,
	});

	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;
};

Sea.prototype.moveWaves = function (){
	const pos = this.mesh.geometry.attributes.position;
	const l = pos.count;

	for (let i=0; i<l; i++){
		const vprops = this.waves[i];
		const v_x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
		const v_y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
        
		pos.setXY(i, v_x, v_y);
	}
    
	for (const key in this.uniqueWaves) {
		this.uniqueWaves[key].ang += this.uniqueWaves[key].speed;
	}

	this.mesh.geometry.attributes.position.needsUpdate = true;
};
