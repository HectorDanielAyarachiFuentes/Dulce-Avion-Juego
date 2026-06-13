/**
 * AI SUMMARY: Defines eagle obstacles/enemies.
 */
import { Colors } from '../utils/colors.js';

export const Eagle = function() {
	this.mesh = new THREE.Object3D();
	
	// Body
	const bodyGeom = new THREE.BoxGeometry(30, 10, 10);
	const bodyMat = new THREE.MeshPhongMaterial({
		color: Colors.brownDark,
		flatShading: true
	});
	this.body = new THREE.Mesh(bodyGeom, bodyMat);
	this.body.castShadow = true;
	this.body.receiveShadow = true;
	this.mesh.add(this.body);
	
	// Head
	const headGeom = new THREE.BoxGeometry(10, 10, 10);
	const headMat = new THREE.MeshPhongMaterial({
		color: Colors.white,
		flatShading: true
	});
	this.head = new THREE.Mesh(headGeom, headMat);
	this.head.position.set(20, 0, 0);
	this.head.castShadow = true;
	this.head.receiveShadow = true;
	this.mesh.add(this.head);
	
	// Beak
	const beakGeom = new THREE.CylinderGeometry(0, 3, 10, 4);
	beakGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
	const beakMat = new THREE.MeshPhongMaterial({
		color: Colors.yellow,
		flatShading: true
	});
	this.beak = new THREE.Mesh(beakGeom, beakMat);
	this.beak.position.set(30, 0, 0);
	this.mesh.add(this.beak);
	
	// Wings
	const wingGeom = new THREE.BoxGeometry(20, 2, 30);
	wingGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 15));
	const wingMat = new THREE.MeshPhongMaterial({
		color: Colors.brownLight,
		flatShading: true
	});
	
	this.wingR = new THREE.Mesh(wingGeom, wingMat);
	this.wingR.position.set(0, 5, 5);
	this.wingR.castShadow = true;
	this.mesh.add(this.wingR);
	
	const wingGeomL = new THREE.BoxGeometry(20, 2, 30);
	wingGeomL.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -15));
	
	this.wingL = new THREE.Mesh(wingGeomL, wingMat);
	this.wingL.position.set(0, 5, -5);
	this.wingL.castShadow = true;
	this.mesh.add(this.wingL);
	
	// Tail
	const tailGeom = new THREE.BoxGeometry(10, 2, 15);
	const tailMat = new THREE.MeshPhongMaterial({
		color: Colors.brownDark,
		flatShading: true
	});
	this.tail = new THREE.Mesh(tailGeom, tailMat);
	this.tail.position.set(-20, 0, 0);
	this.mesh.add(this.tail);

	// Anim state
	this.flapTime = 0;
};

Eagle.prototype.flapWings = function() {
	this.flapTime += 0.2;
	// flap wings up and down
	this.wingR.rotation.x = Math.sin(this.flapTime) * 0.8;
	this.wingL.rotation.x = -Math.sin(this.flapTime) * 0.8;
	
	// slight body bounce relative to its parent container
	this.mesh.position.y += Math.cos(this.flapTime) * 0.1;
};
