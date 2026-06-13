/**
 * AI SUMMARY: 3D victory scene rendered after defeating the mothership. Shows the airplane parked
 * in a forest clearing with the pilot dancing, a banner plane flying overhead, and rolling credits.
 */
import { Colors } from '../utils/colors.js';
import { AirPlane } from './Airplane.js';

export const VictoryScene = function(parentScene) {
	this.mesh = new THREE.Object3D();
	this.mesh.visible = false;
	this.timer = 0;
	this.parentScene = parentScene;
	
	// === AVIONETA ESTACIONADA ===
	// La ponemos en y=25 para que las ruedas toquen el suelo
	this.parkedPlaneObj = new AirPlane();
	this.parkedPlaneObj.pilot.mesh.visible = false; // Pilot is dancing outside!
	this.parkedPlane = this.parkedPlaneObj.mesh;
	this.parkedPlane.position.set(-20, 25, 0);
	this.parkedPlane.rotation.y = Math.PI * 0.7;
	this.parkedPlane.scale.setScalar(0.3); // Tamaño similar al original
	this.mesh.add(this.parkedPlane);
	
	// === PILOTO BAILANDO ===
	this.dancer = this._createDancingPilot();
	this.dancer.position.set(15, 20, 25);
	this.dancer.scale.setScalar(3.0);
	this.mesh.add(this.dancer);
	
	// === DULCE (PERRITA) ===
	this.dulce = this._createDog();
	this.dulce.position.set(50, 15, -10); // Más lejos y a la derecha
	this.dulce.scale.setScalar(2.5);
	this.mesh.add(this.dulce);
	
	// === AVIONETA DEL BANNER VOLANDO ===
	this.bannerPlane = new THREE.Object3D();
	this.bannerPlaneObj = new AirPlane();
	const bannerAirplane = this.bannerPlaneObj.mesh;
	bannerAirplane.scale.setScalar(0.25);
	this.bannerPlane.add(bannerAirplane);
	
	// Banner / Cartel
	this.banner = new THREE.Object3D();
	const bannerGeom = new THREE.PlaneGeometry(200, 50);
	const bannerCanvas = document.createElement('canvas');
	bannerCanvas.width = 1024;
	bannerCanvas.height = 256;
	const ctx = bannerCanvas.getContext('2d');
	
	// Fondo del cartel
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, 1024, 256);
	ctx.strokeStyle = '#f25346';
	ctx.lineWidth = 8;
	ctx.strokeRect(10, 10, 1004, 236);
	
	// Texto
	ctx.fillStyle = '#f25346';
	ctx.font = 'bold 60px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('¡VICTORIA ÉPICA!', 512, 80);
	
	ctx.fillStyle = '#333333';
	ctx.font = 'bold 36px Arial';
	ctx.fillText('🐶 Dulce Avión 3D 🐶', 512, 145);
	
	ctx.fillStyle = '#666666';
	ctx.font = '28px Arial';
	ctx.fillText('La Tierra está a salvo', 512, 210);
	
	const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
	const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTexture, side: THREE.DoubleSide, fog: false });
	const bannerMesh = new THREE.Mesh(bannerGeom, bannerMat);
	this.banner.add(bannerMesh);
	
	// Cuerdas del banner al avión
	const ropeGeom = new THREE.CylinderGeometry(0.5, 0.5, 80, 4);
	const ropeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
	const ropeL = new THREE.Mesh(ropeGeom, ropeMat);
	ropeL.position.set(-95, 30, 0);
	ropeL.rotation.z = 0.3;
	this.banner.add(ropeL);
	const ropeR = new THREE.Mesh(ropeGeom, ropeMat);
	ropeR.position.set(95, 30, 0);
	ropeR.rotation.z = -0.3;
	this.banner.add(ropeR);
	
	this.banner.position.set(-120, -20, 0);
	this.bannerPlane.add(this.banner);
	
	this.bannerPlane.position.set(-300, 100, -100);
	this.bannerPlane.rotation.y = 0; // Apunta hacia +X
	this.mesh.add(this.bannerPlane);
	
	// === MARIPOSAS ===
	this.butterflies = [];
	const butterflyColors = [0xffdd00, 0xff66aa, 0x66aaff, 0xaaffaa];
	for (let i = 0; i < 8; i++) {
		const butterfly = this._createButterfly(butterflyColors[i % butterflyColors.length]);
		butterfly.position.set(
			(Math.random() - 0.5) * 150,
			25 + Math.random() * 50,
			(Math.random() - 0.5) * 150
		);
		butterfly.userData = {
			baseX: butterfly.position.x,
			baseY: butterfly.position.y,
			baseZ: butterfly.position.z,
			speed: 0.5 + Math.random() * 1.5,
			phase: Math.random() * Math.PI * 2
		};
		this.mesh.add(butterfly);
		this.butterflies.push(butterfly);
	}
	
	// === LUZ PROPIA DE LA ESCENA (PARA RESALTAR A LOS PERSONAJES) ===
	this.victoryLight = new THREE.DirectionalLight(0xffffcc, 1.0);
	this.victoryLight.position.set(100, 200, 100);
	this.mesh.add(this.victoryLight);
};

