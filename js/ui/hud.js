import { Colors } from '../utils/colors.js';

function createTextSprite(message, color) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = 512;
	canvas.height = 128;
	context.font = "Bold 50px Arial";
	context.fillStyle = color;
	context.fillText(message, 0, 80);
	
	const texture = new THREE.CanvasTexture(canvas);
	const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
	const geometry = new THREE.PlaneGeometry(20, 5);
	const mesh = new THREE.Mesh(geometry, material);
	return mesh;
}

export const HUD = {
	mesh: null,
	missiles: [],
	heatBarScale: null,
	heatBarMat: null,
	energyBarScale: null,
	energyBarMat: null,
	scoreSprite: null,
	scoreCanvasCtx: null,
	scoreTexture: null,
	activeMat: null,
	gearMesh: null,

	init: function(camera) {
		this.mesh = new THREE.Object3D();
		this.mesh.position.set(0, 0, -100);
		
		// HUD Panel Background (Más ancho y metálico estilo low-poly)
		const panelGeom = new THREE.BoxGeometry(100, 26, 0.5);
		const panelMat = new THREE.MeshPhongMaterial({ color: 0x4a555c, flatShading: true });
		const panel = new THREE.Mesh(panelGeom, panelMat);
		panel.position.set(0, 0, -2);
		this.mesh.add(panel);

		const frameGeom = new THREE.BoxGeometry(102, 28, 0.2);
		const frameMat = new THREE.MeshPhongMaterial({ color: 0x2a353c, flatShading: true });
		const frame = new THREE.Mesh(frameGeom, frameMat);
		frame.position.set(0, 0, -2.5);
		this.mesh.add(frame);
		
		// Tornillos estilo industrial
		const boltGeom = new THREE.CylinderGeometry(1.2, 1.2, 1, 6);
		const boltMat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true });
		const positions = [[-47, 11], [47, 11], [-47, -11], [47, -11]];
		positions.forEach(pos => {
			const bolt = new THREE.Mesh(boltGeom, boltMat);
			bolt.rotation.x = Math.PI / 2;
			bolt.position.set(pos[0], pos[1], -1.5);
			this.mesh.add(bolt);
		});
		
		// Inclinación 3D del tablero
		this.mesh.rotation.y = 0.1;
		this.mesh.rotation.x = 0.05;
		this.mesh.rotation.z = -0.02;

		// --- ROW 1: SCORE (Y = 8) ---
		const sCanvas = document.createElement('canvas');
		this.scoreCanvasCtx = sCanvas.getContext('2d');
		sCanvas.width = 512;
		sCanvas.height = 128;
		this.scoreTexture = new THREE.CanvasTexture(sCanvas);
		const sMat = new THREE.MeshBasicMaterial({ map: this.scoreTexture, transparent: true });
		const sGeom = new THREE.PlaneGeometry(30, 7);
		this.scoreSprite = new THREE.Mesh(sGeom, sMat);
		this.scoreSprite.position.set(-15, 8, 0); // Movido más a la derecha
		this.mesh.add(this.scoreSprite);
		this.updateScore(0);
		
		// --- ROW 2: ENERGÍA / VIDA (Y = 2) ---
		this.healthIcon = this.createHealthIcon();
		this.healthIcon.position.set(-30, 2, 1);
		this.mesh.add(this.healthIcon);

		const energyBgGeom = new THREE.BoxGeometry(30, 3, 0.5);
		const energyBgMat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true });
		const energyBg = new THREE.Mesh(energyBgGeom, energyBgMat);
		energyBg.position.set(-7, 2, -0.5);
		this.mesh.add(energyBg);
		
		const energyBarGeom = new THREE.BoxGeometry(29, 2, 0.5);
		this.energyBarMat = new THREE.MeshPhongMaterial({ color: Colors.green, flatShading: true });
		const energyBar = new THREE.Mesh(energyBarGeom, this.energyBarMat);
		energyBar.geometry.translate(14.5, 0, 0); // Eje a la izquierda
		energyBar.position.set(-21.5, 2, 0);
		this.energyBarScale = energyBar;
		this.mesh.add(energyBar);
		
		// --- ROW 3: MISILES (Y = -4) ---
		this.missileIcon = this.createMissileIcon();
		this.missileIcon.position.set(-30, -4, 1);
		this.mesh.add(this.missileIcon);
		
		const missileGeom = new THREE.BoxGeometry(2.5, 2.5, 2.5);
		this.activeMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
		this.inactiveMat = new THREE.MeshPhongMaterial({ color: Colors.grey, flatShading: true });
		for(let i=0; i<8; i++) {
			const m = new THREE.Mesh(missileGeom, this.activeMat);
			m.position.set(-19 + (i * 3.5), -4, 0);
			this.mesh.add(m);
			this.missiles.push(m);
		}
		
		// --- ROW 4: ARMA CALENTAMIENTO (Y = -10) ---
		this.gunIcon = this.createGunIcon();
		this.gunIcon.position.set(-30, -10, 1);
		this.mesh.add(this.gunIcon);
		
		const bgGeom = new THREE.BoxGeometry(30, 2, 1);
		const bgBar = new THREE.Mesh(bgGeom, energyBgMat);
		bgBar.position.set(-7, -10, -0.5);
		this.mesh.add(bgBar);
		
		const fillGeom = new THREE.BoxGeometry(29, 1.5, 1.5);
		fillGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(14.5, 0, 0));
		this.heatBarMat = new THREE.MeshPhongMaterial({ color: Colors.greenDark, flatShading: true });
		this.heatBarScale = new THREE.Mesh(fillGeom, this.heatBarMat);
		this.heatBarScale.position.set(-21.5, -10, 0);
		this.heatBarScale.scale.x = 0.001; 
		this.mesh.add(this.heatBarScale);
		
		camera.add(this.mesh);

		// ==========================================
		// ENGRANAJE 3D (SETTINGS ICON) EN LA ESQUINA
		// ==========================================
		this.gearMesh = new THREE.Object3D();
		
		const gearGeom = new THREE.CylinderGeometry(2.5, 2.5, 1, 16);
		const gearMat = new THREE.MeshPhongMaterial({ color: Colors.grey, flatShading: true });
		const gearCenter = new THREE.Mesh(gearGeom, gearMat);
		gearCenter.rotation.x = Math.PI / 2;
		this.gearMesh.add(gearCenter);
		
		// Dientes del engranaje
		for(let i=0; i<8; i++){
			const tooth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1), gearMat);
			tooth.position.x = Math.cos(i * Math.PI/4) * 2.8;
			tooth.position.y = Math.sin(i * Math.PI/4) * 2.8;
			this.gearMesh.add(tooth);
		}
		
		// Hueco del centro simulado con un cilindro oscuro
		const hole = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.2, 12), new THREE.MeshPhongMaterial({color: 0x222222}));
		hole.rotation.x = Math.PI / 2;
		this.gearMesh.add(hole);

		camera.add(this.gearMesh);
	},

	updateAmmo: function(currentAmmo) {
		for (let i = 0; i < 8; i++) {
			if (i < currentAmmo) {
				this.missiles[i].material = this.activeMat;
			} else {
				this.missiles[i].material = this.inactiveMat;
			}
		}
	},
	
	updateHeat: function(heatLevel, isOverheated) {
		if (this.heatBarScale) {
			let s = heatLevel / 100;
			if (s <= 0) s = 0.001;
			if (s > 1) s = 1;
			this.heatBarScale.scale.x = s;
			
			if (isOverheated) {
				if (Date.now() % 400 < 200) {
					this.heatBarMat.color.setHex(Colors.red);
				} else {
					this.heatBarMat.color.setHex(Colors.brownDark);
				}
			} else {
				if (heatLevel > 70) {
					this.heatBarMat.color.setHex(Colors.red);
				} else if (heatLevel > 40) {
					this.heatBarMat.color.setHex(Colors.yellow);
				} else {
					this.heatBarMat.color.setHex(Colors.greenDark);
				}
			}
		}
	},

	updateScore: function(score) {
		const ctx = this.scoreCanvasCtx;
		ctx.clearRect(0, 0, 512, 128);
		ctx.font = "Bold 60px Arial";
		ctx.fillStyle = "#f25346"; 
		ctx.fillText("SCORE", 30, 80);
		ctx.fillStyle = "#ffffff";
		ctx.fillText(score.toString().padStart(6, '0'), 280, 80);
		this.scoreTexture.needsUpdate = true;
	},
	
	updateEnergy: function(energyPercentage) { 
		const scale = Math.max(0.01, energyPercentage / 100);
		this.energyBarScale.scale.x = scale;
		if (energyPercentage > 60) {
			this.energyBarMat.color.setHex(Colors.green);
		} else if (energyPercentage > 30) {
			this.energyBarMat.color.setHex(Colors.yellow);
		} else {
			this.energyBarMat.color.setHex(Colors.red);
		}
	},
	
	updatePosition: function(aspectRatio) {
		if (this.mesh) {
			const zDist = 100;
			const topY = zDist * 0.57735; // tan(30) = 0.57735
			const leftX = -topY * aspectRatio;
			
			const scale = 0.6; // Reducir el tamaño del panel
			this.mesh.scale.set(scale, scale, scale);
			
			// Ancho original 100, mitad 50. Escalado es 50 * scale. +15 de margen.
			const targetX = leftX + (50 * scale) + 15; 
			// Alto original 26, mitad 13. Escalado es 13 * scale
			const targetY = topY - (13 * scale) - 2;
			
			this.mesh.position.set(targetX, targetY, -zDist);
		}

		// Posicionar la tuerca en la esquina superior derecha
		if (this.gearMesh) {
			const zDist = 100;
			const topY = zDist * 0.57735;
			const rightX = topY * aspectRatio;
			
			const scale = 0.6; // Reducir la tuerca también
			this.gearMesh.scale.set(scale, scale, scale);
			
			this.gearMesh.position.set(rightX - (5 * scale) - 3, topY - (5 * scale) - 3, -zDist);
			// Rotarla un poco contínuamente
			this.gearMesh.rotation.z -= 0.01;
		}
	},
	
	addMiniPlane: function(miniMesh) {
		const frameGeom = new THREE.BoxGeometry(24, 24, 1);
		const frameMat = new THREE.MeshPhongMaterial({ color: 0x1a252f, flatShading: true });
		const frame = new THREE.Mesh(frameGeom, frameMat);
		frame.position.set(33, -1, 0);
		this.mesh.add(frame);
		
		const bgGeom = new THREE.BoxGeometry(22, 22, 1);
		this.miniBgMat = new THREE.MeshPhongMaterial({ color: 0xf7d9aa, flatShading: true });
		const bg = new THREE.Mesh(bgGeom, this.miniBgMat);
		bg.position.set(33, -1, 0.5);
		this.mesh.add(bg);

		this.miniPlane = miniMesh;
		this.miniPlane.scale.set(0.12, 0.12, 0.12);
		this.miniPlane.position.set(33, -1, 6); // Destacar desde el fondo
		
		// Destello de disparo (Sphere)
		this.miniFlashMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0 });
		const flashGeom = new THREE.SphereGeometry(20, 8, 8);
		this.miniFlash = new THREE.Mesh(flashGeom, this.miniFlashMat);
		this.miniFlash.position.set(65, -10, 0); // Frente al cañón (posición local)
		this.miniPlane.add(this.miniFlash);
		
		this.mesh.add(this.miniPlane);
	},
	
	updateMiniPlane: function(mainAirplane) {
		if (!this.miniPlane) return;
		this.miniPlane.rotation.copy(mainAirplane.mesh.rotation);
		
		// Rotar también la hélice del mini avión
		this.miniPlane.children.forEach(child => {
			if (child.position.x === 50 && child.position.y === 0) { 
				child.rotation.x = mainAirplane.propeller.rotation.x;
			}
		});
		
		// Rotar los iconos 3D
		if (this.healthIcon) this.healthIcon.rotation.y += 0.03;
		if (this.missileIcon) {
			this.missileIcon.rotation.x += 0.05;
			this.missileIcon.rotation.y += 0.02;
		}
		if (this.gunIcon) {
			this.gunIcon.rotation.x -= 0.05;
			this.gunIcon.rotation.y += 0.02;
		}
		
		// Decaer el destello
		if (this.miniFlashMat && this.miniFlashMat.opacity > 0) {
			this.miniFlashMat.opacity -= 0.1;
		}
	},
	
	updateMiniPlaneBgColor: function(hexColor) {
		if (this.miniBgMat) {
			this.miniBgMat.color.setHex(hexColor);
		}
	},
	
	showMiniFlash: function(colorHex) {
		if (this.miniFlashMat) {
			this.miniFlashMat.color.setHex(colorHex || 0xffff00);
			this.miniFlashMat.opacity = 1.0;
		}
	},
	
	createHealthIcon: function() {
		const icon = new THREE.Object3D();
		const mat = new THREE.MeshPhongMaterial({ color: Colors.green, flatShading: true });
		const m1 = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 1), mat);
		const m2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 1), mat);
		icon.add(m1);
		icon.add(m2);
		return icon;
	},
	
	createMissileIcon: function() {
		const icon = new THREE.Object3D();
		const bodyMat = new THREE.MeshPhongMaterial({ color: Colors.grey, flatShading: true });
		const headMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
		
		const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3, 8), bodyMat);
		body.rotation.z = Math.PI / 2;
		
		const head = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.5, 8), headMat);
		head.rotation.z = -Math.PI / 2;
		head.position.x = 2.25;
		
		const finGeom = new THREE.BoxGeometry(1.5, 3, 0.2);
		const fins = new THREE.Mesh(finGeom, headMat);
		fins.position.x = -1;
		
		icon.add(body);
		icon.add(head);
		icon.add(fins);
		
		icon.scale.set(0.9, 0.9, 0.9);
		return icon;
	},
	
	createGunIcon: function() {
		const icon = new THREE.Object3D();
		const mat = new THREE.MeshPhongMaterial({ color: Colors.yellow, flatShading: true });
		
		const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3, 8), mat);
		body.rotation.z = Math.PI / 2;
		
		const tip = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 8), mat);
		tip.rotation.z = -Math.PI / 2;
		tip.position.x = 2.25;
		
		icon.add(body);
		icon.add(tip);
		icon.scale.set(0.9, 0.9, 0.9);
		return icon;
	}
};
