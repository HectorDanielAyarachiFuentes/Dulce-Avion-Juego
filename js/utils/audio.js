/**
 * AI SUMMARY: Manages all sound effects, music playback, and audio settings.
 */
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let noiseBuffer;

// Estado Global de Audio
export let isMusicMuted = false;
export let isSfxMuted = false;
export let currentSongId = 0;
let currentSchedulerTimer = null;
let masterMusicGain;
let masterSfxGain;

export function setMusicMuted(muted) {
	isMusicMuted = muted;
	if (masterMusicGain) {
		masterMusicGain.gain.cancelScheduledValues(audioCtx ? audioCtx.currentTime : 0);
		masterMusicGain.gain.value = muted ? 0 : 0.6;
	}
}

export function setSfxMuted(muted) {
	isSfxMuted = muted;
	if (masterSfxGain) {
		masterSfxGain.gain.cancelScheduledValues(audioCtx ? audioCtx.currentTime : 0);
		masterSfxGain.gain.value = muted ? 0 : 1.0;
	}
}

export function setSongId(id) {
	currentSongId = id;
	// Al cambiar de canción, reiniciamos el secuenciador
	playEpicSong();
}

export function initAudio() {
	if (!audioCtx) {
		audioCtx = new AudioContext();
		
		masterMusicGain = audioCtx.createGain();
		masterMusicGain.gain.value = isMusicMuted ? 0 : 0.6;
		masterMusicGain.connect(audioCtx.destination);
		
		masterSfxGain = audioCtx.createGain();
		masterSfxGain.gain.value = isSfxMuted ? 0 : 1.0;
		masterSfxGain.connect(audioCtx.destination);
	}
}

function getNoiseBuffer() {
	if (noiseBuffer) return noiseBuffer;
	const bufferSize = audioCtx.sampleRate * 2;
	noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
	const output = noiseBuffer.getChannelData(0);
	for (let i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}
	return noiseBuffer;
}

export function playShootSound() {
	if (!audioCtx || isSfxMuted) return;
	const now = audioCtx.currentTime;

	// 1. "Thump" de salida (baja frecuencia rápida)
	const osc = audioCtx.createOscillator();
	osc.type = 'sine'; // Suave y con graves
	osc.frequency.setValueAtTime(250, now);
	osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
	
	const oscGain = audioCtx.createGain();
	oscGain.gain.setValueAtTime(0.6, now); // Golpe inicial
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
	
	osc.connect(oscGain);
	oscGain.connect(masterSfxGain);
	
	// 2. "Whoosh" del cohete (ruido filtrado)
	const noise = audioCtx.createBufferSource();
	noise.buffer = getNoiseBuffer();
	const noiseFilter = audioCtx.createBiquadFilter();
	noiseFilter.type = 'bandpass';
	noiseFilter.frequency.setValueAtTime(1000, now);
	noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.25);
	noiseFilter.Q.value = 1.5; // Resonancia para darle cuerpo
	
	const noiseGain = audioCtx.createGain();
	noiseGain.gain.setValueAtTime(0.4, now); // Volumen medio
	noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
	
	noise.connect(noiseFilter);
	noiseFilter.connect(noiseGain);
	noiseGain.connect(masterSfxGain);
	
	osc.start(now);
	osc.stop(now + 0.15);
	noise.start(now);
	noise.stop(now + 0.25);
}

export function playMachineGunSound() {
	if (!audioCtx || isSfxMuted) return;
	const now = audioCtx.currentTime;
	
	const noise = audioCtx.createBufferSource();
	noise.buffer = getNoiseBuffer();
	const noiseFilter = audioCtx.createBiquadFilter();
	noiseFilter.type = 'bandpass';
	noiseFilter.frequency.setValueAtTime(1200, now);
	noiseFilter.Q.value = 1;
	const noiseGain = audioCtx.createGain();
	noiseGain.gain.setValueAtTime(0.5, now);
	noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
	noise.connect(noiseFilter);
	noiseFilter.connect(noiseGain);
	noiseGain.connect(masterSfxGain);
	
	const osc = audioCtx.createOscillator();
	osc.type = 'square';
	osc.frequency.setValueAtTime(400, now);
	osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
	const oscGain = audioCtx.createGain();
	oscGain.gain.setValueAtTime(0.4, now);
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
	osc.connect(oscGain);
	oscGain.connect(masterSfxGain);
	
	noise.start(now);
	noise.stop(now + 0.1);
	osc.start(now);
	osc.stop(now + 0.05);
}