// --- Crear el piloto bailarín ---
VictoryScene.prototype._createDancingPilot = function() {
	const pilot = new THREE.Object3D();
	
	// Cuerpo
	const bodyGeom = new THREE.BoxGeometry(10, 12, 8);
	const bodyMat = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
	const body = new THREE.Mesh(bodyGeom, bodyMat);
	body.position.y = 6;
	pilot.add(body);
	
	// Cara
	const faceGeom = new THREE.BoxGeometry(8, 8, 8);
	const faceMat = new THREE.MeshPhongMaterial({ color: Colors.pink, flatShading: true });
	const face = new THREE.Mesh(faceGeom, faceMat);
	face.position.y = 16;
	pilot.add(face);
	
	// Cabello
	const hairMat = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
	const hairGeom = new THREE.BoxGeometry(9, 4, 9);
	const hair = new THREE.Mesh(hairGeom, hairMat);
	hair.position.set(0, 21, 0);
	pilot.add(hair);
	
	// Gafas
	const goggleMat = new THREE.MeshPhongMaterial({ color: 0x222222, flatShading: true });
	const lensMat = new THREE.MeshPhongMaterial({ color: 0x00ffff, shininess: 100 });
	const goggleGeom = new THREE.BoxGeometry(4, 4, 4);
	
	const gR = new THREE.Mesh(goggleGeom, goggleMat);
	gR.position.set(4, 16, 2.5);
	const lR = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 3), lensMat);
	lR.position.set(2, 0, 0);
	gR.add(lR);
	pilot.add(gR);
	
	const gL = gR.clone();
	gL.position.z = -2.5;
	pilot.add(gL);
	
	// Bufanda
	const scarfMat = new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true });
	const scarf = new THREE.Mesh(new THREE.BoxGeometry(9, 3, 9), scarfMat);
	scarf.position.y = 11;
	pilot.add(scarf);
	
	// Brazo Izquierdo
	this.leftArm = new THREE.Object3D();
	const armGeom = new THREE.BoxGeometry(3, 10, 3);
	const armMat = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
	const lArmMesh = new THREE.Mesh(armGeom, armMat);
	lArmMesh.position.y = -5;
	this.leftArm.add(lArmMesh);
	this.leftArm.position.set(0, 12, -6);
	pilot.add(this.leftArm);
	
	// Brazo Derecho
	this.rightArmDance = new THREE.Object3D();
	const rArmMesh = new THREE.Mesh(armGeom, armMat);
	rArmMesh.position.y = -5;
	this.rightArmDance.add(rArmMesh);
	this.rightArmDance.position.set(0, 12, 6);
	pilot.add(this.rightArmDance);
	
	// Pierna Izquierda
	this.leftLeg = new THREE.Object3D();
	const legGeom = new THREE.BoxGeometry(3, 10, 4);
	const legMat = new THREE.MeshPhongMaterial({ color: 0x333366, flatShading: true });
	const lLegMesh = new THREE.Mesh(legGeom, legMat);
	lLegMesh.position.y = -5;
	this.leftLeg.add(lLegMesh);
	this.leftLeg.position.set(0, 0, -2);
	pilot.add(this.leftLeg);
	
	// Pierna Derecha
	this.rightLeg = new THREE.Object3D();
	const rLegMesh = new THREE.Mesh(legGeom, legMat);
	rLegMesh.position.y = -5;
	this.rightLeg.add(rLegMesh);
	this.rightLeg.position.set(0, 0, 2);
	pilot.add(this.rightLeg);
	
	// Sonrisa
	const smileGeom = new THREE.BoxGeometry(1, 1, 4);
	const smileMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
	const smile = new THREE.Mesh(smileGeom, smileMat);
	smile.position.set(4.5, 14, 0);
	pilot.add(smile);
	
	return pilot;
};

