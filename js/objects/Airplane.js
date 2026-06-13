/**
 * AI SUMMARY: Defines the player's airplane model (AirPlane class) and its animations.
 */
import { Colors } from '../utils/colors.js';

export const Pilot = function () {
	this.mesh = new THREE.Object3D();
	this.mesh.name = "pilot";

	this.angleHairs = 0;

	const bodyGeom = new THREE.BoxGeometry(15, 15, 15);
	const bodyMat = new THREE.MeshPhongMaterial({
		color: Colors.brown,
		flatShading: true
	});
	const body = new THREE.Mesh(bodyGeom, bodyMat);
	body.position.set(2, -12, 0);
	this.mesh.add(body);

	const faceGeom = new THREE.BoxGeometry(10, 10, 10);
	const faceMat = new THREE.MeshLambertMaterial({
		color: Colors.pink
	});
	const face = new THREE.Mesh(faceGeom, faceMat);
	this.mesh.add(face);

	const hairGeom = new THREE.BoxGeometry(4, 4, 4);
	const hairMat = new THREE.MeshLambertMaterial({
		color: Colors.brown
	});
	const hair = new THREE.Mesh(hairGeom, hairMat);
	hair.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));

	const hairs = new THREE.Object3D();
	this.hairsTop = new THREE.Object3D();

	for (let i = 0; i < 12; i++) {
		const h = hair.clone();
		const col = i % 3;
		const row = Math.floor(i / 3);
		const startPosZ = -4;
		const startPosX = -4;
		h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
		this.hairsTop.add(h);
	}
	hairs.add(this.hairsTop);

	const hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
	hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6, 0, 0));
	const hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
	const hairSideL = hairSideR.clone();
	hairSideR.position.set(8, -2, 6);
	hairSideL.position.set(8, -2, -6);
	hairs.add(hairSideR);
	hairs.add(hairSideL);

	const hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
	const hairBack = new THREE.Mesh(hairBackGeom, hairMat);
	hairBack.position.set(-1, -4, 0);
	hairs.add(hairBack);
	hairs.position.set(-5, 5, 0);

	this.mesh.add(hairs);

	const glassGeom = new THREE.BoxGeometry(5, 5, 5);
	const glassMat = new THREE.MeshLambertMaterial({
		color: Colors.brown
	});
	const glassR = new THREE.Mesh(glassGeom, glassMat);
	glassR.position.set(6, 0, 3);
	const glassL = glassR.clone();
	glassL.position.z = -glassR.position.z;

	const glassAGeom = new THREE.BoxGeometry(11, 1, 11);
	const glassA = new THREE.Mesh(glassAGeom, glassMat);
	this.mesh.add(glassR);
	this.mesh.add(glassL);
	this.mesh.add(glassA);

	const earGeom = new THREE.BoxGeometry(2, 3, 2);
	const earL = new THREE.Mesh(earGeom, faceMat);
	earL.position.set(0, 0, -6);
	const earR = earL.clone();
	earR.position.set(0, 0, 6);
	this.mesh.add(earL);
	this.mesh.add(earR);
};

Pilot.prototype.updateHairs = function () {
	const hairs = this.hairsTop.children;
	const l = hairs.length;
	for (let i = 0; i < l; i++) {
		const h = hairs[i];
		h.scale.y = .75 + Math.cos(this.angleHairs + i / 3) * .25;
	}
	this.angleHairs += 0.16;
};