export function playAlienLaserSound() {
	if (!audioCtx || isSfxMuted) return;
	const now = audioCtx.currentTime;
	const osc = audioCtx.createOscillator();
	osc.type = 'sawtooth';
	osc.frequency.setValueAtTime(800, now);
	osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
	
	const gain = audioCtx.createGain();
	gain.gain.setValueAtTime(0.3, now);
	gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
	
	osc.connect(gain);
	gain.connect(masterSfxGain);
	osc.start(now);
	osc.stop(now + 0.3);
}

export function playExplosionSound() {
	if (!audioCtx || isSfxMuted) return;
	const now = audioCtx.currentTime;
	
	const noise = audioCtx.createBufferSource();
	noise.buffer = getNoiseBuffer();
	const noiseFilter = audioCtx.createBiquadFilter();
	noiseFilter.type = 'lowpass';
	noiseFilter.frequency.setValueAtTime(1000, now);
	noiseFilter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
	
	const gain = audioCtx.createGain();
	gain.gain.setValueAtTime(1.0, now);
	gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
	
	noise.connect(noiseFilter);
	noiseFilter.connect(gain);
	gain.connect(masterSfxGain);
	
	// Rumble
	const osc = audioCtx.createOscillator();
	osc.type = 'square';
	osc.frequency.setValueAtTime(60, now);
	osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
	const oscGain = audioCtx.createGain();
	oscGain.gain.setValueAtTime(0.5, now);
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
	osc.connect(oscGain);
	oscGain.connect(masterSfxGain);
	
	noise.start(now);
	noise.stop(now + 0.5);
	osc.start(now);
	osc.stop(now + 0.5);
}

export function playRescueSound() {
	if (!audioCtx || isSfxMuted) return;
	const now = audioCtx.currentTime;
	
	const osc = audioCtx.createOscillator();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(440, now);
	osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
	osc.frequency.setValueAtTime(659.25, now + 0.2); // E
	osc.frequency.setValueAtTime(880, now + 0.3); // A
	
	const gain = audioCtx.createGain();
	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
	gain.gain.setValueAtTime(0.5, now + 0.3);
	gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
	
	osc.connect(gain);
	gain.connect(masterSfxGain);
	osc.start(now);
	osc.stop(now + 0.5);
}

