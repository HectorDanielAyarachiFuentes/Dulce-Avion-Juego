/**
 * AI SUMMARY: Defines the Sky object with moving clouds, sun, and moon.
 */
import { Colors } from '../utils/colors.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const Cloud = function () {
	// Create an empty container that will hold the different parts of the cloud
	this.mesh = new THREE.Object3D();

	// create a cube geometry;
	// this shape will be duplicated to create the cloud
	const geom = new THREE.BoxGeometry(20, 20, 20);

	// create a material; a simple white material will do the trick
	const mat = new THREE.MeshPhongMaterial({
		color: Colors.white,
	});

	// duplicate the geometry a random number of times
	const nBlocs = 3 + Math.floor(Math.random() * 3);
	for (let i = 0; i < nBlocs; i++) {

		// create the mesh by cloning the geometry
		const m = new THREE.Mesh(geom, mat);

		// set the position and the rotation of each cube randomly
		m.position.x = i * 15;
		m.position.y = Math.random() * 10;
		m.position.z = Math.random() * 10;
		m.rotation.z = Math.random() * Math.PI * 2;
		m.rotation.y = Math.random() * Math.PI * 2;

		// set the size of the cube randomly
		const s = .1 + Math.random() * .9;
		m.scale.set(s, s, s);

		// allow each cube to cast and to receive shadows
		m.castShadow = true;
		m.receiveShadow = true;

		// add the cube to the container we first created
		this.mesh.add(m);
	}
};

export const Sky = function () {
	this.mesh = new THREE.Object3D();
	this.celestials = new THREE.Object3D(); // Contenedor para sol y luna (no gira con las nubes)
	this.nClouds = 60; // Más nubes
	
	const stepAngle = Math.PI * 2 / this.nClouds;

	for (let i = 0; i < this.nClouds; i++) {
		const c = new Cloud();
		const a = stepAngle * i;
		const h = 3200 + Math.random() * 400; // Radius + distance

		c.mesh.position.y = Math.sin(a) * h;
		c.mesh.position.x = Math.cos(a) * h;
		c.mesh.rotation.z = a + Math.PI / 2;
		
		// Variación de profundidad para nubes de fondo
		c.mesh.position.z = -200 - Math.random() * 1200;

		const s = 1 + Math.random() * 2;
		c.mesh.scale.set(s, s, s);

		this.mesh.add(c.mesh);
	}

	// === EL SOL ===
	this.sun = new THREE.Object3D();
	this.sun.position.set(-300, 350, -1200); // Arriba a la izquierda, muy al fondo
	this.celestials.add(this.sun);

	// === LA LUNA ===
	this.moon = new THREE.Object3D();
	this.moon.position.set(300, 350, -1200); // Arriba a la derecha
	this.moon.visible = false; // Oculta de día
	this.celestials.add(this.moon);

	const loader = new GLTFLoader();

	// Cargar Sol
	loader.load('assets/models/astros/Sun.glb', gltf => {
		const model = gltf.scene;
		// Puedes ajustar la escala aquí si el modelo es muy grande o pequeño
		model.scale.set(50, 50, 50); 
		this.sun.add(model);
	});

	// Cargar Luna
	loader.load('assets/models/astros/Moon.glb', gltf => {
		const model = gltf.scene;
		// Puedes ajustar la escala aquí si el modelo es muy grande o pequeño
		model.scale.set(50, 50, 50);
		this.moon.add(model);
	});
};