// --- Crear la perrita Dulce ---
VictoryScene.prototype._createDog = function() {
	const dog = new THREE.Object3D();
	
	// Cuerpo
	const bodyGeom = new THREE.BoxGeometry(14, 8, 8);
	const bodyMat = new THREE.MeshPhongMaterial({ color: 0xc49a6c, flatShading: true }); // Color café claro
	const body = new THREE.Mesh(bodyGeom, bodyMat);
	body.position.y = 6;
	dog.add(body);
	
	// Cabeza
	const headGeom = new THREE.BoxGeometry(7, 7, 7);
	const head = new THREE.Mesh(headGeom, bodyMat);
	head.position.set(8, 9, 0);
	dog.add(head);
	
	// Hocico
	const snoutGeom = new THREE.BoxGeometry(4, 3, 5);
	const snoutMat = new THREE.MeshPhongMaterial({ color: 0xd4a574, flatShading: true });
	const snout = new THREE.Mesh(snoutGeom, snoutMat);
	snout.position.set(12, 7.5, 0);
	dog.add(snout);
	
	// Nariz
	const noseGeom = new THREE.BoxGeometry(2, 2, 2);
	const noseMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
	const nose = new THREE.Mesh(noseGeom, noseMat);
	nose.position.set(14.5, 8.5, 0);
	dog.add(nose);
	
	// Ojos
	const eyeGeom = new THREE.BoxGeometry(1.5, 2, 2);
	const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
	const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
	eyeR.position.set(11, 11, 2.5);
	dog.add(eyeR);
	const eyeL = eyeR.clone();
	eyeL.position.z = -2.5;
	dog.add(eyeL);
	
	// Orejas caídas
	this.earR = new THREE.Object3D();
	const earGeom = new THREE.BoxGeometry(2, 5, 3);
	const earMat = new THREE.MeshPhongMaterial({ color: 0x8B6914, flatShading: true });
	const earMeshR = new THREE.Mesh(earGeom, earMat);
	earMeshR.position.y = -2.5;
	this.earR.add(earMeshR);
	this.earR.position.set(7, 13, 4);
	this.earR.rotation.z = 0.3;
	dog.add(this.earR);
	
	this.earL = new THREE.Object3D();
	const earMeshL = new THREE.Mesh(earGeom, earMat);
	earMeshL.position.y = -2.5;
	this.earL.add(earMeshL);
	this.earL.position.set(7, 13, -4);
	this.earL.rotation.z = 0.3;
	dog.add(this.earL);
	
	// Cola meneando
	this.tail = new THREE.Object3D();
	const tailGeom = new THREE.CylinderGeometry(1, 0.5, 10, 4);
	const tailMesh = new THREE.Mesh(tailGeom, bodyMat);
	tailMesh.position.y = 5;
	this.tail.add(tailMesh);
	this.tail.position.set(-8, 8, 0);
	this.tail.rotation.z = -0.5;
	dog.add(this.tail);
	
	// Patas
	const pawGeom = new THREE.CylinderGeometry(1.5, 1.5, 6, 4);
	const pawMat = new THREE.MeshPhongMaterial({ color: 0xc49a6c, flatShading: true });
	for (let pos of [{x: 5, z: 3}, {x: 5, z: -3}, {x: -5, z: 3}, {x: -5, z: -3}]) {
		const paw = new THREE.Mesh(pawGeom, pawMat);
		paw.position.set(pos.x, 0, pos.z);
		dog.add(paw);
	}
	
	return dog;
};

// --- Crear una nube ---
VictoryScene.prototype._createCloud = function() {
	const cloud = new THREE.Object3D();
	const cloudMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
	
	const nBlobs = 3 + Math.floor(Math.random() * 3);
	for (let i = 0; i < nBlobs; i++) {
		const blobGeom = new THREE.DodecahedronGeometry(15 + Math.random() * 10, 0);
		const blob = new THREE.Mesh(blobGeom, cloudMat);
		blob.position.set(
			i * 20 - (nBlobs * 10),
			Math.random() * 8,
			Math.random() * 8
		);
		cloud.add(blob);
	}
	
	return cloud;
};

// --- Crear una mariposa ---
VictoryScene.prototype._createButterfly = function(color) {
	const butterfly = new THREE.Object3D();
	
	const bodyGeom = new THREE.CylinderGeometry(0.5, 0.5, 4, 4);
	const bodyMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
	const body = new THREE.Mesh(bodyGeom, bodyMat);
	body.rotation.z = Math.PI / 2;
	butterfly.add(body);
	
	const wingGeom = new THREE.PlaneGeometry(5, 4);
	const wingMat = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
	
	this.wingR = new THREE.Mesh(wingGeom, wingMat);
	this.wingR.position.set(0, 2.5, 0);
	butterfly.add(this.wingR);
	butterfly.userData.wingR = this.wingR;
	
	this.wingL = new THREE.Mesh(wingGeom, wingMat);
	this.wingL.position.set(0, -2.5, 0);
	butterfly.add(this.wingL);
	butterfly.userData.wingL = this.wingL;
	
	return butterfly;
};

