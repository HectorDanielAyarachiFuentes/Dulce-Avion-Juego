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
			const instance = modelTemplate.clone();
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			const h = 2995; // Colocamos en la superficie para que los volcanes no queden enterrados
			
			instance.position.y = Math.sin(a)*h;
			instance.position.x = Math.cos(a)*h;
			instance.rotation.z = a - Math.PI/2;
			
			// Rotación aleatoria para que cada montaña se vea distinta
			instance.rotation.y = Math.random() * Math.PI * 2;
			
			if (isDistant) {
				// Montañas lejanas de fondo
				instance.position.z = -1500 - Math.random()*1000;
				const s = baseScale * (3 + Math.random()*3); // Mucho más grandes
				instance.scale.set(s,s,s);
			} else {
				// Montañas normales en la pista
				instance.position.z = -500 + Math.random()*1000;
				const s = baseScale * (1 + Math.random()*1.5);
				instance.scale.set(s,s,s);
			}
			
			self.mesh.add(instance);
		}
	};
	
	const loader = new GLTFLoader();
	
	const createFixedWrapper = (scene) => {
		// Algunos modelos 3D vienen "acostados" porque usan un eje diferente para indicar Arriba.
		// Los envolvemos y rotamos 90 grados para que se paren correctamente.
		const wrapper = new THREE.Object3D();
		scene.rotation.x = -Math.PI / 2; // Cambiar a Math.PI/2 si quedan completamente boca abajo
		wrapper.add(scene);
		return wrapper;
	};

	// Cargar montañas
	loader.load('assets/models/mountains/Mountain.glb', gltf => {
		setupModel(gltf.scene);
		const wrapper = createFixedWrapper(gltf.scene);
		placeItems(wrapper, 30, 8, false); // Montañas normales
		placeItems(wrapper, 10, 8, true);  // Montañas lejanas
	});
	
	// Cargar volcanes
	loader.load('assets/models/mountains/Volcano.glb', gltf => {
		setupModel(gltf.scene);
		// El volcán original ya estaba bien orientado, así que no usamos el wrapper
		placeItems(gltf.scene, 20, 12, false); 
		placeItems(gltf.scene, 10, 12, true);   
	});
};