// BSO: Secuenciador Procedural Avanzado (7 Canciones)
export function playEpicSong() {
	initAudio();
	
	// Limpiar scheduler previo si se cambió de canción
	if (currentSchedulerTimer) {
		clearTimeout(currentSchedulerTimer);
	}
	
	const SONGS = {
		0: { // 1. Épica Original
			bpm: 135,
			chords: [[110.00, 220.00, 164.81], [87.31, 174.61, 130.81], [130.81, 261.63, 196.00], [98.00, 196.00, 146.83]],
			style: 'epic'
		},
		1: { // 2. El Cóndor Pasa (Versión Quena Completa)
			bpm: 100,
			chords: [[0,0,0]], // Usamos lógica dinámica matemática de 44 compases
			style: 'el_condor_pasa'
		},
		2: { // 3. Vuelo Solitario (Andina Triste 2)
			bpm: 70,
			chords: [[146.83, 174.61, 220.00], [130.81, 164.81, 196.00], [110.00, 130.81, 164.81], [146.83, 174.61, 220.00]], // Dm, C, Am, Dm
			style: 'sad_andina'
		},
		3: { // 4. Carnavalito en las Nubes (Alegre)
			bpm: 110,
			chords: [[130.81, 164.81, 196.00], [130.81, 196.00, 261.63], [98.00, 146.83, 196.00], [130.81, 164.81, 196.00]], // C, C, G, C
			style: 'happy_andina'
		},
		4: { // 5. Caporal del Cielo (Alegre)
			bpm: 115,
			chords: [[110.00, 130.81, 164.81], [87.31, 130.81, 174.61], [98.00, 146.83, 196.00], [110.00, 164.81, 220.00]], // Am, F, G, Am
			style: 'happy_caporal'
		},
		5: { // 6. Nazca Espacial (Misterio/Alien)
			bpm: 85,
			chords: [[110.00, 116.54, 164.81], [110.00, 138.59, 164.81], [110.00, 116.54, 164.81], [98.00, 103.83, 146.83]], // Modos frígios alienígenas
			style: 'alien'
		},
		6: { // 7. Contacto en los Andes (Misterio/Alien)
			bpm: 90,
			chords: [[146.83, 174.61, 220.00], [138.59, 164.81, 207.65], [146.83, 174.61, 220.00], [155.56, 185.00, 233.08]], // Cromatismos oscuros
			style: 'alien'
		}
	};
	
	const currentSong = SONGS[currentSongId];
	const beatDuration = 60 / currentSong.bpm;
	
	// Utilidad para reproducir una nota con parámetros
	function playNote(freq, type, startTime, duration, vol, isAlien=false) {
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.type = type;
		osc.frequency.value = freq;
		
		if (isAlien) {
			// LFO tipo Theremin
			const lfo = audioCtx.createOscillator();
			lfo.frequency.value = 6;
			const lfoGain = audioCtx.createGain();
			lfoGain.gain.value = freq * 0.05;
			lfo.connect(lfoGain);
			lfoGain.connect(osc.frequency);
			lfo.start(startTime);
			lfo.stop(startTime + duration);
		}
		
		// Zampoña simulada (onda seno lenta) vs Charango (onda sierra/triangulo rápida)
		if (type === 'sine') {
			gain.gain.setValueAtTime(0, startTime);
			gain.gain.linearRampToValueAtTime(vol, startTime + duration * 0.3); // Ataque lento (aire)
			gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.01);
		} else {
			gain.gain.setValueAtTime(0, startTime);
			gain.gain.linearRampToValueAtTime(vol, startTime + 0.02); // Ataque rápido (cuerda/plástico)
			gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.01);
		}
		
		osc.connect(gain);
		gain.connect(masterMusicGain);
		osc.start(startTime);
		osc.stop(startTime + duration);
	}
	
	function playDrum(type, startTime, duration) {
		if (type === 'kick') {
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			osc.frequency.setValueAtTime(150, startTime);
			osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.1);
			gain.gain.setValueAtTime(0.8, startTime);
			gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
			osc.connect(gain);
			gain.connect(masterMusicGain);
			osc.start(startTime);
			osc.stop(startTime + 0.1);
		} else if (type === 'snare' || type === 'hat') {
			const noise = audioCtx.createBufferSource();
			noise.buffer = getNoiseBuffer();
			const filter = audioCtx.createBiquadFilter();
			filter.type = type === 'hat' ? 'highpass' : 'bandpass';
			filter.frequency.value = type === 'hat' ? 5000 : 1500;
			const gain = audioCtx.createGain();
			gain.gain.setValueAtTime(type === 'hat' ? 0.1 : 0.3, startTime);
			gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
			noise.connect(filter);
			filter.connect(gain);
			gain.connect(masterMusicGain);
			noise.start(startTime);
			noise.stop(startTime + 0.05);
		}
	}

	function scheduleMeasure(startTime, measureIndex) {
		const numChords = currentSong.chords.length || 1;
		const chordIndex = measureIndex % numChords;
		const chord = currentSong.chords[chordIndex] || [0, 0, 0];
		const rootFreq = chord[0] || 0;
		
		const isIntro = measureIndex < 8;
		const isDev = measureIndex >= 8 && measureIndex < 16;
		const isEpic = measureIndex >= 16;
		
		// --- LÓGICA DE CANCIONES ---
		
		if (currentSong.style === 'epic') {
			// EPICA (Original)
			for (let i = 0; i < 16; i++) {
				const time = startTime + i * (beatDuration / 4);
				playNote(rootFreq, 'sawtooth', time, beatDuration/4, isEpic ? 0.4 : 0.25);
			}
			const arps = isIntro ? 8 : 16;
			for (let i = 0; i < arps; i++) {
				const time = startTime + i * (beatDuration * 4 / arps);
				playNote(chord[i % 3] * 2, 'square', time, beatDuration * 4 / arps, 0.1);
			}
			if (isDev || isEpic) {
				for (let i=0; i<4; i++) playDrum('kick', startTime + i * beatDuration);
			}
			if (isEpic) {
				for (let i=0; i<16; i++) playDrum('hat', startTime + i * (beatDuration/4));
			}
			
		} else if (currentSong.style === 'el_condor_pasa') {
			const m = measureIndex % 44; // Ciclo exacto de 44 compases según notas de Quena
			
			// Frecuencias matemáticas exactas para Quena (Escala Am)
			const e4 = 329.63, g4 = 392.00, a4 = 440.00, b4 = 493.88;
			const c5 = 523.25, d5 = 587.33, e5 = 659.25;
			const a5 = 880.00, b5 = 987.77, c6 = 1046.50, d6 = 1174.66;
			
			const melody = [
				[{b:0, p:e4, d:1}, {b:1, p:a4, d:1}, {b:2, p:c5, d:1}, {b:3, p:b4, d:1}], // M0: Intro
				[{b:0, p:a4, d:0.5}, {b:0.5, p:b4, d:0.5}, {b:1, p:c5, d:1}, {b:2, p:a4, d:2}], // M1
				[{b:0, p:e4, d:1}, {b:1, p:a4, d:1}, {b:2, p:c5, d:1}, {b:3, p:b4, d:1}], // M2
				[{b:0, p:a4, d:0.5}, {b:0.5, p:b4, d:0.5}, {b:1, p:c5, d:1}, {b:2, p:a4, d:2}], // M3

				[{b:0, p:e5, d:2}, {b:2, p:e5, d:2}], // M4: Parte A
				[{b:0, p:e5, d:1}, {b:1, p:e5, d:1}, {b:2, p:e5, d:2}], // M5
				[{b:0, p:d5, d:2}, {b:2, p:c5, d:2}], // M6
				[{b:0, p:b4, d:4}], // M7

				[{b:0, p:a4, d:2}, {b:2, p:b4, d:2}], // M8
				[{b:0, p:c5, d:1}, {b:1, p:b4, d:1}, {b:2, p:c5, d:1}, {b:3, p:d5, d:1}], // M9
				[{b:0, p:e5, d:4}], // M10
				[{b:0, p:a4, d:4}], // M11

				[{b:0, p:e5, d:2}, {b:2, p:e5, d:2}], // M12
				[{b:0, p:e5, d:1}, {b:1, p:e5, d:1}, {b:2, p:e5, d:2}], // M13
				[{b:0, p:d5, d:2}, {b:2, p:c5, d:2}], // M14
				[{b:0, p:b4, d:4}], // M15

				[{b:0, p:a4, d:2}, {b:2, p:b4, d:2}], // M16
				[{b:0, p:c5, d:1}, {b:1, p:b4, d:1}, {b:2, p:c5, d:1}, {b:3, p:d5, d:1}], // M17
				[{b:0, p:e5, d:4}], // M18
				[{b:0, p:a4, d:4}], // M19

				[{b:0, p:g4, d:2}, {b:2, p:a4, d:2}], // M20
				[{b:0, p:b4, d:1}, {b:1, p:g4, d:1}, {b:2, p:a4, d:1}, {b:3, p:b4, d:1}], // M21
				[{b:0, p:c5, d:1}, {b:1, p:b4, d:1}, {b:2, p:c5, d:1}, {b:3, p:d5, d:1}], // M22
				[{b:0, p:a4, d:4}], // M23

				[{b:0, p:e4, d:2}, {b:2, p:a4, d:2}], // M24
				[{b:0, p:c5, d:1}, {b:1, p:b4, d:1}, {b:2, p:c5, d:1}, {b:3, p:d5, d:1}], // M25
				[{b:0, p:e5, d:4}], // M26
				[], // M27

				[{b:0, p:e5, d:2}, {b:2, p:e5, d:2}], // M28
				[{b:0, p:e5, d:1}, {b:1, p:e5, d:1}, {b:2, p:e5, d:2}], // M29
				[{b:0, p:d5, d:2}, {b:2, p:c5, d:2}], // M30
				[{b:0, p:b4, d:4}], // M31

				[{b:0, p:a4, d:2}, {b:2, p:b4, d:2}], // M32
				[{b:0, p:c5, d:1}, {b:1, p:b4, d:1}, {b:2, p:c5, d:1}, {b:3, p:d5, d:1}], // M33
				[{b:0, p:e5, d:4}], // M34
				[{b:0, p:a4, d:4}], // M35

				[{b:0, p:e5, d:1}, {b:1, p:c6, d:1}, {b:2, p:c6, d:1}, {b:3, p:c6, d:1}], // M36: Huayno
				[{b:0, p:c6, d:0.5}, {b:0.5, p:b5, d:0.5}, {b:1, p:a5, d:1}, {b:2, p:b5, d:0.5}, {b:2.5, p:c6, d:0.5}, {b:3, p:a5, d:1}], // M37
				[{b:0, p:e5, d:1}, {b:1, p:c6, d:1}, {b:2, p:c6, d:1}, {b:3, p:c6, d:1}], // M38
				[{b:0, p:c6, d:0.5}, {b:0.5, p:b5, d:0.5}, {b:1, p:a5, d:1}, {b:2, p:b5, d:0.5}, {b:2.5, p:c6, d:0.5}, {b:3, p:a5, d:1}], // M39
				[{b:0, p:e5, d:1}, {b:1, p:d6, d:1}, {b:2, p:c6, d:1}, {b:3, p:d6, d:1}], // M40
				[{b:0, p:c6, d:0.5}, {b:0.5, p:b5, d:0.5}, {b:1, p:a5, d:1}, {b:2, p:b5, d:0.5}, {b:2.5, p:c6, d:0.5}, {b:3, p:a5, d:1}], // M41
				[{b:0, p:e5, d:1}, {b:1, p:d6, d:1}, {b:2, p:c6, d:1}, {b:3, p:d6, d:1}], // M42
				[{b:0, p:c6, d:0.5}, {b:0.5, p:b5, d:0.5}, {b:1, p:a5, d:1}, {b:2, p:b5, d:0.5}, {b:2.5, p:c6, d:0.5}, {b:3, p:a5, d:1}]  // M43
			];

			const Am = { bass: 110.00, chord: [220.00, 261.63, 329.63] };
			const G  = { bass: 98.00,  chord: [196.00, 246.94, 293.66] };
			const C  = { bass: 130.81, chord: [261.63, 329.63, 392.00] };
			const Em = { bass: 82.41,  chord: [164.81, 196.00, 246.94] };

			const chordsMap = [
				Am, Am, Am, Am, // Intro 0-3
				Am, Am, G, Em,  // Parte A 4-7
				Am, C, Em, Am,  // 8-11
				Am, Am, G, Em,  // 12-15
				Am, C, Em, Am,  // 16-19
				G, G, C, Am,    // 20-23
				Am, C, Em, Am,  // 24-27
				Am, Am, G, Em,  // 28-31
				Am, C, Em, Am,  // 32-35
				C, Am, C, Am,   // Parte B 36-39
				G, Am, G, Am    // 40-43
			];

			const notes = melody[m] || [];
			for (let note of notes) {
				// Golpe de lengua más marcado al multiplicar por 0.95 el sustain
				playNote(note.p, 'sine', startTime + note.b * beatDuration, note.d * beatDuration * 0.95, 0.45);
			}

			const c = chordsMap[m];
			if (c) {
				playNote(c.bass, 'triangle', startTime, beatDuration * 1.5, 0.4);
				playNote(c.bass, 'triangle', startTime + beatDuration * 2, beatDuration * 1.5, 0.4);
				for (let b of [1, 2.5, 3.5]) {
					for (let freq of c.chord) {
						playNote(freq, 'triangle', startTime + b * beatDuration, beatDuration * 0.4, 0.15);
					}
				}
				
				// Ritmo: en la intro y parte A es más calmado, en huayno (36-43) es más movido
				const isHuayno = m >= 36;
				if (isHuayno) {
					playDrum('kick', startTime);
					playDrum('hat', startTime + beatDuration * 0.5);
					playDrum('kick', startTime + beatDuration * 1);
					playDrum('hat', startTime + beatDuration * 1.5);
					playDrum('kick', startTime + beatDuration * 2);
					playDrum('hat', startTime + beatDuration * 2.5);
					playDrum('kick', startTime + beatDuration * 3);
					playDrum('hat', startTime + beatDuration * 3.5);
				} else {
					playDrum('kick', startTime);
					playDrum('kick', startTime + beatDuration * 2);
					playDrum('hat', startTime + beatDuration * 1);
					playDrum('hat', startTime + beatDuration * 3);
				}
			}
			
		} else if (currentSong.style === 'sad_andina') {
			// VUELO SOLITARIO (Triste 2 - Antiguo algoritmo)
			playNote(rootFreq / 2, 'triangle', startTime, beatDuration * 2, 0.4);
			playNote(rootFreq / 2, 'triangle', startTime + beatDuration * 2, beatDuration * 2, 0.4);
			
			const notes = isIntro ? 2 : 4;
			for (let i = 0; i < notes; i++) {
				const time = startTime + i * (beatDuration * 4 / notes);
				const note = (i === notes-1) ? chord[2] : chord[i % 3]; 
				playNote(note * 2, 'sine', time, beatDuration * 4 / notes, 0.3);
			}
			if (isEpic) {
				for (let i=0; i<4; i++) playDrum('hat', startTime + i * beatDuration);
			}
			
		} else if (currentSong.style === 'happy_andina') {
			// ALEGRÍA ANDINA (Carnavalito)
			// Bajo sincopado
			playNote(rootFreq, 'square', startTime, beatDuration/2, 0.3);
			playNote(rootFreq, 'square', startTime + beatDuration, beatDuration/2, 0.3);
			playNote(chord[1], 'square', startTime + beatDuration*1.5, beatDuration/2, 0.3);
			
			// Bombo Legüero
			for (let i = 0; i < 4; i++) {
				playDrum('kick', startTime + i * beatDuration);
				if (i % 2 !== 0) playDrum('snare', startTime + i * beatDuration + beatDuration/2); // Chasquido
			}
			
			// Melodía rápida (Charango)
			for (let i = 0; i < 8; i++) {
				const time = startTime + i * (beatDuration / 2);
				playNote(chord[i % 3] * 4, 'triangle', time, beatDuration/2, 0.15); // Agudo y rápido
			}
			
		} else if (currentSong.style === 'happy_caporal') {
			// ALEGRÍA ANDINA 2 (Caporal)
			// El caporal tiene un pulso tump-tump muy marcado
			playDrum('kick', startTime);
			playDrum('kick', startTime + beatDuration * 0.75); // Síncopa
			playDrum('kick', startTime + beatDuration * 2);
			playDrum('kick', startTime + beatDuration * 2.75);
			
			playNote(rootFreq, 'sawtooth', startTime, beatDuration * 0.5, 0.3);
			playNote(rootFreq, 'sawtooth', startTime + beatDuration * 2, beatDuration * 0.5, 0.3);
			
			for (let i = 0; i < 8; i++) {
				const time = startTime + i * (beatDuration / 2);
				playNote(chord[i % 2] * 2, 'square', time, beatDuration/2, 0.15);
			}
			
		} else if (currentSong.style === 'alien') {
			// MISTERIO ALIEN-ANDINO
			// Zampoñas pero con LFO espeluznante
			playNote(rootFreq * 2, 'sine', startTime, beatDuration * 4, 0.2, true); // True = LFO activado
			
			// Bajo perturbador
			if (isDev || isEpic) {
				playNote(rootFreq / 2, 'sawtooth', startTime, beatDuration * 0.5, 0.3);
				playNote(chord[1] / 2, 'sawtooth', startTime + beatDuration * 1.5, beatDuration * 0.5, 0.3);
			}
			
			// Percusión tribal glitch
			for (let i = 0; i < 16; i++) {
				const time = startTime + i * (beatDuration / 4);
				if (Math.random() > 0.7) {
					playDrum('hat', time);
				}
			}
		}
	}
	
	let currentMeasure = 0;
	let nextScheduleTime = audioCtx.currentTime + 0.1;
	
	// Identificador único para el loop actual
	const localSongId = currentSongId; 
	
	function scheduler() {
		// Si el usuario cambió de canción, abandonamos este loop (el nuevo ya habrá iniciado)
		if (localSongId !== currentSongId) return;
		
		while (nextScheduleTime < audioCtx.currentTime + 0.5) {
			scheduleMeasure(nextScheduleTime, currentMeasure);
			nextScheduleTime += beatDuration * 4;
			currentMeasure++;
			
			// Bucle infinito: en los temas andinos no necesitamos 31 compases obligatorios, 
			// pero podemos resetear para variaciones.
			if (currentSong.style === 'el_condor_pasa' && currentMeasure >= 44) {
				currentMeasure = 0; // El Cóndor Pasa repite su ciclo de 44 compases
			} else if (currentMeasure >= 32) {
				currentMeasure = 8;
			}
		}
		currentSchedulerTimer = setTimeout(scheduler, 100);
	}
	
	scheduler();
}

