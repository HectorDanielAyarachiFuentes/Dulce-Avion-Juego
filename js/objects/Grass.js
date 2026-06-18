/**
 * AI SUMMARY: Generates grass details for the world surface using GLTF models.
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

export const Grass = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	const h = 2998;
	
	const placeItems = (modelTemplate, count, baseScale) => {
		const stepAngle = Math.PI * 2 / count;
		for(let i=0; i<count; i++) {
			const instance = modelTemplate.clone();
			const a = stepAngle*i + (Math.random() - 0.5) * 1.5;
			
			instance.position.y = Math.sin(a)*h;
			instance.position.x = Math.cos(a)*h;
			instance.rotation.z = a - Math.PI/2;
			instance.position.z = -500 + Math.random()*1000;
			
			instance.rotation.y = Math.random() * Math.PI * 2;
			
			const s = baseScale * (0.5 + Math.random() * 1.5);
			instance.scale.set(s,s,s);
			
			self.mesh.add(instance);
		}
	};
	
	const loader = new GLTFLoader();
	
	loader.load('assets/models/nature_kit/Grass.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 400, 2.5); 
	});
	loader.load('assets/models/nature_kit/Tall Grass.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 300, 3); 
	});
	loader.load('assets/models/nature_kit/Clover.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 300, 2); 
	});
	loader.load('assets/models/nature_kit/Flower Group.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 80, 3); 
	});
	loader.load('assets/models/nature_kit/Fern.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 80, 2); 
	});
	loader.load('assets/models/nature_kit/Mushroom.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 50, 1.5); 
	});
};