// --- ACTIVAR ESCENA ---
VictoryScene.prototype.activate = function() {
	this.mesh.visible = true;
	this.timer = 0;
	this.mesh.position.set(0, 0, 0);
};

// --- DESACTIVAR ESCENA ---
VictoryScene.prototype.deactivate = function() {
	this.mesh.visible = false;
};

VictoryScene.prototype.update = function() {
	if (!this.mesh.visible) return;
	
	this.timer += 0.016; // ~60fps
	const t = this.timer;
	
	// Piloto bailando salsa
	if (this.dancer) {
		// Movimiento de cadera (rotación Y oscilatoria)
		this.dancer.rotation.y = Math.sin(t * 4) * 0.4;
		// Rebote vertical (sube y baja bailando, base Y = 20)
		this.dancer.position.y = 20 + Math.abs(Math.sin(t * 6)) * 5;
		// Rotación del torso
		this.dancer.rotation.z = Math.sin(t * 3) * 0.15;
		
		// Brazos bailando
		if (this.leftArm) {
			this.leftArm.rotation.z = Math.sin(t * 4) * 1.0 + 0.5;
			this.leftArm.rotation.x = Math.cos(t * 3) * 0.3;
		}
		if (this.rightArmDance) {
			this.rightArmDance.rotation.z = -Math.sin(t * 4) * 1.0 - 0.5;
			this.rightArmDance.rotation.x = -Math.cos(t * 3) * 0.3;
		}
		
		// Piernas alternando
		if (this.leftLeg) {
			this.leftLeg.rotation.x = Math.sin(t * 4) * 0.5;
		}
		if (this.rightLeg) {
			this.rightLeg.rotation.x = -Math.sin(t * 4) * 0.5;
		}
	}
	
	// Dulce meneando la cola y las orejas
	if (this.dulce) {
		if (this.tail) {
			this.tail.rotation.x = Math.sin(t * 10) * 0.6;
		}
		if (this.earR) {
			this.earR.rotation.x = Math.sin(t * 5) * 0.2;
		}
		if (this.earL) {
			this.earL.rotation.x = -Math.sin(t * 5) * 0.2;
		}
		// Dulce rebota contenta (base Y = 15)
		this.dulce.position.y = 15 + Math.abs(Math.sin(t * 8)) * 3;
	}
	
	// Avioneta del banner volando en línea recta
	if (this.bannerPlane) {
		this.bannerPlane.position.x += 1.5; // Vuela de izquierda a derecha
		if (this.bannerPlane.position.x > 800) {
			this.bannerPlane.position.x = -800;
		}
		this.bannerPlane.position.y = 100 + Math.sin(t * 1.5) * 10;
		// Su rotación.y ya está en 0 (apuntando hacia +X)
		
		// Animar la hélice del bannerPlaneObj
		if (this.bannerPlaneObj && this.bannerPlaneObj.propeller) {
			this.bannerPlaneObj.propeller.rotation.x += 0.6;
		}
		
		// Banner oscila un poco
		if (this.banner) {
			this.banner.rotation.z = Math.sin(t * 2) * 0.05;
		}
	}
	
	// Propeller del avión estacionado (gira lento, apagado)
	if (this.parkedPlaneObj && this.parkedPlaneObj.propeller) {
		this.parkedPlaneObj.propeller.rotation.x += 0.01;
	}
	
	// Mariposas volando
	for (let butterfly of this.butterflies) {
		const d = butterfly.userData;
		butterfly.position.x = d.baseX + Math.sin(t * d.speed + d.phase) * 50;
		butterfly.position.y = d.baseY + Math.sin(t * d.speed * 1.5 + d.phase) * 20;
		butterfly.position.z = d.baseZ + Math.cos(t * d.speed * 0.8 + d.phase) * 30;
		butterfly.rotation.y = Math.sin(t * d.speed + d.phase) * 0.5;
		
		if (butterfly.userData.wingR) {
			butterfly.userData.wingR.rotation.x = Math.sin(t * 15 + d.phase) * 0.8;
		}
		if (butterfly.userData.wingL) {
			butterfly.userData.wingL.rotation.x = -Math.sin(t * 15 + d.phase) * 0.8;
		}
	}
};
