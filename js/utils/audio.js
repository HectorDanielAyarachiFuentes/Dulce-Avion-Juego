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
	
	function scheduleMeasure(startTime, measureIndex) {
		const chordIndex = measureIndex % 4;
		const chord = chords[chordIndex];
		const rootFreq = chord[0];
		
		const isIntro = measureIndex < 8;
		const isDev = measureIndex >= 8 && measureIndex < 16;
		const isEpic = measureIndex >= 16;
		
		// 1. Línea de Bajo Conductor (Semicorcheas oscilantes)
		for (let i = 0; i < 16; i++) {
			const time = startTime + i * (beatDuration / 4);
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			const filter = audioCtx.createBiquadFilter();
			
			osc.type = 'sawtooth';
			osc.frequency.value = rootFreq;
			
			filter.type = 'lowpass';
			filter.frequency.setValueAtTime(isEpic ? 300 : 150, time); // Más brillante en la parte épica
			filter.frequency.exponentialRampToValueAtTime(isEpic ? 1200 : 800, time + 0.03);
			filter.frequency.exponentialRampToValueAtTime(isEpic ? 300 : 150, time + (beatDuration/4) - 0.01);
			
			gain.gain.setValueAtTime(0, time);
			gain.gain.linearRampToValueAtTime(isEpic ? 0.4 : 0.25, time + 0.02); // Más volumen en epic
			gain.gain.exponentialRampToValueAtTime(0.01, time + (beatDuration/4) - 0.01);
			
			osc.connect(filter);
			filter.connect(gain);
			gain.connect(audioCtx.destination);
			
			osc.start(time);
			osc.stop(time + (beatDuration/4));
		}
		
		// 2. Melodía Heroica / Arpegios
		const arpeggioNotes = isIntro ? 8 : 16; // Corcheas en intro, semicorcheas después
		const arpDuration = beatDuration * 4 / arpeggioNotes;
		for (let i = 0; i < arpeggioNotes; i++) {
			const time = startTime + i * arpDuration;
			const noteFreq = chord[i % 3] * 2; // Una octava más alta
			
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			
			osc.type = 'square';
			osc.frequency.value = noteFreq;
			
			gain.gain.setValueAtTime(0, time);
			gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
			gain.gain.exponentialRampToValueAtTime(0.01, time + arpDuration - 0.01);
			
			osc.connect(gain);
			gain.connect(audioCtx.destination);
			
			osc.start(time);
			osc.stop(time + arpDuration);
		}
		
		// 3. Batería (Desarrollo y Clímax)
		if (isDev || isEpic) {
			// Bombo (Kick) pesado en cada negra
			for (let i = 0; i < 4; i++) {
				const time = startTime + i * beatDuration;
				const osc = audioCtx.createOscillator();
				const gain = audioCtx.createGain();
				osc.frequency.setValueAtTime(150, time);
				osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
				gain.gain.setValueAtTime(0.8, time);
				gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
				osc.connect(gain);
				gain.connect(audioCtx.destination);
				osc.start(time);
				osc.stop(time + 0.1);
			}
		}
		
		// 4. Éxtasis Épico: Sub-Bajo y Hi-Hats furiosos
		if (isEpic) {
			// Sub-Bajo profundo continuo
			const subOsc = audioCtx.createOscillator();
			subOsc.type = 'square';
			subOsc.frequency.value = rootFreq / 2; // Octava destructiva
			const subGain = audioCtx.createGain();
			const subFilter = audioCtx.createBiquadFilter();
			subFilter.type = 'lowpass';
			subFilter.frequency.value = 150; // Quitar agudos para que retumbe
			
			subGain.gain.setValueAtTime(0.3, startTime);
			subGain.gain.linearRampToValueAtTime(0.3, startTime + beatDuration * 3.8);
			subGain.gain.linearRampToValueAtTime(0, startTime + beatDuration * 4);
			
			subOsc.connect(subFilter);
			subFilter.connect(subGain);
			subGain.connect(audioCtx.destination);
			
			subOsc.start(startTime);
			subOsc.stop(startTime + beatDuration * 4);
			
			// Hi-Hats de ruido blanco en semicorcheas
			for (let i = 0; i < 16; i++) {
				const time = startTime + i * (beatDuration / 4);
				// Acentuar el contratiempo (el 'and' de cada pulso)
				const isAccent = (i % 2 !== 0);
				
				const noise = audioCtx.createBufferSource();
				noise.buffer = getNoiseBuffer();
				const nFilter = audioCtx.createBiquadFilter();
				nFilter.type = 'highpass';
				nFilter.frequency.value = 5000;
				const nGain = audioCtx.createGain();
				nGain.gain.setValueAtTime(isAccent ? 0.15 : 0.05, time);
				nGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
				
				noise.connect(nFilter);
				nFilter.connect(nGain);
				nGain.connect(audioCtx.destination);
				
				noise.start(time);
				noise.stop(time + 0.05);
			}
		}
	}
	
	let currentMeasure = 0;
	let nextScheduleTime = audioCtx.currentTime + 0.1;
	
	function scheduler() {
		// Programar el siguiente compás si se acerca el tiempo
		while (nextScheduleTime < audioCtx.currentTime + 0.5) {
			scheduleMeasure(nextScheduleTime, currentMeasure);
			nextScheduleTime += beatDuration * 4; // 4 tiempos por compás
			currentMeasure++;
			// Bucle infinito: después del compás 31, regresamos al desarrollo (compás 8) para mantener la intensidad
			if (currentMeasure >= 32) {
				currentMeasure = 8;
			}
		}
		setTimeout(scheduler, 100);
	}
	
	scheduler(); // Iniciar bucle
}
