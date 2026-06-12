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

// BSO: Secuenciador Procedural de Música Épica (Chiptune Heroico)
export function playEpicSong() {
	initAudio();
	const bpm = 135; // Tempo rápido y enérgico
	const beatDuration = 60 / bpm; // Duración de una negra
	
	// Acordes de marcha épica: La menor, Fa Mayor, Do Mayor, Sol Mayor
	// Frecuencias base (Hz): A2, F2, C3, G2
	const chords = [
		[110.00, 220.00, 164.81], // Am
		[87.31, 174.61, 130.81],  // F
		[130.81, 261.63, 196.00], // C
		[98.00, 196.00, 146.83]   // G
	];
	
	function scheduleMeasure(startTime, chordIndex) {
		const chord = chords[chordIndex];
		const rootFreq = chord[0];
		
		// 1. Línea de Bajo Conductor (Semicorcheas oscilantes)
		for (let i = 0; i < 16; i++) {
			const time = startTime + i * (beatDuration / 4);
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			const filter = audioCtx.createBiquadFilter();
			
			osc.type = 'sawtooth';
			osc.frequency.value = rootFreq;
			
			filter.type = 'lowpass';
			filter.frequency.setValueAtTime(150, time);
			filter.frequency.exponentialRampToValueAtTime(800, time + 0.03);
			filter.frequency.exponentialRampToValueAtTime(150, time + (beatDuration/4) - 0.01);
			
			gain.gain.setValueAtTime(0, time);
			gain.gain.linearRampToValueAtTime(0.25, time + 0.02); // Ataque rápido
			gain.gain.exponentialRampToValueAtTime(0.01, time + (beatDuration/4) - 0.01);
			
			osc.connect(filter);
			filter.connect(gain);
			gain.connect(audioCtx.destination);
			
			osc.start(time);
			osc.stop(time + (beatDuration/4));
		}
		
		// 2. Melodía Heroica / Arpegios (Corcheas)
		for (let i = 0; i < 8; i++) {
			const time = startTime + i * (beatDuration / 2);
			const noteFreq = chord[i % 3] * 2; // Una octava más alta
			
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			
			osc.type = 'square';
			osc.frequency.value = noteFreq;
			
			gain.gain.setValueAtTime(0, time);
			gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
			gain.gain.exponentialRampToValueAtTime(0.01, time + (beatDuration/2) - 0.01);
			
			osc.connect(gain);
			gain.connect(audioCtx.destination);
			
			osc.start(time);
			osc.stop(time + (beatDuration/2));
		}
	}
	
	let currentMeasure = 0;
	let nextScheduleTime = audioCtx.currentTime + 0.1;
	
	function scheduler() {
		// Programar el siguiente compás si se acerca el tiempo
		while (nextScheduleTime < audioCtx.currentTime + 0.5) {
			scheduleMeasure(nextScheduleTime, currentMeasure % 4);
			nextScheduleTime += beatDuration * 4; // 4 tiempos por compás
			currentMeasure++;
		}
		setTimeout(scheduler, 100);
	}
	
	scheduler(); // Iniciar bucle
}
