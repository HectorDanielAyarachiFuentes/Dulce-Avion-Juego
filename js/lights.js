/**
 * AI SUMMARY: Configures lighting for the 3D scene (Ambient, Hemisphere, Directional).
 */
export let hemisphereLight, shadowLight, ambientLight;

export function createLights(scene) {
	ambientLight = new THREE.AmbientLight(0xfaebd7, 3.5);

	hemisphereLight = new THREE.HemisphereLight(0xe6a685, 0x59332e, 4.5);

	shadowLight = new THREE.DirectionalLight(0xffeedd, 4.0);
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
