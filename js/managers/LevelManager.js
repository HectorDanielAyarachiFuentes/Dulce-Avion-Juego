/**
 * AI SUMMARY: Manages level progression, environment colors, and the victory sequence.
 */
import { GameState } from '../core/GameState.js';
import { HUD } from '../ui/hud.js';
import { playSalsaSong, stopSalsaSong, playRadioTuningSound } from '../utils/audio.js';

export const LevelManager = {
	context: null,
	radioTimeoutId: null,
	bossTimeoutId: null,

	init: function(context) {
		// context contains references to scene, camera, airplane, mothership, victoryScene, etc.
		this.context = context;
	},

	checkLevelUp: function() {
		let newLevel = 1;
		if (GameState.score >= 2000) newLevel = 5;
		else if (GameState.score >= 1500) newLevel = 4;
		else if (GameState.score >= 1000) newLevel = 3;
		else if (GameState.score >= 500) newLevel = 2;
		
		if (newLevel > GameState.currentLevel) {
			GameState.currentLevel = newLevel;
			this.showLevelUpMessage();
			this.updateEnvironmentColor();
			
			if (GameState.currentLevel === 5) {
				this.startLevel5Sequence();
			}
		}
	},

	showLevelUpMessage: function() {
		const msgBox = document.getElementById('level-up-message');
		const levelText = document.getElementById('level-text');
		const levelSubtext = document.getElementById('level-subtext');
		
		levelText.innerText = "NIVEL " + GameState.currentLevel;
		if (GameState.currentLevel === 2) levelSubtext.innerText = "ATARDECER ROJO";
		if (GameState.currentLevel === 3) levelSubtext.innerText = "NOCHE OSCURA";
		if (GameState.currentLevel === 4) levelSubtext.innerText = "TORMENTA FINAL";
		if (GameState.currentLevel === 5) levelSubtext.innerText = "LA NODRIZA ALIENÍGENA";
		
		msgBox.classList.remove('hidden');
		setTimeout(() => {
			msgBox.classList.add('hidden');
		}, 3000);
	},

	updateEnvironmentColor: function() {
		const aviator = document.querySelector('.aviator');
		const { scene, ambientLight, hemisphereLight, sky, rain } = this.context;
		
		if (GameState.currentLevel === 1) { // Día Claro
			aviator.style.background = 'linear-gradient(#3b5764, #739aaf)';
			scene.fog.color.setHex(0xf7d9aa);
			ambientLight.color.setHex(0xdc8874);
			ambientLight.intensity = 0.5;
			hemisphereLight.intensity = 0.9;
			if (HUD.updateMiniPlaneBgColor) HUD.updateMiniPlaneBgColor(0x3b5764);
		} 
		else if (GameState.currentLevel === 2) { // Atardecer
			aviator.style.background = 'linear-gradient(#e44d2e, #f2a878)';
			scene.fog.color.setHex(0xf2a878);
			ambientLight.color.setHex(0xdc8874);
			ambientLight.intensity = 0.8;
			hemisphereLight.intensity = 0.6;
		} 
		else if (GameState.currentLevel === 3) { // Noche Oscura
			aviator.style.background = 'linear-gradient(#08131a, #1a2a36)';
			scene.fog.color.setHex(0x1a2a36);
			ambientLight.color.setHex(0x555577);
			ambientLight.intensity = 0.3;
			hemisphereLight.intensity = 0.3;
			if (HUD.updateMiniPlaneBgColor) HUD.updateMiniPlaneBgColor(0x08131a);
		} 
		else if (GameState.currentLevel === 4) { // Tormenta
			aviator.style.background = 'linear-gradient(#111111, #333333)';
			scene.fog.color.setHex(0x222222);
			ambientLight.color.setHex(0x444455);
			ambientLight.intensity = 0.2;
			hemisphereLight.intensity = 0.2;
		}
		else if (GameState.currentLevel === 5) { // Boss Noche Sangrienta
			aviator.style.background = 'linear-gradient(#330000, #110000)';
			scene.fog.color.setHex(0x330000);
			ambientLight.color.setHex(0xff3333);
			ambientLight.intensity = 0.5;
			hemisphereLight.intensity = 0.2;
			if (HUD.updateMiniPlaneBgColor) HUD.updateMiniPlaneBgColor(0x110000);
		}

		if (sky && sky.sun && sky.moon) {
			if (GameState.currentLevel === 1) {
				sky.sun.visible = true;
				sky.moon.visible = false;
				sky.sun.material.color.setHex(0xffd700);
			} else if (GameState.currentLevel === 2) {
				sky.sun.visible = true;
				sky.moon.visible = false;
				sky.sun.material.color.setHex(0xff5500);
			} else if (GameState.currentLevel === 3) {
				sky.sun.visible = false;
				sky.moon.visible = true;
				if (sky.moonMat) sky.moonMat.color.setHex(0xeef4f5);
			} else if (GameState.currentLevel === 4) {
				sky.sun.visible = false;
				sky.moon.visible = true;
				if (sky.moonMat) sky.moonMat.color.setHex(0x8899aa);
			}
		}
		
		import('../utils/audio.js').then(({ startRainSound, stopRainSound }) => {
			if (GameState.currentLevel === 4) {
				if (rain) rain.mesh.visible = true;
				startRainSound();
			} else {
				if (rain) rain.mesh.visible = false;
				stopRainSound();
			}
		});
	},

	clearLevel5Timeouts: function() {
		if (this.radioTimeoutId) clearTimeout(this.radioTimeoutId);
		if (this.bossTimeoutId) clearTimeout(this.bossTimeoutId);
		this.radioTimeoutId = null;
		this.bossTimeoutId = null;
	},

	startLevel5Sequence: function(skipAscent = false) {
		this.clearLevel5Timeouts();
		GameState.targetWorldY = -8000; // El mundo se hunde para simular vuelo a gran altitud
		
		const { airplane, mothership } = this.context;
		
		if (skipAscent) {
			airplane.isSearchingRadio = false;
			airplane.showMotivationAura = true;
			playSalsaSong();
			if (mothership) mothership.startBossFight(true);
			HUD.showBossUI();
			return;
		}
		
		airplane.isSearchingRadio = true;
		playRadioTuningSound();
		
		this.radioTimeoutId = setTimeout(() => {
			if (GameState.gameState !== 'welcome' && GameState.currentLevel === 5) {
				airplane.isSearchingRadio = false;
				airplane.showMotivationAura = true;
				playSalsaSong();
				
				this.bossTimeoutId = setTimeout(() => {
					if (GameState.gameState !== 'welcome' && GameState.currentLevel === 5) {
						if (mothership) mothership.startBossFight();
						HUD.showBossUI();
					}
				}, 20000);
			}
		}, 2000);
	},

	triggerVictory: function() {
		GameState.gameState = 'victory'; // Halt main game loop immediately!
		playSalsaSong(); // Reproducir la salsa de Marc Anthony en la escena de créditos
		
		const levelText = document.getElementById('level-text');
		const levelSubtext = document.getElementById('level-subtext');
		levelText.innerText = "¡VICTORIA!";
		levelSubtext.innerText = "LA TIERRA ESTÁ A SALVO";
		document.getElementById('level-up-message').classList.remove('hidden');
		
		const { victoryScene, airplane, mothership, enemyManager, weaponManager, camera, scene, bgBattle } = this.context;
		
		if (victoryScene) {
			victoryScene.activate();
			
			GameState.gameSpeed = 0;
			GameState.targetGameSpeed = 0;
			
			airplane.mesh.visible = false;
			if (mothership) mothership.mesh.visible = false;
			if (bgBattle) bgBattle.mesh.visible = false;
			HUD.hide();
			
			if (enemyManager) enemyManager.reset();
			if (weaponManager) weaponManager.projectiles = [];
			
			GameState.currentLevel = 1;
			this.updateEnvironmentColor();
			
			camera.position.set(100, 60, 120);
			camera.lookAt(10, 20, 0);
		}
		
		setTimeout(() => {
			document.getElementById('level-up-message').classList.add('hidden');
			document.getElementById('credits-screen').classList.remove('hidden');
			GameState.gameState = 'gameover'; // Final state
		}, 3000);
	},
	
	resetGame: function(startLevel = 1) {
		const { airplane, sea, enemyManager, weaponManager, rain, mothership, victoryScene, camera, lakes, forest, eagle, grass, rocks, sky, bgBattle, mountains } = this.context;
		
		stopSalsaSong(); // Detener la salsa cuando se reinicia el juego o se vuelve al menú
		GameState.reset(startLevel);
		airplane.reset();
		sea.reset();
		if (enemyManager) enemyManager.reset();
		if (weaponManager) weaponManager.projectiles = [];
		if (mothership) mothership.reset();
		
		this.clearLevel5Timeouts();
		this.updateEnvironmentColor();
		
		HUD.updateScore(GameState.score);
		HUD.updateEnergy(GameState.energy);
		HUD.updateAmmo(airplane.ammo);
		HUD.updateHeat(0, false);
		HUD.hideBossUI();
		
		document.getElementById('level-up-message').classList.add('hidden');
		
		// Restaurar visibilidad por si venimos de la pantalla de créditos
		if (victoryScene) victoryScene.deactivate();
		airplane.mesh.visible = true;
		sea.mesh.visible = true;
		if (mountains) mountains.mesh.visible = true;
		if (sky) sky.mesh.visible = true;
		if (lakes) lakes.mesh.visible = true;
		if (forest) forest.mesh.visible = true;
		if (eagle) eagle.mesh.visible = true;
		if (grass) grass.mesh.visible = true;
		if (rocks) rocks.mesh.visible = true;
		if (rain) rain.mesh.visible = true;
		if (mothership) mothership.mesh.visible = true;
		if (bgBattle) bgBattle.mesh.visible = true;
		if (GameState.gameState === 'playing') {
			HUD.show();
		} else {
			HUD.hide();
		}
		
		// Restaurar cámara
		camera.position.set(0, 100, 280);
		camera.lookAt(0, 100, 0);
		
		// Si se inicia directamente en el nivel 5, activar la secuencia del jefe
		if (startLevel === 5) {
			this.startLevel5Sequence();
		}
	}
};