export function playThunderSound() {
	if (!audioCtx || isSfxMuted) return;
	const now = audioCtx.currentTime;
	
	// 1. Impacto inicial (Explosión)
	const noise = audioCtx.createBufferSource();
	noise.buffer = getNoiseBuffer();
	const noiseFilter = audioCtx.createBiquadFilter();
	noiseFilter.type = 'lowpass';
	noiseFilter.frequency.setValueAtTime(1500, now);
	noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 1.0);
	
	const noiseGain = audioCtx.createGain();
	noiseGain.gain.setValueAtTime(0.8, now); // Ganancia segura para no saturar el limitador
	noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 4.0); // Cola larga
	
	noise.connect(noiseFilter);
	noiseFilter.connect(noiseGain);
	noiseGain.connect(masterSfxGain);

	// 2. Retumbe Sub-grave (Reverberancia baja y prolongada)
	const subOsc = audioCtx.createOscillator();
	subOsc.type = 'sine';
	subOsc.frequency.setValueAtTime(55, now); // Frecuencia baja perfecta para parlantes
	subOsc.frequency.exponentialRampToValueAtTime(20, now + 5.0);
	
	const subGain = audioCtx.createGain();
	subGain.gain.setValueAtTime(0, now);
	subGain.gain.linearRampToValueAtTime(0.8, now + 0.1); // Ataque rápido
	subGain.gain.exponentialRampToValueAtTime(0.01, now + 5.0); // Cola súper larga de 5 segundos
	
	subOsc.connect(subGain);
	subGain.connect(masterSfxGain);

	// 3. Textura de crujido grave (Sierra filtrada)
	const osc = audioCtx.createOscillator();
	osc.type = 'sawtooth';
	osc.frequency.setValueAtTime(40, now);
	osc.frequency.exponentialRampToValueAtTime(10, now + 4.0);
	
	const oscFilter = audioCtx.createBiquadFilter();
	oscFilter.type = 'lowpass';
	oscFilter.frequency.setValueAtTime(300, now);
	oscFilter.frequency.exponentialRampToValueAtTime(40, now + 4.0);
	
	const oscGain = audioCtx.createGain();
	oscGain.gain.setValueAtTime(0, now);
	oscGain.gain.linearRampToValueAtTime(0.4, now + 0.2); // Ataque un poco más suave
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 4.0);
	
	osc.connect(oscFilter);
	oscFilter.connect(oscGain);
	oscGain.connect(masterSfxGain);
	
	noise.start(now);
	noise.stop(now + 4.0);
	subOsc.start(now);
	subOsc.stop(now + 5.0);
	osc.start(now);
	osc.stop(now + 4.0);
}

