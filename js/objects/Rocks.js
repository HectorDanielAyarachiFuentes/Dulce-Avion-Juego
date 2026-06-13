/**
 * AI SUMMARY: Generates rock scenery for the world.
 */
import { Colors } from '../utils/colors.js';

export const Rock = function() {
	this.mesh = new THREE.Object3D();
	
	// A small rugged cylinder or box
	const geom = new THREE.DodecahedronGeometry(5, 0); // Low poly rock
	
	const mat = new THREE.MeshPhongMaterial({
		color: Colors.grey,
		flatShading: true
	});
	
	const mesh = new THREE.Mesh(geom, mat);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	
	// Flatten it slightly to look more like a rock lying on the ground
	mesh.scale.set(1, 0.5 + Math.random() * 0.5, 1);
	
	this.mesh.add(mesh);
};

export const Rocks = function() {
	this.mesh = new THREE.Object3D();
	this.nRocks = 50;
	
	const stepAngle = Math.PI * 2 / this.nRocks;
	const h = 2998;
	
	for(let i=0; i<this.nRocks; i++) {
		const rock = new Rock();
		
		const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
		
		rock.mesh.position.y = Math.sin(a)*h;
		rock.mesh.position.x = Math.cos(a)*h;
		
		rock.mesh.rotation.z = a - Math.PI/2;
		rock.mesh.position.z = -500 + Math.random()*1000;
		
		// Randomize orientation
		rock.mesh.rotation.x = Math.random() * Math.PI;
		rock.mesh.rotation.y = Math.random() * Math.PI;
		
		const s = 0.5 + Math.random()*1.5;
		rock.mesh.scale.set(s, s, s);
		
		this.mesh.add(rock.mesh);
	}
};
