/**
 * AI SUMMARY: Generates procedural low-poly forest/tree scenery across the world surface.
 * OPTIMIZADO EXTREMO: Usa THREE.InstancedMesh para renderizar miles de árboles con 1 solo draw call.
 */

export const Forest = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2995; 

	// Create low poly tree geometry
	// Trunk
	const trunkGeom = new THREE.CylinderGeometry(0.5, 1, 4, 4);
	trunkGeom.translate(0, 2, 0);
	
	// Leaves (Cone)
	const leavesGeom = new THREE.ConeGeometry(3, 8, 4);
	leavesGeom.translate(0, 8, 0);
	
	const trunkMat = new THREE.MeshPhongMaterial({
		color: 0x4a2a22,
		flatShading: true
	});

	const leafPalettes = [
		0xe88a45, // Bright Orange
		0xf5b553, // Yellow
		0xc9583b  // Reddish-Orange
	];

	const countPerPalette = 200;
	const totalTrees = countPerPalette * leafPalettes.length;
	
	const trunkInstancedMesh = new THREE.InstancedMesh(trunkGeom, trunkMat, totalTrees);
	trunkInstancedMesh.castShadow = true;
	trunkInstancedMesh.receiveShadow = false;
	
	const dummy = new THREE.Object3D();
	let treeIndex = 0;

	leafPalettes.forEach((colorHex) => {
		const leafMat = new THREE.MeshPhongMaterial({
			color: colorHex,
			flatShading: true
		});
		
		const leafInstancedMesh = new THREE.InstancedMesh(leavesGeom, leafMat, countPerPalette);
		leafInstancedMesh.castShadow = true;
		leafInstancedMesh.receiveShadow = false;

		const stepAngle = Math.PI * 2 / countPerPalette;
		
		for(let i=0; i<countPerPalette; i++) {
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			
			dummy.position.set(Math.cos(a)*h, Math.sin(a)*h, -500 + Math.random()*1000);
			dummy.rotation.set(0, 0, a - Math.PI/2); // Orbital rotation
			dummy.rotateY(Math.random() * Math.PI * 2); // Local Y rotation
			
			const baseScale = 1.5 + Math.random() * 2;
			dummy.scale.set(baseScale, baseScale, baseScale);
			
			dummy.updateMatrix();
			
			leafInstancedMesh.setMatrixAt(i, dummy.matrix);
			trunkInstancedMesh.setMatrixAt(treeIndex, dummy.matrix);
			
			treeIndex++;
		}
		
		leafInstancedMesh.instanceMatrix.needsUpdate = true;
		self.mesh.add(leafInstancedMesh);
	});
	
	trunkInstancedMesh.instanceMatrix.needsUpdate = true;
	self.mesh.add(trunkInstancedMesh);
};
