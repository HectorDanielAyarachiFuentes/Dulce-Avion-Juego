/**
 * AI SUMMARY: Captives (humans, cows, goats) that fall with a parachute and can be rescued.
 */
import { Colors } from '../utils/colors.js';

export const Captive = function(type) {
	this.mesh = new THREE.Object3D();
	this.type = type; // 'cow', 'goat', 'human'
	this.active = true;
	this.speedY = 0;
	this.isFalling = false;
	this.time = Math.random() * 100; // Para desfasar animaciones
	
	const mat = new THREE.MeshPhongMaterial({ flatShading: true });
	
	// Crear el modelo animable
	this.bodyParts = new THREE.Object3D();
	
	if (type === 'cow') {
		mat.color.setHex(Colors.white);
		const body = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 4), mat);
		// Manchas negras (simplificado)
		const spotMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
		const spot = new THREE.Mesh(new THREE.BoxGeometry(2, 4.2, 2), spotMat);
		body.add(spot);
		
		// Patas
		this.leg1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1.5), spotMat);
		this.leg1.position.set(-2, -2, 1);
		this.leg2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1.5), spotMat);
		this.leg2.position.set(2, -2, 1);
		this.leg3 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1.5), spotMat);
		this.leg3.position.set(-2, -2, -1);
		this.leg4 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1.5), spotMat);
		this.leg4.position.set(2, -2, -1);
		
		const head = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), mat);
		head.position.set(-4, 2, 0);
		
		this.bodyParts.add(body);
		this.bodyParts.add(head);
		this.bodyParts.add(this.leg1, this.leg2, this.leg3, this.leg4);
		
	} else if (type === 'goat') {
		// Cabra
		mat.color.setHex(0xaaaaaa); // Gris
		const body = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 3), mat);
		
		const hornMat = new THREE.MeshPhongMaterial({ color: 0xdddddd });
		const head = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2.5), mat);
		head.position.set(-3, 2, 0);
		
		const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 4), hornMat);
		horn1.position.set(-0.5, 1.5, 0.8);
		horn1.rotation.z = -0.5;
		const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 4), hornMat);
		horn2.position.set(-0.5, 1.5, -0.8);
		horn2.rotation.z = -0.5;
		head.add(horn1, horn2);
		
		this.leg1 = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), hornMat);
		this.leg1.position.set(-1.5, -1.5, 0.8);
		this.leg2 = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), hornMat);
		this.leg2.position.set(1.5, -1.5, 0.8);
		this.leg3 = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), hornMat);
		this.leg3.position.set(-1.5, -1.5, -0.8);
		this.leg4 = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), hornMat);
		this.leg4.position.set(1.5, -1.5, -0.8);
		
		this.bodyParts.add(body);
		this.bodyParts.add(head);
		this.bodyParts.add(this.leg1, this.leg2, this.leg3, this.leg4);
		
	} else { // Human
		mat.color.setHex(Colors.pink); // Piel
		const head = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), mat);
		head.position.y = 3;
		
		const bodyMat = new THREE.MeshPhongMaterial({ color: Colors.blue, flatShading: true }); // Camisa
		const body = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 3), bodyMat);
		
		const armMat = new THREE.MeshPhongMaterial({ color: Colors.pink, flatShading: true });
		this.arm1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4, 1.5), armMat);
		this.arm1.position.set(-3, 1, 0);
		// Cambiamos el pivote para que rote desde el hombro
		this.arm1.geometry.translate(0, -2, 0); 
		this.arm1.position.y += 2;

		this.arm2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4, 1.5), armMat);
		this.arm2.position.set(3, 1, 0);
		this.arm2.geometry.translate(0, -2, 0);
		this.arm2.position.y += 2;
		
		const legMat = new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true }); // Pantalón
		this.leg1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4, 1.5), legMat);
		this.leg1.position.set(-1, -2, 0);
		this.leg1.geometry.translate(0, -2, 0);
		
		this.leg2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4, 1.5), legMat);
		this.leg2.position.set(1, -2, 0);
		this.leg2.geometry.translate(0, -2, 0);
		
		this.bodyParts.add(head);
		this.bodyParts.add(body);
		this.bodyParts.add(this.arm1, this.arm2);
		this.bodyParts.add(this.leg1, this.leg2);
	}
	
	this.mesh.add(this.bodyParts);
	
	// Paracaídas (Mejorado)
	this.parachute = new THREE.Object3D();
	
	// Campana del paracaídas (semiesfera más detallada y vistosa)
	const chuteGeom = new THREE.SphereGeometry(10, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
	const chuteMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true, side: THREE.DoubleSide });
	const chute = new THREE.Mesh(chuteGeom, chuteMat);
	chute.position.y = 15;
	
	// Cuerdas (8 cuerdas rodeando la campana)
	const lineMat = new THREE.LineBasicMaterial({ color: 0xeeeeee });
	const createLine = (x, z) => {
		const pts = [new THREE.Vector3(0, 3, 0), new THREE.Vector3(x, 15, z)];
		return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
	};
	
	this.parachute.add(chute);
	this.parachute.add(createLine(-9, 0));
	this.parachute.add(createLine(9, 0));
	this.parachute.add(createLine(0, 9));
	this.parachute.add(createLine(0, -9));
	this.parachute.add(createLine(-6, -6));
	this.parachute.add(createLine(6, 6));
	this.parachute.add(createLine(-6, 6));
	this.parachute.add(createLine(6, -6));
	
	this.parachute.visible = false;
	this.mesh.add(this.parachute);
};

