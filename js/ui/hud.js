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
	activeMat: null,
	inactiveMat: null,

	init: function(camera) {
		this.mesh = new THREE.Object3D();
		
		// El posicionamiento ahora se hará dinámicamente en updatePosition()
		this.mesh.position.set(0, 0, -100);
		
		// HUD Panel Background (Contorno más proporcionado)
		const panelGeom = new THREE.BoxGeometry(56, 14, 0.5);
		const panelMat = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
		const panel = new THREE.Mesh(panelGeom, panelMat);
		panel.position.set(-3, -2, -2);
		this.mesh.add(panel);

		const frameGeom = new THREE.BoxGeometry(58, 16, 0.2);
		const frameMat = new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading: true });
		const frame = new THREE.Mesh(frameGeom, frameMat);
		frame.position.set(-3, -2, -2.5);
		this.mesh.add(frame);
		
		// Inclinación 3D para darle volumen de "tablero físico"
		this.mesh.rotation.y = 0.1;
		this.mesh.rotation.x = 0.05;
		this.mesh.rotation.z = -0.02;
		
		// Labels (Separación armónica vertical)
		const missileText = createTextSprite("MISILES", "white");
		missileText.position.set(-13, 1.5, 0);
		this.mesh.add(missileText);

		const gunText = createTextSprite("ARMA", "white");
		gunText.position.set(-13, -5.5, 0);
		this.mesh.add(gunText);
		
		// Miniature Icons
		const iconMissile = new THREE.Object3D();
		const mBodyGeom = new THREE.CylinderGeometry(0.5, 0.5, 4, 6);
		mBodyGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
		const mTipGeom = new THREE.ConeGeometry(0.5, 1.5, 6);
		mTipGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
		mTipGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(2.75, 0, 0));
		const mBody = new THREE.Mesh(mBodyGeom, new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true }));
		const mTip = new THREE.Mesh(mTipGeom, new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true }));
		iconMissile.add(mBody);
		iconMissile.add(mTip);
		iconMissile.position.set(-2, 1.5, 0);
		
		this.mesh.add(iconMissile);
		
		const iconGunGeom = new THREE.CylinderGeometry(0.5, 0.5, 4, 6);
		iconGunGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
		const iconGun = new THREE.Mesh(
			iconGunGeom,
			new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading: true })
		);
		iconGun.position.set(-2, -5.5, 0);
		this.mesh.add(iconGun);
		
		// Misiles (8 Cubes)
		const missileGeom = new THREE.BoxGeometry(2, 2, 2);
		this.activeMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
		this.inactiveMat = new THREE.MeshPhongMaterial({ color: Colors.grey, flatShading: true });
		
		for(let i=0; i<8; i++) {
			const m = new THREE.Mesh(missileGeom, this.activeMat);
			m.position.set(3 + (i * 3), 1.5, 0);
			this.mesh.add(m);
			this.missiles.push(m);
		}
		
		// Heat Bar Background
		const bgGeom = new THREE.BoxGeometry(23, 1, 1);
		const bgMat = new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading: true });
		const bgBar = new THREE.Mesh(bgGeom, bgMat);
		bgBar.position.set(13.5, -5.5, -0.5);
		this.mesh.add(bgBar);
		
		// Heat Bar Fill
		const fillGeom = new THREE.BoxGeometry(23, 1.5, 1.5);
		// Move origin to the left to scale correctly
		fillGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(11.5, 0, 0));
		
		this.heatBarMat = new THREE.MeshPhongMaterial({ color: Colors.greenDark, flatShading: true });
		this.heatBarScale = new THREE.Mesh(fillGeom, this.heatBarMat);
		this.heatBarScale.position.set(2, -5.5, 0);
		this.heatBarScale.scale.x = 0.001; 
		this.mesh.add(this.heatBarScale);
		
		camera.add(this.mesh);
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
				// Blink red when overheated
				if (Date.now() % 400 < 200) {
					this.heatBarMat.color.setHex(Colors.red);
				} else {
					this.heatBarMat.color.setHex(Colors.brownDark);
				}
			} else {
				// Color based on heat
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
	
	updatePosition: function(aspectRatio) {
		if (this.mesh) {
			const zDist = 100;
			// El campo de visión de la cámara es 60 grados.
			// La mitad es 30 grados. Math.tan(30 * PI / 180) = 0.57735
			const topY = zDist * 0.57735;
			const leftX = -topY * aspectRatio;
			
			// El centro del panel está en x=-2, y=-2. Su ancho es 48, alto 16.
			// Así que el borde izquierdo del panel está en -2 - 24 = -26.
			// El borde superior está en -2 + 8 = +6.
			// Para que el borde izquierdo toque leftX (más un margen de 2):
			const targetX = leftX + 26 + 2; 
			// Para que el borde superior toque topY (más un margen de 2):
			const targetY = topY - 6 - 2;
			
			this.mesh.position.set(targetX, targetY, -zDist);
		}
	}
};
