/**
 * AI SUMMARY: Manages DOM interactions, menus, and UI events.
 */
import { GameState } from '../core/GameState.js';
import { HUD } from '../ui/hud.js';
import { setMusicMuted, setSfxMuted, setSongId, playEpicSong, startPropellerSound, initAudio } from '../utils/audio.js';
import { LevelManager } from './LevelManager.js';

export const UIManager = {
	init: function(airplane, mothership) {
		const startBtn = document.getElementById('start-btn');
		const welcomeScreen = document.getElementById('welcome-screen');
		
		const settingsModal = document.getElementById('settings-modal');
		const closeSettingsBtn = document.getElementById('close-settings-btn');
		const muteMusicChk = document.getElementById('mute-music-chk');
		const muteSfxChk = document.getElementById('mute-sfx-chk');
		const fullscreenBtn = document.getElementById('fullscreen-btn');
		const trackSelect = document.getElementById('track-select');
		const planeColorSelect = document.getElementById('plane-color-select');
		
		// Iniciar juego
		if (startBtn) {
			startBtn.addEventListener('click', () => {
				welcomeScreen.classList.add('hidden');
				GameState.gameState = 'playing';
				document.body.classList.add('playing');
				
				const levelSelect = document.getElementById('start-level-select');
				const startLevel = levelSelect ? parseInt(levelSelect.value) : 1;
				
				LevelManager.resetGame(startLevel);
				playEpicSong(); 
				startPropellerSound(); 
			});
		}
		
		// Botón de Test Victory
		const testVictoryBtn = document.getElementById('test-victory-btn');
		if (testVictoryBtn) {
			testVictoryBtn.addEventListener('click', () => {
				welcomeScreen.classList.add('hidden');
				settingsModal.classList.add('hidden'); // CIERRA EL MODAL DE AJUSTES
				GameState.gameState = 'playing';
				document.body.classList.add('playing');
				LevelManager.resetGame();
				
				// Simulate killing the boss
				GameState.currentLevel = 5;
				if (mothership) mothership.health = 0;
				LevelManager.triggerVictory();
			});
		}
		
		// Botón de Reiniciar
		const restartBtn = document.getElementById('restart-btn');
		if (restartBtn) {
			restartBtn.addEventListener('click', () => {
				document.getElementById('credits-screen').classList.add('hidden');
				welcomeScreen.classList.remove('hidden');
				GameState.gameState = 'menu';
				document.body.classList.remove('playing');
				
				LevelManager.resetGame();
			});
		}
		
		// Ajustes
		const settingsBtn = document.getElementById('settings-btn');
		if (settingsBtn) {
			settingsBtn.addEventListener('click', () => {
				settingsModal.classList.remove('hidden');
			});
		}
		
		if (closeSettingsBtn) {
			closeSettingsBtn.addEventListener('click', () => {
				settingsModal.classList.add('hidden');
				initAudio(); 
				
				// Si veníamos del juego (estado paused), reanudar
				if (GameState.gameState === 'paused') {
					GameState.gameState = 'playing';
					document.body.classList.add('playing');
				}
			});
		}
		
		if (muteMusicChk) muteMusicChk.addEventListener('change', (e) => setMusicMuted(e.target.checked));
		if (muteSfxChk) muteSfxChk.addEventListener('change', (e) => setSfxMuted(e.target.checked));
		if (trackSelect) trackSelect.addEventListener('change', (e) => setSongId(parseInt(e.target.value)));
		
		if (planeColorSelect) {
			planeColorSelect.addEventListener('change', (e) => {
				const styleId = parseInt(e.target.value);
				airplane.applyStyle(styleId);
				document.dispatchEvent(new CustomEvent('styleChanged', { detail: styleId }));
			});
		}
		
		if (fullscreenBtn) {
			fullscreenBtn.addEventListener('click', () => {
				if (!document.fullscreenElement) {
					document.documentElement.requestFullscreen().catch(err => {
						console.log(`Error al intentar entrar en pantalla completa: ${err.message}`);
					});
				} else {
					document.exitFullscreen();
				}
			});
		}
	}
};