Captive.prototype.drop = function() {
	this.isFalling = true;
	this.parachute.visible = true;
};

Captive.prototype.update = function() {
	this.time += 0.1;
	
	if (this.isFalling) {
		this.speedY -= 0.05; 
		if (this.speedY < -1.5) this.speedY = -1.5; 
		this.mesh.position.y += this.speedY;
		this.mesh.position.x -= 1.5; // Arrastrado por el viento
		
		// Oscilación del paracaídas y del cautivo
		this.mesh.rotation.z = Math.sin(this.time * 0.5) * 0.3;
		this.mesh.rotation.x = Math.cos(this.time * 0.3) * 0.2;
		
		// Animación de pánico (pataleo y manoteo)
		if (this.type === 'human') {
			this.arm1.rotation.z = Math.PI + Math.sin(this.time * 2) * 0.5; // Brazos arriba pidiendo ayuda
			this.arm2.rotation.z = -Math.PI - Math.sin(this.time * 2.1) * 0.5;
			this.leg1.rotation.x = Math.sin(this.time * 3) * 0.5; // Pataleo
			this.leg2.rotation.x = Math.sin(this.time * 3.1) * 0.5;
		} else {
			// Animales pataleando
			this.leg1.rotation.z = Math.sin(this.time * 2) * 0.4;
			this.leg2.rotation.z = -Math.sin(this.time * 2.2) * 0.4;
			this.leg3.rotation.z = Math.sin(this.time * 2.1) * 0.4;
			this.leg4.rotation.z = -Math.sin(this.time * 2.3) * 0.4;
		}
		
		if (this.mesh.position.y < -50 || this.mesh.position.x < -150) {
			this.active = false;
		}
	} else {
		// Colgando de la nave abducidos
		if (this.type === 'human') {
			this.arm1.rotation.z = Math.PI; 
			this.arm2.rotation.z = -Math.PI;
			this.leg1.rotation.x = Math.sin(this.time * 0.5) * 0.2; // Balanceo suave
			this.leg2.rotation.x = -Math.sin(this.time * 0.5) * 0.2;
		} else {
			this.leg1.rotation.z = Math.sin(this.time * 0.5) * 0.1;
			this.leg2.rotation.z = -Math.sin(this.time * 0.5) * 0.1;
			this.leg3.rotation.z = Math.sin(this.time * 0.5) * 0.1;
			this.leg4.rotation.z = -Math.sin(this.time * 0.5) * 0.1;
		}
	}
};
