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
			// Creamos un contenedor externo para la posición orbital
			const container = new THREE.Object3D();
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			
			container.position.y = Math.sin(a)*h;
			container.position.x = Math.cos(a)*h;
			container.rotation.z = a - Math.PI/2;
			container.position.z = -500 + Math.random()*1000;
			
			// Clonamos el modelo adentro y solo le rotamos en Y para variedad
			// Así la rotación Y no pelea con la rotación Z del contenedor
			const instance = modelTemplate.clone();
			instance.rotation.y = Math.random() * Math.PI * 2;
			
			const s = baseScale * (1 + Math.random() * 1.5);
			instance.scale.set(s,s,s);
			
			container.add(instance);
			self.mesh.add(container);
		}
	};
	
	const loader = new GLTFLoader();
	
	// Usar variantes de los modelos para más diversidad visual
	const treeVariants = [
		'Tree.glb',
		'Tree-QVOop92WmG.glb',
		'Tree-aVOxaHRPWe.glb',
		'Tree-qZtx0AHhcy.glb',
		'Tree-t9KbsfYdXz.glb'
	];
	const pineVariants = [
		'Pine.glb',
		'Pine-699sFuLCN2.glb',
		'Pine-79gmlLnweB.glb',
		'Pine-Zt62gceKXZ.glb',
		'Pine-rfnxJv0Rqa.glb'
	];
	
	// Árboles frondosos (5 variantes x 8 copias = 40 árboles)
	treeVariants.forEach(file => {
		loader.load('assets/models/nature_kit/' + file, gltf => {
			setupModel(gltf.scene);
			placeItems(gltf.scene, 8, 5);
		});
	});
	
	// Pinos (5 variantes x 10 copias = 50 pinos)
	pineVariants.forEach(file => {
		loader.load('assets/models/nature_kit/' + file, gltf => {
			setupModel(gltf.scene);
			placeItems(gltf.scene, 10, 5);
		});
	});
	
	// Arbustos densos
	loader.load('assets/models/nature_kit/Bush.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 50, 4); 
	});
	
	// Arbustos con flores (color y vida)
	loader.load('assets/models/nature_kit/Bush with Flowers.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 30, 4); 
	});
	
	// Árboles secos para variedad
	loader.load('assets/models/nature_kit/Dead Tree.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 8, 4); 
	});
	
	// Árboles retorcidos
	loader.load('assets/models/nature_kit/Twisted Tree.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 12, 5); 
	});
	
	// Plantas grandes para darle cuerpo al suelo
	loader.load('assets/models/nature_kit/Plant Big.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 40, 3); 
	});
	
	// Plantas normales
	loader.load('assets/models/nature_kit/Plant.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 40, 3); 
	});
	
	// Flores individuales (color!)
	loader.load('assets/models/nature_kit/Flower Single.glb', gltf => {
		setupModel(gltf.scene);
		placeItems(gltf.scene, 50, 3); 
	});
};
