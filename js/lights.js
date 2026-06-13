/**
 * AI SUMMARY: Configures lighting for the 3D scene (Ambient, Hemisphere, Directional).
 */
export let hemisphereLight, shadowLight, ambientLight;

export function createLights(scene) {
	ambientLight = new THREE.AmbientLight(0xdc8874, 3.5);

	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 4.5);

	shadowLight = new THREE.DirectionalLight(0xffffff, 4.5);
	shadowLight.position.set(150, 350, 350);
	shadowLight.castShadow = true;

	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	scene.add(ambientLight);
	scene.add(hemisphereLight);
	scene.add(shadowLight);
}
