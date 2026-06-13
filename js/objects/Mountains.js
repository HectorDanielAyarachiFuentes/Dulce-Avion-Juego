/**
 * AI SUMMARY: Generates mountain scenery elements.
 */
import { Colors } from '../utils/colors.js';

export const Mountain = function() {
	this.mesh = new THREE.Object3D();
	
	// Create a rugged shape for a low-poly mountain
	// radiusTop: 0, radiusBottom: 30, height: 60, radialSegments: 8, heightSegments: 3
	const geom = new THREE.CylinderGeometry(0, 30, 60, 8, 3);
	
	// Add noise to vertices to make it look rocky and irregular using BufferGeometry API
	const pos = geom.attributes.position;
	const uniqueVertices = {};

	for (let i = 0; i < pos.count; i++) {
		let x = pos.getX(i);
		let y = pos.getY(i);
		let z = pos.getZ(i);

		// Crear una clave única para cada vértice basada en su posición inicial
		const key = Math.round(x * 100) + '_' + Math.round(y * 100) + '_' + Math.round(z * 100);

		if (!uniqueVertices[key]) {
			uniqueVertices[key] = {
				dx: (Math.random() - 0.5) * 12,
				dy: (Math.random() - 0.5) * 12,
				dz: (Math.random() - 0.5) * 12
			};
		}

		// Desplazar los vértices intermedios
		if (y > -29 && y < 29) {
			x += uniqueVertices[key].dx;
			y += uniqueVertices[key].dy;
			z += uniqueVertices[key].dz;
		}

		pos.setXYZ(i, x, y, z);
	}
	
	geom.computeVertexNormals();

	const mat = new THREE.MeshPhongMaterial({
		color: Colors.brownDark,
		flatShading: true
	});
	
	const mesh = new THREE.Mesh(geom, mat);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	
	// Shift geometry so the origin is at the base of the mountain instead of the center
	geom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 30, 0));
	
	this.mesh.add(mesh);
};

export const Mountains = function() {
	this.mesh = new THREE.Object3D();
	this.nMountains = 40;
	
	const stepAngle = Math.PI * 2 / this.nMountains;
	
	for(let i=0; i<this.nMountains; i++) {
		const m = new Mountain();
		
		// Random angle around the giant cylinder
		const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
		
		// The sea radius is 3000, we sink them slightly (2980) so they don't float above the waves
		const h = 2980;
		
		m.mesh.position.y = Math.sin(a)*h;
		m.mesh.position.x = Math.cos(a)*h;
		
		// Point outwards from the cylinder
		m.mesh.rotation.z = a - Math.PI/2;
		
		// Scatter along the depth of the sea (width of cylinder is 1200)
		m.mesh.position.z = -500 + Math.random()*1000;
		
		const s = 1 + Math.random()*3;
		m.mesh.scale.set(s,s,s);
		
		this.mesh.add(m.mesh);
	}
};
