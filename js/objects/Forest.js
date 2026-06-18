/**
 * AI SUMMARY: Generates forest/tree scenery across the world surface using GLTF models.
 * OPTIMIZADO EXTREMO: Usa THREE.InstancedMesh para renderizar miles de árboles con 1 solo draw call, eliminando el consumo de CPU.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const Forest = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2995; 

	const loader = new GLTFLoader();
	
	const loadInstanced = (url, count, baseScale, castShadow) => {
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
			instancedMesh.castShadow = castShadow;
			instancedMesh.receiveShadow = false; // Ahorro: hojas no necesitan recibir sombras propias
			
			const dummy = new THREE.Object3D();
			const stepAngle = Math.PI * 2 / count;
			
			for(let i=0; i<count; i++) {
				const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
				
				dummy.position.set(Math.cos(a)*h, Math.sin(a)*h, -500 + Math.random()*1000);
				dummy.rotation.set(0, 0, a - Math.PI/2); // Rotación Z orbital
				dummy.rotateY(Math.random() * Math.PI * 2); // Rotación Y local
				
				const s = baseScale * (1 + Math.random() * 1.5);
				dummy.scale.set(s,s,s);
				
				dummy.updateMatrix();
				instancedMesh.setMatrixAt(i, dummy.matrix);
			}
			
			instancedMesh.instanceMatrix.needsUpdate = true;
			self.mesh.add(instancedMesh);
		});
	};
	
	// Volvemos a las cantidades MASIVAS de vegetación, ahora sin costo de CPU
	loadInstanced('assets/models/nature_kit/Tree.glb', 150, 4, true);
	loadInstanced('assets/models/nature_kit/Pine.glb', 200, 4, true);
	loadInstanced('assets/models/nature_kit/Bush.glb', 300, 3, false); 
	loadInstanced('assets/models/nature_kit/Bush with Flowers.glb', 150, 3, false); 
	loadInstanced('assets/models/nature_kit/Twisted Tree.glb', 50, 5, true); 
	loadInstanced('assets/models/nature_kit/Dead Tree.glb', 50, 4, true); 
};
