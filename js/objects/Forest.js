/**
 * AI SUMMARY: Generates forest/tree scenery across the world surface using GLTF models.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function setupModel(model) {
	model.traverse(child => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
}

export const Forest = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2995; 

	const placeItems = (modelTemplate, count, baseScale) => {
		const stepAngle = Math.PI * 2 / count;
		for(let i=0; i<count; i++) {
			const instance = modelTemplate.clone();
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			
			instance.position.y = Math.sin(a)*h;
			instance.position.x = Math.cos(a)*h;
			instance.rotation.z = a - Math.PI/2;
			instance.position.z = -500 + Math.random()*1000;
			
			// Rotación aleatoria en Y para que no sean idénticos
			instance.rotation.y = Math.random() * Math.PI * 2;
			
			const s = baseScale * (1 + Math.random() * 1.5);
			instance.scale.set(s,s,s);
			
			self.mesh.add(instance);
		}
	};
	
	const loader = new GLTFLoader();
	
	// Cargar árboles variados
	loader.load('assets/models/nature_kit/Tree.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 20, 3.5); 
	});
	loader.load('assets/models/nature_kit/Pine.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 25, 3.5); 
	});
	loader.load('assets/models/nature_kit/Twisted Tree.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 10, 4); 
	});
	loader.load('assets/models/nature_kit/Bush.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 40, 2.5); 
	});
};
