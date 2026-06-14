/**
 * AI SUMMARY: Holds the global state of the game so it can be accessed across different manager modules.
 */
export const GameState = {
	score: 0,
	energy: 100,
	gameState: 'welcome', // 'welcome', 'playing', 'paused', 'victory', 'gameover'
	currentLevel: 1,
	
	gameSpeed: 0,
	targetGameSpeed: 0,
	currentWorldY: -3000,
	targetWorldY: -3000,
	
	isShootingMG: false,
	mgTimer: 0,
	reloadTimer: 0,
	machineGunHeat: 0,
	isOverheated: false,
	
	reset: function(startLevel = 1) {
		this.currentLevel = startLevel;
		
		// Establecer puntuación según el nivel inicial
		if (startLevel === 2) this.score = 1500;
		else if (startLevel === 3) this.score = 4000;
		else if (startLevel === 4) this.score = 8000;
		else if (startLevel === 5) this.score = 13000;
		else this.score = 0;

		this.energy = 100;
		this.gameSpeed = 0.003;
		this.targetGameSpeed = 0.003;
		this.targetWorldY = -3000;
		
		this.isShootingMG = false;
		this.mgTimer = 0;
		this.reloadTimer = 0;
		this.machineGunHeat = 0;
		this.isOverheated = false;
	}
};
