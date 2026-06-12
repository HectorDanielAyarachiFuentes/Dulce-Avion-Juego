import { Colors } from '../utils/colors.js';

export const AlienLaser = function(x, y, z) {
	this.mesh = new THREE.Object3D();
	const geom = new THREE.CylinderGeometry(0.5, 0.5, 8, 4);
	geom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
	const mat = new THREE.MeshBasicMaterial({ color: Colors.green });
	const body = new THREE.Mesh(geom, mat);
	this.mesh.add(body);
	this.mesh.position.set(x, y, z);
	this.speed = -15; // Mueve hacia la izquierda (hacia el avión)
	this.active = true;
};

AlienLaser.prototype.update = function() {
	this.mesh.position.x += this.speed;
	if (this.mesh.position.x < -150) {
		this.active = false;
	}
};

export const AlienBomb = function(x, y, z) {
	this.mesh = new THREE.Object3D();
	const geom = new THREE.SphereGeometry(2.5, 8, 8);
	const mat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true });
	const body = new THREE.Mesh(geom, mat);
	this.mesh.add(body);
	
	// Púas de la bomba
	const spikeGeom = new THREE.ConeGeometry(1, 3, 4);
	const spikeMat = new THREE.MeshPhongMaterial({ color: Colors.red });
	for (let i=0; i<6; i++) {
		const spike = new THREE.Mesh(spikeGeom, spikeMat);
		spike.position.y = 2.5;
		spike.rotation.x = Math.random() * Math.PI;
		spike.rotation.z = Math.random() * Math.PI;
		this.mesh.add(spike);
	}

	this.mesh.position.set(x, y, z);
	this.speedY = 0;
	this.speedX = -1; // Cae y avanza un poco hacia la izquierda
	this.active = true;
};

AlienBomb.prototype.update = function() {
	this.speedY -= 0.1; // Gravedad
	this.mesh.position.y += this.speedY;
	this.mesh.position.x += this.speedX;
	this.mesh.rotation.z += 0.1;
	
	if (this.mesh.position.y < -50 || this.mesh.position.x < -150) {
		this.active = false;
	}
};

export const Captive = function(type) {
	this.mesh = new THREE.Object3D();
	this.type = type; // 'cow' o 'human'
	this.active = true;
	this.speedY = 0;
	this.isFalling = false;
	
	const mat = new THREE.MeshPhongMaterial({ flatShading: true });
	
	if (type === 'cow') {
		mat.color.setHex(Colors.white);
		const body = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 4), mat);
		// Manchas negras (simplificado)
		const spotMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
		const spot = new THREE.Mesh(new THREE.BoxGeometry(2, 4.2, 2), spotMat);
		body.add(spot);
		this.mesh.add(body);
	} else {
		mat.color.setHex(Colors.pink);
		const head = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), mat);
		head.position.y = 3;
		const bodyMat = new THREE.MeshPhongMaterial({ color: Colors.blue, flatShading: true });
		const body = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 3), bodyMat);
		this.mesh.add(head);
		this.mesh.add(body);
	}
	
	// Paracaídas (invisible inicialmente)
	this.parachute = new THREE.Object3D();
	const chuteGeom = new THREE.SphereGeometry(8, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2);
	const chuteMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
	const chute = new THREE.Mesh(chuteGeom, chuteMat);
	chute.position.y = 10;
	
	const lineMat = new THREE.LineBasicMaterial({ color: Colors.white });
	const points1 = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-4, 10, 0)];
	const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points1), lineMat);
	const points2 = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 10, 0)];
	const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points2), lineMat);
	
	this.parachute.add(chute);
	this.parachute.add(line1);
	this.parachute.add(line2);
	this.parachute.visible = false;
	this.mesh.add(this.parachute);
};

Captive.prototype.drop = function() {
	this.isFalling = true;
	this.parachute.visible = true; // Abre el paracaídas
};