let rainNoiseNode = null;
let rainGainNode = null;

export function startRainSound() {
	if (!audioCtx) initAudio();
	if (rainNoiseNode) return; // Already playing
	if (isSfxMuted && masterSfxGain.gain.value === 0) {
		// Even if muted, we start the node so it plays when unmuted
	}
	
	const now = audioCtx.currentTime;
	rainNoiseNode = audioCtx.createBufferSource();
	rainNoiseNode.buffer = getNoiseBuffer();
	rainNoiseNode.loop = true;
	
	const noiseFilter = audioCtx.createBiquadFilter();
	noiseFilter.type = 'lowpass';
	noiseFilter.frequency.value = 800; // Sonido de lluvia constante
	
	rainGainNode = audioCtx.createGain();
	rainGainNode.gain.setValueAtTime(0, now);
	rainGainNode.gain.linearRampToValueAtTime(0.3, now + 2); // Fade in suave
	
	rainNoiseNode.connect(noiseFilter);
	noiseFilter.connect(rainGainNode);
	rainGainNode.connect(masterSfxGain);
	
	rainNoiseNode.start(now);
}

export function stopRainSound() {
	if (!rainNoiseNode) return;
	const now = audioCtx.currentTime;
	if (rainGainNode) {
		rainGainNode.gain.linearRampToValueAtTime(0, now + 1); // Fade out suave
	}
	rainNoiseNode.stop(now + 1);
	setTimeout(() => {
		rainNoiseNode = null;
		rainGainNode = null;
	}, 1000);
}

