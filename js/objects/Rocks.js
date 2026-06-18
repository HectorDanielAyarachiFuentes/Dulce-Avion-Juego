/**
 * AI SUMMARY: Generates rock scenery for the world using GLTF models.
 * OPTIMIZADO EXTREMO: Usa THREE.InstancedMesh.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const Rocks = function() {
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
			instancedMesh.castShadow = true;
			instancedMesh.receiveShadow = false;
			
			const dummy = new THREE.Object3D();
			const stepAngle = Math.PI * 2 / count;
			
			for(let i=0; i<count; i++) {
				const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
				
				dummy.position.set(Math.cos(a)*h, Math.sin(a)*h, -500 + Math.random()*1000);
				dummy.rotation.set(0, 0, a - Math.PI/2);
				
				dummy.rotateX(Math.random() * Math.PI);
				dummy.rotateY(Math.random() * Math.PI);
				
				const s = baseScale * (0.5 + Math.random() * 1.5);
				dummy.scale.set(s,s,s);
				
				dummy.updateMatrix();
				instancedMesh.setMatrixAt(i, dummy.matrix);
			}
			
			instancedMesh.instanceMatrix.needsUpdate = true;
			self.mesh.add(instancedMesh);
		});
	};
	
	loadInstanced('assets/models/nature_kit/Rock Medium.glb', 80, 4); 
	loadInstanced('assets/models/nature_kit/Pebble Round.glb', 120, 3); 
};