Captive.prototype.update = function() {
	if (this.isFalling) {
		this.speedY -= 0.05; // Gravedad suave por el paracaídas
		if (this.speedY < -1) this.speedY = -1; // Velocidad terminal baja
		this.mesh.position.y += this.speedY;
		this.mesh.position.x -= 2; // Arrastrado por el viento
		
		// Oscilación del paracaídas
		this.mesh.rotation.z = Math.sin(Date.now() * 0.005) * 0.2;
		
		if (this.mesh.position.y < -50 || this.mesh.position.x < -150) {
			this.active = false; // Ha caído y se salvó o salió de pantalla
		}
	}
};

export const Ufo = function(type = 'basic') {
	this.mesh = new THREE.Object3D();
	this.active = true;
	this.type = type;
	
	// Plato metálico
	const diskGeom = new THREE.CylinderGeometry(15, 15, 4, 12);
	let diskColor = Colors.grey;
	if (type === 'bomber') diskColor = 0x333333;
	const diskMat = new THREE.MeshPhongMaterial({ color: diskColor, flatShading: true });
	const disk = new THREE.Mesh(diskGeom, diskMat);
	
	// Cúpula de cristal
	const domeGeom = new THREE.SphereGeometry(8, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
	let domeColor = Colors.green;
	if (type === 'kamikaze') domeColor = Colors.red;
	else if (type === 'bomber') domeColor = Colors.yellow;
	const domeMat = new THREE.MeshPhongMaterial({ color: domeColor, transparent: true, opacity: 0.7, flatShading: true });
	const dome = new THREE.Mesh(domeGeom, domeMat);
	dome.position.y = 2;
	
	this.mesh.add(disk);
	this.mesh.add(dome);
	
	this.mesh.position.x = 200 + Math.random() * 50;
	this.mesh.position.z = 0; // Todos en el mismo plano Z
	this.angle = Math.random() * Math.PI * 2;
	
	if (type === 'kamikaze') {
		this.hitPoints = 1;
		this.speedX = -5 - Math.random() * 4; // Muy rápidos
		this.mesh.position.y = 20 + Math.random() * 120;
		this.mesh.scale.set(0.6, 0.6, 0.6); // Más pequeños
		this.captive = null; // Los kamikazes no llevan rehenes
	} else if (type === 'bomber') {
		this.hitPoints = 6; // Muy resistentes
		this.speedX = -1.5 - Math.random() * 1; // Lentos
		this.mesh.position.y = 100 + Math.random() * 100; // Vuelan alto
		this.mesh.scale.set(1.5, 1.5, 1.5); // Más grandes
		this.captive = null;
	} else {
		this.hitPoints = 3;
		this.speedX = -2.5 - Math.random() * 3;
		this.mesh.position.y = 20 + Math.random() * 120;
		if (Math.random() < 0.3) {
			this.captive = new Captive(Math.random() > 0.5 ? 'cow' : 'human');
			this.captive.mesh.position.y = -8;
			this.mesh.add(this.captive.mesh);
		} else {
			this.captive = null;
		}
	}
	
	this.lastShotTime = 0;
};

Ufo.prototype.update = function(time, planeY) {
	this.mesh.position.x += this.speedX;
	
	if (this.type === 'kamikaze') {
		// Persigue la Y del avión
		if (planeY !== undefined) {
			if (this.mesh.position.y > planeY) this.mesh.position.y -= 1.5;
			else if (this.mesh.position.y < planeY) this.mesh.position.y += 1.5;
		}
		this.mesh.rotation.z = -0.2; // Inclinados hacia adelante
	} else {
		// Movimiento oscilante (Hover)
		this.angle += 0.05;
		this.mesh.position.y += Math.sin(this.angle) * 0.5;
	}
	
	// Rotación sobre sí mismo
	this.mesh.rotation.y += 0.05;
	
	// Desactivar si sale de pantalla
	if (this.mesh.position.x < -150) {
		this.active = false;
	}
};

export const EnemyManager = function(scene) {
	this.scene = scene;
	this.ufos = [];
	this.lasers = [];
	this.bombs = []; // Add bombs
	this.fallingCaptives = [];
	this.spawnTimer = 0;
};

EnemyManager.prototype.spawnUfo = function(level = 1) {
	let type = 'basic';
	if (level >= 2 && Math.random() < 0.3) type = 'kamikaze';
	if (level >= 3 && Math.random() < 0.2) type = 'bomber';
	
	const ufo = new Ufo(type);
	this.scene.add(ufo.mesh);
	this.ufos.push(ufo);
};

EnemyManager.prototype.shootLaser = function(ufo) {
	const laser = new AlienLaser(ufo.mesh.position.x - 15, ufo.mesh.position.y, ufo.mesh.position.z);
	this.scene.add(laser.mesh);
	this.lasers.push(laser);
};

EnemyManager.prototype.dropBomb = function(ufo) {
	const bomb = new AlienBomb(ufo.mesh.position.x, ufo.mesh.position.y - 10, ufo.mesh.position.z);
	this.scene.add(bomb.mesh);
	this.bombs.push(bomb);
};

EnemyManager.prototype.update = function(time, planeY, currentLevel, onShootLaser) {
	this.spawnTimer++;
	const spawnRate = Math.max(40, 100 - (currentLevel * 10)); // Más rápido en niveles altos
	
	if (this.spawnTimer > spawnRate) { 
		this.spawnTimer = 0;
		if (Math.random() > 0.4) {
			this.spawnUfo(currentLevel);
		}
	}
	
	// Actualizar UFOs
	for (let i = this.ufos.length - 1; i >= 0; i--) {
		const ufo = this.ufos[i];
		ufo.update(time, planeY);
		
		if (ufo.type === 'basic') {
			if (time - ufo.lastShotTime > 1000) {
				if (Math.random() < 0.04 * currentLevel) {
					this.shootLaser(ufo);
					if (onShootLaser) onShootLaser();
					ufo.lastShotTime = time;
				}
			}
		} else if (ufo.type === 'bomber') {
			if (time - ufo.lastShotTime > 2000) { // Tira bombas
				if (Math.random() < 0.05) {
					this.dropBomb(ufo);
					ufo.lastShotTime = time;
				}
			}
		}
		
		if (!ufo.active) {
			this.scene.remove(ufo.mesh);
			this.ufos.splice(i, 1);
		}
	}
	
	// Actualizar Láseres
	for (let i = this.lasers.length - 1; i >= 0; i--) {
		const laser = this.lasers[i];
		laser.update();
		if (!laser.active) {
			this.scene.remove(laser.mesh);
			this.lasers.splice(i, 1);
		}
	}

	// Actualizar Bombas
	for (let i = this.bombs.length - 1; i >= 0; i--) {
		const bomb = this.bombs[i];
		bomb.update();
		if (!bomb.active) {
			this.scene.remove(bomb.mesh);
			this.bombs.splice(i, 1);
		}
	}
	
	// Actualizar Cautivos cayendo
	for (let i = this.fallingCaptives.length - 1; i >= 0; i--) {
		const cap = this.fallingCaptives[i];
		cap.update();
		if (!cap.active) {
			this.scene.remove(cap.mesh);
			this.fallingCaptives.splice(i, 1);
		}
	}
};

EnemyManager.prototype.releaseCaptive = function(ufo) {
	if (ufo.captive) {
		const cap = ufo.captive;
		// Quitar del UFO y añadir a la escena con la posición global
		ufo.mesh.remove(cap.mesh);
		const globalPos = new THREE.Vector3();
		ufo.mesh.getWorldPosition(globalPos);
		cap.mesh.position.copy(globalPos);
		cap.mesh.position.y -= 8;
		
		this.scene.add(cap.mesh);
		this.fallingCaptives.push(cap);
		cap.drop();
		return true; // Rescate iniciado
	}
	return false;
};
