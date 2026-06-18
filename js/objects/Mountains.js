/**
 * AI SUMMARY: Generates mountain scenery elements using GLTF models.
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

export const Mountains = function() {
	this.mesh = new THREE.Object3D();
	const self = this;
	
	const placeItems = (modelTemplate, count, baseScale, isDistant = false) => {
		const stepAngle = Math.PI * 2 / count;
		for(let i=0; i<count; i++) {
			// Contenedor externo: solo maneja posición orbital y rotación Z
			const container = new THREE.Object3D();
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			const h = 2995;
			
			container.position.y = Math.sin(a)*h;
			container.position.x = Math.cos(a)*h;
			container.rotation.z = a - Math.PI/2;
			
			// Modelo interno: solo rotación Y para variedad visual
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

	// Cargar montañas (Mountain.glb es ~10 unidades de ancho x 7 de alto)
	loader.load('assets/models/mountains/Mountain.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 35, 10, false); // Montañas normales
		placeItems(gltf.scene, 12, 10, true);  // Montañas lejanas
	});
	
	// Cargar volcanes (Volcano.glb es ~2 unidades, necesita mucha más escala)
	loader.load('assets/models/mountains/Volcano.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 10, 80, false);  // Volcanes normales (escala alta porque el modelo es diminuto)
		placeItems(gltf.scene, 5, 80, true);    // Volcanes lejanos
	});
};
