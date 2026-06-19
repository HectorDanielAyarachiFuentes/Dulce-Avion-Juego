/**
 * AI SUMMARY: Generates procedural low-poly rock scenery for the world.
 * OPTIMIZADO EXTREMO: Usa THREE.InstancedMesh.
 */

export const Rocks = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2998;
	
	// Create low-poly rock geometry
	const geom = new THREE.DodecahedronGeometry(1, 0); // 0 detail = flat shaded low poly

	const mat = new THREE.MeshPhongMaterial({
		color: 0x888888, // Grey rock
		flatShading: true
	});

	const count = 200;
	const instancedMesh = new THREE.InstancedMesh(geom, mat, count);
	instancedMesh.castShadow = true;
	instancedMesh.receiveShadow = true;

	const dummy = new THREE.Object3D();
	const stepAngle = Math.PI * 2 / count;

	for(let i=0; i<count; i++) {
		const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
		
		dummy.position.set(Math.cos(a)*h, Math.sin(a)*h, -500 + Math.random()*1000);
		dummy.rotation.set(0, 0, a - Math.PI/2);
		
		dummy.rotateX(Math.random() * Math.PI);
		dummy.rotateY(Math.random() * Math.PI);
		dummy.rotateZ(Math.random() * Math.PI);
		
		const sX = 3 + Math.random() * 4;
		const sY = 2 + Math.random() * 3;
		const sZ = 3 + Math.random() * 4;
		dummy.scale.set(sX, sY, sZ);
		
		dummy.updateMatrix();
		instancedMesh.setMatrixAt(i, dummy.matrix);
	}

	instancedMesh.instanceMatrix.needsUpdate = true;
	self.mesh.add(instancedMesh);
};
