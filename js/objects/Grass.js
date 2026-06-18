/**
 * AI SUMMARY: Generates grass details for the world surface using GLTF models.
 * OPTIMIZADO: Reducido drásticamente de ~1200 objetos a ~200 para mejorar performance.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function setupModel(model) {
	model.traverse(child => {
		if (child.isMesh) {
			child.castShadow = false;  // El pasto no necesita generar sombras (gran ahorro de GPU)
			child.receiveShadow = false;
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
			const container = new THREE.Object3D();
			const a = stepAngle*i + (Math.random() - 0.5) * 1.5;
			
			container.position.y = Math.sin(a)*h;
			container.position.x = Math.cos(a)*h;
			container.rotation.z = a - Math.PI/2;
			container.position.z = -500 + Math.random()*1000;
			
			const instance = modelTemplate.clone();
			instance.rotation.y = Math.random() * Math.PI * 2;
			
			const s = baseScale * (0.5 + Math.random() * 1.5);
			instance.scale.set(s,s,s);
			
			container.add(instance);
			self.mesh.add(container);
		}
	};
	
	const loader = new GLTFLoader();
	
	// Reducido drásticamente: solo 3 tipos, menos copias
	loader.load('assets/models/nature_kit/Grass.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 80, 3); 
	});
	loader.load('assets/models/nature_kit/Tall Grass.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 60, 3.5); 
	});
	loader.load('assets/models/nature_kit/Flower Group.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 30, 3); 
	});
};
