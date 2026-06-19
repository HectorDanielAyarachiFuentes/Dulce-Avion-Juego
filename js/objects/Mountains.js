/**
 * AI SUMMARY: Generates low-poly mountain scenery elements using InstancedMesh and ConeGeometry.
 * OPTIMIZADO EXTREMO: Usa THREE.InstancedMesh.
 */

export const Mountains = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2995;
	
	const geom = new THREE.ConeGeometry(1, 1, 4);
	geom.translate(0, 0.5, 0);

	const palettes = [
		0x7a2833, // Deep Burgundy/Red
		0xdf7c5d, // Warm Orange/Peach
		0xfff2e5, // Snowy White/Cream
		0x3e2a3f  // Dark Purple/Shadow
	];

	palettes.forEach((colorHex, index) => {
		const mat = new THREE.MeshPhongMaterial({
			color: colorHex,
			flatShading: true
		});

		// MUCH smaller scale, MUCH higher density to form clusters
		let countNormal = 15;
		let countDistant = 40;
		let countForeground = 2; // Very few in the front
		let baseScale = 50;
		
		if (index === 2) { // white mountains (snowy peaks, fewest but tallest)
			countNormal = 5;
			countDistant = 15;
			countForeground = 1;
			baseScale = 80;
		} else if (index === 0) { // Burgundy (many base mountains)
			countNormal = 20;
			countDistant = 50;
			countForeground = 4;
			baseScale = 60;
		}

		const totalCount = countNormal + countDistant + countForeground;
		const instancedMesh = new THREE.InstancedMesh(geom, mat, totalCount);
		instancedMesh.castShadow = true;
		instancedMesh.receiveShadow = true;

		const dummy = new THREE.Object3D();
		let currentIndex = 0;

		const placeBatch = (count, layerType) => {
			const stepAngle = Math.PI * 2 / count;
			for(let i=0; i<count; i++) {
				// Clustered positions: perturb slightly from an even distribution
				const a = stepAngle * i + (Math.random() - 0.5) * 0.2;
				
				let zPos;
				let scaleMult;
				
				if (layerType === 'distant') {
					zPos = -1500 - Math.random() * 1500;
					scaleMult = 1.5 + Math.random() * 1.5;
				} else if (layerType === 'normal') {
					zPos = -1000 - Math.random() * 500;
					scaleMult = 0.8 + Math.random() * 1.2;
				} else { // foreground
					zPos = 100 + Math.random() * 200; // Passes near/over camera (z=280)
					scaleMult = 0.5 + Math.random() * 0.8; // Not too huge to not block screen completely
				}
					
				dummy.position.set(Math.cos(a)*h, Math.sin(a)*h, zPos);
				dummy.rotation.set(0, 0, a - Math.PI/2);
				
				// Random rotation around Y to make them interlock
				dummy.rotateY(Math.random() * Math.PI * 2);
				
				const radiusScale = baseScale * scaleMult * (0.8 + Math.random() * 0.6); // varied width
				const heightScale = baseScale * scaleMult * (1.5 + Math.random() * 1.5); // taller peaks
				
				dummy.scale.set(radiusScale, heightScale, radiusScale);
				
				dummy.updateMatrix();
				instancedMesh.setMatrixAt(currentIndex, dummy.matrix);
				currentIndex++;
			}
		};

		placeBatch(countNormal, 'normal');
		placeBatch(countDistant, 'distant');
		placeBatch(countForeground, 'foreground');
		
		instancedMesh.instanceMatrix.needsUpdate = true;
		self.mesh.add(instancedMesh);
	});
};
