/**
 * AI SUMMARY: Generates rock scenery for the world using GLTF models.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function setupModel(model) {
	model.traverse(child => {
		if (child.isMesh) {
			child.castShadow = false;
			child.receiveShadow = false;
		}
	});
}

export const Rocks = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2998;
	
	const placeItems = (modelTemplate, count, baseScale) => {
		const stepAngle = Math.PI * 2 / count;
		for(let i=0; i<count; i++) {
			const instance = modelTemplate.clone();
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			
			instance.position.y = Math.sin(a)*h;
			instance.position.x = Math.cos(a)*h;
			instance.rotation.z = a - Math.PI/2;
			instance.position.z = -500 + Math.random()*1000;
			
			instance.rotation.x = Math.random() * Math.PI;
			instance.rotation.y = Math.random() * Math.PI;
			
			const s = baseScale * (0.5 + Math.random() * 1.5);
			instance.scale.set(s,s,s);
			
			self.mesh.add(instance);
		}
	};
	
	const loader = new GLTFLoader();
	
	loader.load('assets/models/nature_kit/Rock Medium.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 15, 4); 
	});
	loader.load('assets/models/nature_kit/Pebble Round.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 10, 3); 
	});
};
