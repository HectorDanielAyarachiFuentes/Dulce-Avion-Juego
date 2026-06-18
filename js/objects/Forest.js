/**
 * AI SUMMARY: Generates forest/tree scenery across the world surface using GLTF models.
 * OPTIMIZADO: Usa pocos modelos con pocas instancias para reducir draw calls.
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
			const container = new THREE.Object3D();
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			
			container.position.y = Math.sin(a)*h;
			container.position.x = Math.cos(a)*h;
			container.rotation.z = a - Math.PI/2;
			container.position.z = -500 + Math.random()*1000;
			
			const instance = modelTemplate.clone();
			instance.rotation.y = Math.random() * Math.PI * 2;
			
			const s = baseScale * (1 + Math.random() * 1.5);
			instance.scale.set(s,s,s);
			
			container.add(instance);
			self.mesh.add(container);
		}
	};
	
	const loader = new GLTFLoader();
	
	// Solo 1 variante de cada tipo para reducir cargas de archivos
	// Árboles frondosos
	loader.load('assets/models/nature_kit/Tree.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 20, 5);
	});
	
	// Pinos
	loader.load('assets/models/nature_kit/Pine.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 25, 5);
	});
	
	// Arbustos
	loader.load('assets/models/nature_kit/Bush.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 25, 4); 
	});

	// Arbustos con flores
	loader.load('assets/models/nature_kit/Bush with Flowers.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 15, 3); 
	});
	
	// Árboles retorcidos
	loader.load('assets/models/nature_kit/Twisted Tree.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 8, 5); 
	});
};