let propellerOscNode = null;
let propellerGainNode = null;

export function startPropellerSound() {
	if (!audioCtx) initAudio();
	if (propellerOscNode) return;
	
	const now = audioCtx.currentTime;
	propellerOscNode = audioCtx.createOscillator();
	propellerOscNode.type = 'sawtooth';
	propellerOscNode.frequency.value = 60; // Frecuencia baja simulando el motor y las aspas
	
	const filter = audioCtx.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.value = 300; // Cortar agudos para un zumbido sordo
	
	propellerGainNode = audioCtx.createGain();
	propellerGainNode.gain.setValueAtTime(0, now);
	propellerGainNode.gain.linearRampToValueAtTime(0.4, now + 1.0); // Fade in
	
	propellerOscNode.connect(filter);
	filter.connect(propellerGainNode);
	propellerGainNode.connect(masterSfxGain);
	
	propellerOscNode.start(now);
}

export function stopPropellerSound() {
	if (!propellerOscNode) return;
	const now = audioCtx.currentTime;
	if (propellerGainNode) {
		propellerGainNode.gain.linearRampToValueAtTime(0, now + 0.5);
	}
	propellerOscNode.stop(now + 0.5);
	setTimeout(() => {
		propellerOscNode = null;
		propellerGainNode = null;
	}, 600);
}

export function setPropellerPitch(pitchFactor, isLooping) {
	if (!propellerOscNode || !propellerGainNode) return;
	const now = audioCtx.currentTime;
	
	if (isLooping) {
		// Sonido agudo de motor bajo estrés por fuerza G
		propellerOscNode.frequency.setTargetAtTime(140, now, 0.05); 
		propellerGainNode.gain.setTargetAtTime(0.8, now, 0.05); 
	} else {
		// Pitch normal varía entre 60 y 100 dependiendo de la aceleración
		const targetFreq = 50 + (pitchFactor * 50); 
		propellerOscNode.frequency.setTargetAtTime(targetFreq, now, 0.2); 
		propellerGainNode.gain.setTargetAtTime(0.4, now, 0.2);
	}
}
