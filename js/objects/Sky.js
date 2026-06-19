/**
 * AI SUMMARY: Defines the Sky object with moving clouds, sun, and moon.
 */
import { Colors } from '../utils/colors.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const Cloud = function () {
	this.mesh = new THREE.Object3D();

	const geom = new THREE.BoxGeometry(20, 20, 20);

	const mat = new THREE.MeshPhongMaterial({
		color: 0xffeedd, // Warm tint
		flatShading: true
	});

	const nBlocs = 3 + Math.floor(Math.random() * 4);
	for (let i = 0; i < nBlocs; i++) {
		const m = new THREE.Mesh(geom, mat);

		m.position.x = i * 15;
		m.position.y = Math.random() * 5; 
		m.position.z = Math.random() * 10;
		
		// No rotation to keep them perfectly flat and aligned, mimicking low-poly stylized clouds
		m.rotation.z = 0;
		m.rotation.y = 0;

		// scale: flat and wide
		const scaleWidth = 0.5 + Math.random() * 1.5;
		const scaleHeight = 0.2 + Math.random() * 0.3;
		const scaleDepth = 0.5 + Math.random() * 1.5;
		m.scale.set(scaleWidth, scaleHeight, scaleDepth);

		m.castShadow = true;
		m.receiveShadow = true;

		this.mesh.add(m);
	}
};

export const Sky = function () {
	this.mesh = new THREE.Object3D();
	this.celestials = new THREE.Object3D(); // Contenedor para sol y luna (no gira con las nubes)
	this.nClouds = 60; // Más nubes
	
	const stepAngle = Math.PI * 2 / this.nClouds;

	for (let i = 0; i < this.nClouds; i++) {
		const c = new Cloud();
		const a = stepAngle * i;
		const h = 3200 + Math.random() * 400; // Radius + distance

		c.mesh.position.y = Math.sin(a) * h;
		c.mesh.position.x = Math.cos(a) * h;
		c.mesh.rotation.z = a + Math.PI / 2;
		
		// Variación de profundidad para nubes de fondo
		c.mesh.position.z = -200 - Math.random() * 1200;

		const s = 1 + Math.random() * 2;
		c.mesh.scale.set(s, s, s);

		this.mesh.add(c.mesh);
	}

	// === EL SOL ===
	this.sun = new THREE.Object3D();
	this.sun.position.set(0, 3600, -1500); // Más alejado en el fondo
	this.celestials.add(this.sun);
	
	// Crear un efecto de halo brillante para el sol
	const haloCanvas = document.createElement('canvas');
	haloCanvas.width = 256;
	haloCanvas.height = 256;
	const hCtx = haloCanvas.getContext('2d');
	const gradient = hCtx.createRadialGradient(128, 128, 20, 128, 128, 128);
	gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
	gradient.addColorStop(0.3, 'rgba(255, 220, 100, 0.4)');
	gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
	hCtx.fillStyle = gradient;
	hCtx.fillRect(0, 0, 256, 256);
	const haloTexture = new THREE.CanvasTexture(haloCanvas);
	const haloMat = new THREE.SpriteMaterial({ map: haloTexture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
	const sunHalo = new THREE.Sprite(haloMat);
	sunHalo.scale.set(1200, 1200, 1); // Tamaño del halo
	this.sun.add(sunHalo);

	// === LA LUNA ===
	this.moon = new THREE.Object3D();
	this.moon.position.set(0, -3600, -1500); // Exactamente opuesto al sol y alejada
	this.celestials.add(this.moon);

	const loader = new GLTFLoader();

	// Cargar Sol
	loader.load('assets/models/astros/Sun.glb', gltf => {
		const model = gltf.scene;
		model.scale.set(120, 120, 120); 
		model.traverse(child => {
			if (child.isMesh) {
				child.material.fog = false; // El sol siempre brilla
			}
		});
		this.sun.add(model);
	});

	// Cargar Luna
	loader.load('assets/models/astros/Moon.glb', gltf => {
		const model = gltf.scene;
		model.scale.set(3, 3, 3);
		model.traverse(child => {
			if (child.isMesh) {
				child.material.fog = false; // La niebla no oculta la luna
				// Hacemos que emita un poco de luz propia para que los cráteres se vean nítidos
				if (child.material) {
					child.material.emissive = new THREE.Color(0x444444); 
					child.material.emissiveIntensity = 0.8;
				}
			}
		});
		this.moon.add(model);
	});
};
