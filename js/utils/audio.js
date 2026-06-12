const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

export function initAudio() {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
}

export function playShootSound() {
	if (!audioCtx) return;
	
	const osc = audioCtx.createOscillator();
	const gainNode = audioCtx.createGain();
	
	osc.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	
	// Retro pew pew sound
	osc.type = 'square';
	
	const now = audioCtx.currentTime;
	
	// Frequency sweeps down rapidly
	osc.frequency.setValueAtTime(880, now);
	osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
	
	// Volume fades out
	gainNode.gain.setValueAtTime(0.5, now);
	gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
	
	osc.start(now);
	osc.stop(now + 0.15);
}

export function playMachineGunSound() {
	if (!audioCtx) return;
	
	const osc = audioCtx.createOscillator();
	const gainNode = audioCtx.createGain();
	
	osc.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	
	osc.type = 'sawtooth';
	
	const now = audioCtx.currentTime;
	
	osc.frequency.setValueAtTime(150, now);
	osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
	
	gainNode.gain.setValueAtTime(0.2, now);
	gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
	
	osc.start(now);
	osc.stop(now + 0.05);
}
