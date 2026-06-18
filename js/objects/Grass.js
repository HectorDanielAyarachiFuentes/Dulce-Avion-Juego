/**
 * AI SUMMARY: Generates grass details for the world surface using GLTF models.
 * OPTIMIZADO EXTREMO: Usa THREE.InstancedMesh.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const Grass = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2998;
	
	const loader = new GLTFLoader();
	
	const loadInstanced = (url, count, baseScale) => {
		loader.load(url, gltf => {
			let meshToInstantiate = null;
			gltf.scene.traverse(child => {
				if (child.isMesh && !meshToInstantiate) meshToInstantiate = child;
			});
			if (!meshToInstantiate) return;
			
			const instancedMesh = new THREE.InstancedMesh(
				meshToInstantiate.geometry, 
				meshToInstantiate.material, 
				count
			);
			instancedMesh.castShadow = false;
			instancedMesh.receiveShadow = false;
			
			const dummy = new THREE.Object3D();
			const stepAngle = Math.PI * 2 / count;
			
			for(let i=0; i<count; i++) {
				const a = stepAngle*i + (Math.random() - 0.5) * 1.5;
				
				dummy.position.set(Math.cos(a)*h, Math.sin(a)*h, -500 + Math.random()*1000);
				dummy.rotation.set(0, 0, a - Math.PI/2);
				dummy.rotateY(Math.random() * Math.PI * 2);
				
				const s = baseScale * (0.5 + Math.random() * 1.5);
				dummy.scale.set(s,s,s);
				
				dummy.updateMatrix();
				instancedMesh.setMatrixAt(i, dummy.matrix);
			}
			
			instancedMesh.instanceMatrix.needsUpdate = true;
			self.mesh.add(instancedMesh);
		});
	};
	
	// Cantidades masivas para un suelo rico, 0 costo de CPU
	loadInstanced('assets/models/nature_kit/Grass.glb', 1500, 3); 
	loadInstanced('assets/models/nature_kit/Tall Grass.glb', 1000, 3.5); 
	loadInstanced('assets/models/nature_kit/Flower Group.glb', 400, 3); 
	loadInstanced('assets/models/nature_kit/Clover.glb', 500, 2); 
	loadInstanced('assets/models/nature_kit/Plant Big.glb', 300, 3); 
	loadInstanced('assets/models/nature_kit/Plant.glb', 300, 3); 
	loadInstanced('assets/models/nature_kit/Flower Single.glb', 400, 3); 
	loadInstanced('assets/models/nature_kit/Mushroom.glb', 200, 2); 
};
