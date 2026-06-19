/**
 * AI SUMMARY: Generates procedural low-poly grass details for the world surface.
 * OPTIMIZADO EXTREMO: Usa THREE.InstancedMesh.
 */

export const Grass = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2998;
	
	// Create simple low-poly grass blade (a tall, thin cone)
	const geom = new THREE.ConeGeometry(0.5, 3, 3);
	geom.translate(0, 1.5, 0);

	const mat = new THREE.MeshPhongMaterial({
		color: 0x489030, // Green grass
		flatShading: true
	});

	const count = 3000; // Massive amounts of grass
	const instancedMesh = new THREE.InstancedMesh(geom, mat, count);
	instancedMesh.castShadow = false;
	instancedMesh.receiveShadow = false;

	const dummy = new THREE.Object3D();
	const stepAngle = Math.PI * 2 / count;

	for(let i=0; i<count; i++) {
		const a = stepAngle*i + (Math.random() - 0.5) * 1.5;
		
		dummy.position.set(Math.cos(a)*h, Math.sin(a)*h, -500 + Math.random()*1000);
		dummy.rotation.set(0, 0, a - Math.PI/2);
		
		// Random slight tilt and twist
		dummy.rotateY(Math.random() * Math.PI * 2);
		dummy.rotateZ((Math.random() - 0.5) * 0.5);
		dummy.rotateX((Math.random() - 0.5) * 0.5);
		
		const s = 1 + Math.random() * 2;
		dummy.scale.set(s, s * (0.8 + Math.random() * 0.6), s);
		
		dummy.updateMatrix();
		instancedMesh.setMatrixAt(i, dummy.matrix);
	}

	instancedMesh.instanceMatrix.needsUpdate = true;
	self.mesh.add(instancedMesh);
};
