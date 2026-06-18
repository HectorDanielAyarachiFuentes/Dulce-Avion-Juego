/**
 * AI SUMMARY: Generates mountain scenery elements using GLTF models.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function setupModel(model) {
	model.traverse(child => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = false; // Ahorro de GPU: montañas no necesitan recibir sombras
		}
	});
}

export const Mountains = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	
	const placeItems = (modelTemplate, count, baseScale, isDistant = false) => {
		const stepAngle = Math.PI * 2 / count;
		for(let i=0; i<count; i++) {
			const container = new THREE.Object3D();
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			const h = 2995;
			
			container.position.y = Math.sin(a)*h;
			container.position.x = Math.cos(a)*h;
			container.rotation.z = a - Math.PI/2;
			
			const instance = modelTemplate.clone();
			instance.rotation.y = Math.random() * Math.PI * 2;
			
			if (isDistant) {
				container.position.z = -1500 - Math.random()*1000;
				const s = baseScale * (3 + Math.random()*3);
				instance.scale.set(s,s,s);
			} else {
				container.position.z = -500 + Math.random()*1000;
				const s = baseScale * (1 + Math.random()*1.5);
				instance.scale.set(s,s,s);
			}
			
			container.add(instance);
			self.mesh.add(container);
		}
	};
	
	const loader = new GLTFLoader();

	// Montañas (reducidas de 47 a 33 objetos)
	loader.load('assets/models/mountains/Mountain.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 25, 10, false);
		placeItems(gltf.scene, 8, 10, true);
	});
	
	// Volcanes (reducidos de 15 a 8 objetos)
	loader.load('assets/models/mountains/Volcano.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 6, 80, false);
		placeItems(gltf.scene, 3, 80, true);
	});
};