export const AirPlane = function () {
	this.mesh = new THREE.Object3D();

	const geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
	this.matCockpit = new THREE.MeshPhongMaterial({
		color: Colors.red,
		flatShading: true
	});

	const pos = geomCockpit.attributes.position;
	for (let i = 0; i < pos.count; i++) {
		let x = pos.getX(i);
		let y = pos.getY(i);
		let z = pos.getZ(i);
        
		if (x < 0 && y > 0 && z > 0) { y -= 10; z += 20; }
		else if (x < 0 && y > 0 && z < 0) { y -= 10; z -= 20; }
		else if (x < 0 && y < 0 && z > 0) { y += 30; z += 20; }
		else if (x < 0 && y < 0 && z < 0) { y += 30; z -= 20; }
		
		pos.setXYZ(i, x, y, z);
	}

	const cockpit = new THREE.Mesh(geomCockpit, this.matCockpit);
	cockpit.castShadow = true;
	cockpit.receiveShadow = true;
	this.mesh.add(cockpit);

	const geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
	this.matEngine = new THREE.MeshPhongMaterial({
		color: Colors.white,
		flatShading: true
	});
	const engine = new THREE.Mesh(geomEngine, this.matEngine);
	engine.position.x = 40;
	engine.castShadow = true;
	engine.receiveShadow = true;
	this.mesh.add(engine);

	const geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
	this.matTailPlane = new THREE.MeshPhongMaterial({
		color: Colors.red,
		flatShading: true
	});
	const tailPlane = new THREE.Mesh(geomTailPlane, this.matTailPlane);
	tailPlane.position.set(-35, 25, 0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);

	const geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
	this.matSideWing = new THREE.MeshPhongMaterial({
		color: Colors.red,
		flatShading: true
	});
	const sideWing = new THREE.Mesh(geomSideWing, this.matSideWing);
	sideWing.castShadow = true;
	sideWing.receiveShadow = true;
	this.mesh.add(sideWing);

	const geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
	const matPropeller = new THREE.MeshPhongMaterial({
		color: Colors.brown,
		flatShading: true
	});
	this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
	this.propeller.castShadow = true;
	this.propeller.receiveShadow = true;

	const geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
	const matBlade = new THREE.MeshPhongMaterial({
		color: Colors.brownDark,
		flatShading: true
	});

	const blade = new THREE.Mesh(geomBlade, matBlade);
	blade.position.set(8, 0, 0);
	blade.castShadow = true;
	blade.receiveShadow = true;
	this.propeller.add(blade);
	this.propeller.position.set(50, 0, 0);
	this.mesh.add(this.propeller);
	
	// Cañón Frontal
	const cannonGeom = new THREE.CylinderGeometry(2, 2, 20, 8);
	cannonGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
	const cannonMat = new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading: true });
	const cannon = new THREE.Mesh(cannonGeom, cannonMat);
	cannon.position.set(55, -10, 0);
	cannon.castShadow = true;
	this.mesh.add(cannon);

	this.pilot = new Pilot();
	this.pilot.mesh.position.set(-10, 27, 0);
	this.mesh.add(this.pilot.mesh);

	this.missileMeshes = [];
	
	const missileGeom = new THREE.CylinderGeometry(2, 2, 15, 6);
	missileGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
	
	const tipGeom = new THREE.ConeGeometry(2, 5, 6);
	tipGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
	tipGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(10, 0, 0));
	
	const missileMat = new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true });
	const tipMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
	
	for(let i=0; i<8; i++) {
		const mContainer = new THREE.Object3D();
		const body = new THREE.Mesh(missileGeom, missileMat);
		const tip = new THREE.Mesh(tipGeom, tipMat);
		body.castShadow = true;
		tip.castShadow = true;
		const rackGeom = new THREE.BoxGeometry(2, 5, 2);
		const rackMat = new THREE.MeshPhongMaterial({ color: Colors.grey, flatShading: true });
		const rack = new THREE.Mesh(rackGeom, rackMat);
		rack.position.set(0, 3, 0); // Conecta el misil al ala
		rack.castShadow = true;
		
		mContainer.add(body);
		mContainer.add(tip);
		mContainer.add(rack);
		
		let zPos = 0;
		if (i < 4) {
			zPos = -60 + (i * 15);
		} else {
			zPos = 15 + ((i-4) * 15);
		}
		
		mContainer.position.set(0, -5, zPos);
		
		this.mesh.add(mContainer);
		this.missileMeshes.push(mContainer);
	}
	
	this.ammo = 8;
};

AirPlane.prototype.fireMissile = function() {
	if (this.ammo > 0) {
		this.ammo--;
		const missileVisual = this.missileMeshes[this.ammo];
		missileVisual.visible = false;
		return true;
	}
	return false;
};

AirPlane.prototype.reloadMissile = function() {
	if (this.ammo < 8) {
		const missileVisual = this.missileMeshes[this.ammo];
		missileVisual.visible = true;
		this.ammo++;
		return true;
	}
	return false;
};

AirPlane.prototype.applyStyle = function(styleId) {
	let c1, c2, c3, c4;
	switch(styleId) {
		case 1: // Original
			c1 = Colors.red; c2 = Colors.white; c3 = Colors.red; c4 = Colors.red;
			break;
		case 2: // Argentina
			c1 = 0x75AADB; c2 = 0xFFFFFF; c3 = 0x75AADB; c4 = 0x75AADB;
			break;
		case 3: // Bolivia
			c1 = 0xDA291C; c2 = 0xF4E400; c3 = 0xDA291C; c4 = 0x007A33;
			break;
		case 4: // Stealth Negro
			c1 = 0x222222; c2 = 0x111111; c3 = 0x222222; c4 = 0x111111;
			break;
		case 5: // Fuego
			c1 = 0xFF4500; c2 = 0xFFD700; c3 = 0xFF0000; c4 = 0xFF8C00;
			break;
		case 6: // Militar
			c1 = 0x4B5320; c2 = 0x8B4513; c3 = 0x4B5320; c4 = 0x556B2F;
			break;
		case 7: // Oceánico
			c1 = 0x000080; c2 = 0x00FFFF; c3 = 0x000080; c4 = 0x00CED1;
			break;
		case 8: // Neón Cyberpunk
			c1 = 0xFF00FF; c2 = 0x00FFFF; c3 = 0xFF00FF; c4 = 0x9400D3;
			break;
		case 9: // Dorado Imperial
			c1 = 0xFFD700; c2 = 0xFFFFFF; c3 = 0xFFD700; c4 = 0xDAA520;
			break;
		default:
			c1 = Colors.red; c2 = Colors.white; c3 = Colors.red; c4 = Colors.red;
	}
	
	this.matCockpit.color.setHex(c1);
	this.matEngine.color.setHex(c2);
	this.matTailPlane.color.setHex(c3);
	this.matSideWing.color.setHex(c4);
};
