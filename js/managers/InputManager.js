/**
 * AI SUMMARY: Manages user inputs (mouse, touch, keyboard).
 */
import { GameState } from '../core/GameState.js';
import { normalize } from '../utils/math.js';

export const InputManager = {
	mousePos: { x: 0, y: 0 },
	keysDown: {},

	init: function(width, height, context) {
		this.screenWidth = width;
		this.screenHeight = height;
		this.context = context; // { camera, HUD, airplane, weaponManager, ... }

		document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
		document.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
		document.addEventListener('contextmenu', (e) => e.preventDefault(), false); // Prevent default context menu
		document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
		
		document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
		document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
		document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

		document.addEventListener('keydown', this.handleKeyDown.bind(this), false);
		document.addEventListener('keyup', this.handleKeyUp.bind(this), false);
	},

	updateSize: function(width, height) {
		this.screenWidth = width;
		this.screenHeight = height;
	},

	handleMouseMove: function(event) {
		if (GameState.gameState !== 'playing') return;
		let tx = -1 + (event.clientX / this.screenWidth) * 2;
		let ty = 1 - (event.clientY / this.screenHeight) * 2;
		this.mousePos = { x: tx, y: ty };
	},

	handleMouseDown: function(event) {
		if (GameState.gameState !== 'playing') return;
		if (event.target.tagName === 'BUTTON' || event.target.tagName === 'SELECT' || event.target.tagName === 'INPUT') return;

		import('../utils/audio.js').then(({ initAudio, playShootSound }) => {
			initAudio();
			
			const { camera, HUD, airplane, weaponManager } = this.context;
			
			const tx = -1 + (event.clientX / this.screenWidth) * 2;
			const ty = 1 - (event.clientY / this.screenHeight) * 2;
			const raycaster = new window.THREE.Raycaster();
			raycaster.setFromCamera({x: tx, y: ty}, camera);
			
			if (HUD.gearMesh) {
				const intersects = raycaster.intersectObject(HUD.gearMesh, true);
				if (intersects.length > 0) {
					const settingsModal = document.getElementById('settings-modal');
					settingsModal.classList.remove('hidden');
					GameState.gameState = 'paused';
					document.body.classList.remove('playing');
					// if (typeof initPreview === 'function') initPreview(); // We will handle this in main.js
					document.dispatchEvent(new Event('openSettings')); // Custom event
					return;
				}
			}
			
			if (event.button === 0) { // Left click
				if (!GameState.isOverheated) {
					GameState.isShootingMG = true;
				}
			} else if (event.button === 2) { // Right click
				const missileIndex = airplane.ammo - 1;
				if (airplane.fireMissile()) {
					playShootSound();
					HUD.updateAmmo(airplane.ammo);
					
					const p = airplane.mesh.position;
					const missileMesh = airplane.missileMeshes[missileIndex];
					const localZ = missileMesh.position.z;
					weaponManager.fireMissile(p.x + 10, p.y - 5, p.z + localZ);
					
					if (HUD.showMiniFlash) HUD.showMiniFlash(0xff8800);
				}
			}
		});
	},

	handleMouseUp: function() {
		GameState.isShootingMG = false;
	},

	handleTouchStart: function(event) {
		if (GameState.gameState !== 'playing') return;
		if (event.touches.length > 0) {
			const touch = event.touches[0];
			let tx = -1 + (touch.clientX / this.screenWidth) * 2;
			let ty = 1 - (touch.clientY / this.screenHeight) * 2;
			this.mousePos = { x: tx, y: ty };
			if (event.target.tagName !== 'BUTTON') {
				GameState.isShootingMG = true;
			}
		}
	},

	handleTouchMove: function(event) {
		if (event.touches.length > 0) {
			const touch = event.touches[0];
			let tx = -1 + (touch.clientX / this.screenWidth) * 2;
			let ty = 1 - (touch.clientY / this.screenHeight) * 2;
			this.mousePos = { x: tx, y: ty };
		}
	},

	handleTouchEnd: function() {
		GameState.isShootingMG = false;
	},

	handleKeyDown: function(event) {
		this.keysDown[event.code] = true;
		if (event.code === 'Space') {
			if (GameState.gameState === 'playing') {
				GameState.isShootingMG = true;
				event.preventDefault(); // Evitar scroll
			}
		}
	},

	handleKeyUp: function(event) {
		this.keysDown[event.code] = false;
		if (event.code === 'Space') {
			GameState.isShootingMG = false;
		}
	}
};
