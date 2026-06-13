/**
 * AI SUMMARY: Handles rain particle effects and weather transitions.
 */
export class Rain {
	constructor() {
		const particleCount = 1500;
		const geometry = new THREE.BufferGeometry();
		const vertices = [];
		const velocities = [];

		for (let i = 0; i < particleCount; i++) {
			const x = Math.random() * 600 - 300;
			const y = Math.random() * 400;
			const z = Math.random() * 600 - 300;
			vertices.push(x, y, z);
			velocities.push(0); 
		}

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1));

		const material = new THREE.PointsMaterial({
			color: 0x88aacc,
			size: 1.5,
			transparent: true,
			opacity: 0.6
		});

		this.mesh = new THREE.Points(geometry, material);
		this.mesh.visible = false;
	}

	update() {
		if (!this.mesh.visible) return;
		
		const positions = this.mesh.geometry.attributes.position.array;
		const velocities = this.mesh.geometry.attributes.velocity.array;
		
		for (let i = 0; i < positions.length; i += 3) {
			velocities[i / 3] -= 0.2 + Math.random() * 0.2; // Gravedad hacia abajo
			positions[i + 1] += velocities[i / 3]; 
			positions[i] -= 1; // Viento de lado
			positions[i + 2] += 1; // Viento hacia cámara
			
			if (positions[i + 1] < -50) {
				positions[i + 1] = 300 + Math.random() * 100;
				positions[i] = Math.random() * 600 - 200;
				positions[i + 2] = Math.random() * -600 + 100;
				velocities[i / 3] = 0;
			}
		}
		
		this.mesh.geometry.attributes.position.needsUpdate = true;
	}
}
