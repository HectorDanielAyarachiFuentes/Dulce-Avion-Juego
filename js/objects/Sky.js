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

// Define a Sky Object
export const Sky = function () {
	this.mesh = new THREE.Object3D();
	this.nClouds = 30;
	
	const stepAngle = Math.PI * 2 / this.nClouds;

	for (let i = 0; i < this.nClouds; i++) {
		const c = new Cloud();

		const a = stepAngle * i;
		const h = 3200 + Math.random() * 300; // Radius + distance

		c.mesh.position.y = Math.sin(a) * h;
		c.mesh.position.x = Math.cos(a) * h;
		c.mesh.rotation.z = a + Math.PI / 2;
		c.mesh.position.z = -500 + Math.random() * 1000;

		const s = 1 + Math.random() * 2;
		c.mesh.scale.set(s, s, s);

		this.mesh.add(c.mesh);
	}
};
