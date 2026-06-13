/**
 * AI SUMMARY: Defines the Sky object with moving clouds, sun, and moon.
 */
import { Colors } from '../utils/colors.js';

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
	const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
	const sunGeom = new THREE.IcosahedronGeometry(60, 1); // Aspecto más low-poly
	this.sun = new THREE.Mesh(sunGeom, sunMat);
	
	// Rayos del sol (pirámides alargadas)
	const rayGeom = new THREE.ConeGeometry(15, 60, 4); 
	rayGeom.translate(0, 80, 0); // Desplaza los rayos hacia afuera del centro
	for(let i=0; i<8; i++){
		const ray = new THREE.Mesh(rayGeom, sunMat);
		ray.rotation.z = i * (Math.PI*2/8);
		this.sun.add(ray);
	}

	// Halo brillante
	const haloGeom = new THREE.IcosahedronGeometry(100, 1);
	const haloMat = new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.3 });
	const halo = new THREE.Mesh(haloGeom, haloMat);
	this.sun.add(halo);

	this.sun.position.set(-300, 350, -1200); // Arriba a la izquierda, muy al fondo
	this.celestials.add(this.sun);

	// === LA LUNA ===
	this.moon = new THREE.Object3D();
	
	const moonGeom = new THREE.IcosahedronGeometry(50, 1);
	this.moonMat = new THREE.MeshBasicMaterial({ color: 0xeef4f5 });
	const moonCore = new THREE.Mesh(moonGeom, this.moonMat);
	this.moon.add(moonCore);

	// Cráteres low-poly
	const craterGeom = new THREE.CylinderGeometry(8, 8, 4, 6);
	const craterMat = new THREE.MeshBasicMaterial({ color: 0xbac1c4 });
	
	// Posiciones manuales para que se vean bien
	const positions = [
		{x: 15, y: 15, z: 44},
		{x: -20, y: 5, z: 43},
		{x: 5, y: -25, z: 42},
		{x: -15, y: -15, z: 45}
	];
	
	positions.forEach(pos => {
		const crater = new THREE.Mesh(craterGeom, craterMat);
		crater.position.set(pos.x, pos.y, pos.z);
		crater.lookAt(new THREE.Vector3(0,0,0)); // Los cráteres miran hacia el centro de la luna
		this.moon.add(crater);
	});

	// Halo lunar
	const moonHaloGeom = new THREE.IcosahedronGeometry(80, 1);
	const moonHaloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
	const moonHalo = new THREE.Mesh(moonHaloGeom, moonHaloMat);
	this.moon.add(moonHalo);

	this.moon.position.set(300, 350, -1200); // Arriba a la derecha
	this.moon.visible = false; // Oculta de día
	this.celestials.add(this.moon);
};
