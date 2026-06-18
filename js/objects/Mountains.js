/**
 * AI SUMMARY: Generates mountain scenery elements using GLTF models.
 * OPTIMIZADO EXTREMO: Usa THREE.InstancedMesh.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const Mountains = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2995;
	
	const loader = new GLTFLoader();
	
	const loadInstanced = (url, countNormal, countDistant, baseScale) => {
		loader.load(url, gltf => {
			let meshToInstantiate = null;
			gltf.scene.traverse(child => {
				if (child.isMesh && !meshToInstantiate) meshToInstantiate = child;
			});
			if (!meshToInstantiate) return;
			
			const totalCount = countNormal + countDistant;
			const instancedMesh = new THREE.InstancedMesh(
				meshToInstantiate.geometry, 
				meshToInstantiate.material, 
				totalCount
			);
			instancedMesh.castShadow = true;
			instancedMesh.receiveShadow = false;
			
			const dummy = new THREE.Object3D();
			
			let currentIndex = 0;
			
			// Helper para colocar instancias
			const placeBatch = (count, isDistant) => {
				const stepAngle = Math.PI * 2 / count;
				for(let i=0; i<count; i++) {
					const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
					
					const zPos = isDistant 
						? -1500 - Math.random()*1000 
						: -500 + Math.random()*1000;
						
					dummy.position.set(Math.cos(a)*h, Math.sin(a)*h, zPos);
					dummy.rotation.set(0, 0, a - Math.PI/2);
					dummy.rotateY(Math.random() * Math.PI * 2);
					
					const scaleMult = isDistant 
						? (3 + Math.random()*3) 
						: (1 + Math.random()*1.5);
						
					const s = baseScale * scaleMult;
					dummy.scale.set(s,s,s);
					
					dummy.updateMatrix();
					instancedMesh.setMatrixAt(currentIndex, dummy.matrix);
					currentIndex++;
				}
			};
			
			placeBatch(countNormal, false);
			placeBatch(countDistant, true);
			
			instancedMesh.instanceMatrix.needsUpdate = true;
			self.mesh.add(instancedMesh);
		});
	};
	
	loadInstanced('assets/models/mountains/Mountain.glb', 45, 15, 10);
	loadInstanced('assets/models/mountains/Volcano.glb', 15, 8, 80);
};
