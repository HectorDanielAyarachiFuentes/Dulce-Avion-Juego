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
		masterMusicGain.gain.setValueAtTime(muted ? 0 : 0.6, audioCtx.currentTime);
	}
}

export function setSfxMuted(muted) {
	isSfxMuted = muted;
	if (masterSfxGain) {
		masterSfxGain.gain.setValueAtTime(muted ? 0 : 1.0, audioCtx.currentTime);
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

	const osc = audioCtx.createOscillator();
	osc.type = 'sawtooth';
	osc.frequency.setValueAtTime(150, now);
	osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
	
	const oscGain = audioCtx.createGain();
	oscGain.gain.setValueAtTime(0.6, now);
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
	
	osc.connect(oscGain);
	oscGain.connect(masterSfxGain);
	
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
	noiseGain.connect(masterSfxGain);
	
	osc.start(now);
	osc.stop(now + 0.6);
	noise.start(now);
	noise.stop(now + 0.6);
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
		1: { // 2. Lamento de la Puna (Andina Triste 1)
			bpm: 65,
			chords: [[110.00, 130.81, 164.81], [98.00, 146.83, 196.00], [110.00, 130.81, 164.81], [82.41, 110.00, 164.81]], // Escala pentatónica menor (Am)
			style: 'sad_andina_lamento'
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
		const chordIndex = measureIndex % 4;
		const chord = currentSong.chords[chordIndex];
		const rootFreq = chord[0];
		
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
			
		} else if (currentSong.style === 'sad_andina_lamento') {
			// LAMENTO DE LA PUNA (Intro Triste -> Desarrollo Melancólico -> Final "Triste pero Alegre")
			const isEnd = measureIndex >= 16;
			
			// En el final forzamos acordes mayores (C Mayor y Fa Mayor) para darle ese toque "esperanzador y alegre" dentro de la tristeza
			let playChord = chord;
			let playRoot = rootFreq;
			if (isEnd) {
				const happyEndingChords = [[130.81, 164.81, 196.00], [98.00, 146.83, 196.00], [87.31, 130.81, 174.61], [130.81, 164.81, 196.00]]; // C, G, F, C
				playChord = happyEndingChords[chordIndex];
				playRoot = playChord[0];
			}
			
			// Bajo andino base
			playNote(playRoot / 2, 'triangle', startTime, beatDuration * 2, 0.4);
			playNote(playRoot / 2, 'triangle', startTime + beatDuration * 2, beatDuration * 2, 0.4);
			
			if (isIntro) {
				// 1. INICIO: Nota solitaria y triste al principio (Zampoña)
				playNote(playRoot * 2, 'sine', startTime, beatDuration * 4, 0.35);
			} else if (isDev) {
				// 2. DESARROLLO: Melancólico, arpegios lentos de Charango
				for (let i = 0; i < 4; i++) {
					const time = startTime + i * beatDuration;
					playNote(playChord[i % 3] * 2, 'triangle', time, beatDuration, 0.25);
				}
				// Zampoña llorando de fondo
				playNote(playChord[1] * 2, 'sine', startTime, beatDuration * 4, 0.2);
			} else if (isEnd) {
				// 3. FINAL: Triste pero Alegre. Entra percusión andina y la melodía se acelera y vuelve mayor
				for (let i = 0; i < 8; i++) {
					const time = startTime + i * (beatDuration / 2);
					playNote(playChord[i % 3] * 2, 'triangle', time, beatDuration/2, 0.2);
				}
				// Bombo y Chasquido (Caja)
				playDrum('kick', startTime);
				playDrum('snare', startTime + beatDuration);
				playDrum('kick', startTime + beatDuration * 2);
				playDrum('snare', startTime + beatDuration * 3);
				
				// Zampoña luminosa
				playNote(playChord[2] * 2, 'sine', startTime, beatDuration * 4, 0.3);
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
			if (currentSong.style === 'sad_andina_lamento' && currentMeasure >= 24) {
				currentMeasure = 0; // El Lamento repite su ciclo emocional completo (Intro -> Dev -> Alegría)
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
	
	const noise = audioCtx.createBufferSource();
	noise.buffer = getNoiseBuffer();
	const noiseFilter = audioCtx.createBiquadFilter();
	noiseFilter.type = 'lowpass';
	noiseFilter.frequency.setValueAtTime(800, now);
	noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 1.5);
	
	const gain = audioCtx.createGain();
	gain.gain.setValueAtTime(1.0, now);
	gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
	
	noise.connect(noiseFilter);
	noiseFilter.connect(gain);
	gain.connect(masterSfxGain);
	
	// Rumble osc
	const osc = audioCtx.createOscillator();
	osc.type = 'square';
	osc.frequency.setValueAtTime(40, now);
	osc.frequency.exponentialRampToValueAtTime(10, now + 1.5);
	const oscGain = audioCtx.createGain();
	oscGain.gain.setValueAtTime(0.8, now);
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
	osc.connect(oscGain);
	oscGain.connect(masterSfxGain);
	
	noise.start(now);
	noise.stop(now + 1.5);
	osc.start(now);
	osc.stop(now + 1.5);
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
