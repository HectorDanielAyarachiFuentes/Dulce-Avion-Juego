const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let noiseBuffer;

export function initAudio() {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
}

// Generador de Ruido Blanco para efectos más realistas (explosiones, viento, disparos)
function getNoiseBuffer() {
	if (noiseBuffer) return noiseBuffer;
	const bufferSize = audioCtx.sampleRate * 2; // 2 segundos de ruido
	noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
	const output = noiseBuffer.getChannelData(0);
	for (let i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}
	return noiseBuffer;
}

// Efecto de Misil: Sonido de "Whoosh" + Motor de cohete grave
export function playShootSound() {
	if (!audioCtx) return;
	const now = audioCtx.currentTime;

	// 1. Retumbo grave (Motor)
	const osc = audioCtx.createOscillator();
	osc.type = 'sawtooth';
	osc.frequency.setValueAtTime(150, now);
	osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
	
	const oscGain = audioCtx.createGain();
	oscGain.gain.setValueAtTime(0.6, now);
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
	
	osc.connect(oscGain);
	oscGain.connect(audioCtx.destination);
	
	// 2. Ruido siseante (Viento / Quemado)
	const noise = audioCtx.createBufferSource();
	noise.buffer = getNoiseBuffer();
	
	const noiseFilter = audioCtx.createBiquadFilter();
	noiseFilter.type = 'lowpass';
	noiseFilter.frequency.setValueAtTime(2000, now);
	noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
	
	const noiseGain = audioCtx.createGain();
	noiseGain.gain.setValueAtTime(0.8, now);
	noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
	
	noise.connect(noiseFilter);
	noiseFilter.connect(noiseGain);
	noiseGain.connect(audioCtx.destination);
	
	osc.start(now);
	osc.stop(now + 0.6);
	noise.start(now);
	noise.stop(now + 0.6);
}

// Efecto de Ametralladora: Disparo metálico seco con chispa de pólvora
export function playMachineGunSound() {
	if (!audioCtx) return;
	const now = audioCtx.currentTime;
	
	// 1. Estallido de pólvora (Ruido filtrado)
	const noise = audioCtx.createBufferSource();
	noise.buffer = getNoiseBuffer();
	
	const noiseFilter = audioCtx.createBiquadFilter();
	noiseFilter.type = 'bandpass';
	noiseFilter.frequency.setValueAtTime(1200, now);
	noiseFilter.Q.value = 1; // Filtro no muy agudo
	
	const noiseGain = audioCtx.createGain();
	noiseGain.gain.setValueAtTime(0.5, now);
	noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08); // Decae muy rápido
	
	noise.connect(noiseFilter);
	noiseFilter.connect(noiseGain);
	noiseGain.connect(audioCtx.destination);
	
	// 2. Click metálico percusivo
	const osc = audioCtx.createOscillator();
	osc.type = 'square';
	osc.frequency.setValueAtTime(400, now);
	osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
	
	const oscGain = audioCtx.createGain();
	oscGain.gain.setValueAtTime(0.4, now);
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
	
	osc.connect(oscGain);
	oscGain.connect(audioCtx.destination);
	
	noise.start(now);
	noise.stop(now + 0.1);
	osc.start(now);
	osc.stop(now + 0.05);
}
