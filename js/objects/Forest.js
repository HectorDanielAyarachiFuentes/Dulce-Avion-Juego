import { Colors } from '../utils/colors.js';

export const Tree = function() {
	this.mesh = new THREE.Object3D();
	
	// Trunk
	const trunkGeom = new THREE.CylinderGeometry(5, 5, 20, 5);
	const trunkMat = new THREE.MeshPhongMaterial({
		color: Colors.brownDark,
		flatShading: true
	});
	const trunk = new THREE.Mesh(trunkGeom, trunkMat);
	trunk.position.y = 10;
	trunk.castShadow = true;
	trunk.receiveShadow = true;
	this.mesh.add(trunk);
	
	// Leaves
	const leavesGeom = new THREE.CylinderGeometry(0, 20, 40, 5);
	const leavesMat = new THREE.MeshPhongMaterial({
		color: Colors.greenDark,
		flatShading: true
	});
	const leaves = new THREE.Mesh(leavesGeom, leavesMat);
	leaves.position.y = 35;
	leaves.castShadow = true;
	leaves.receiveShadow = true;
	this.mesh.add(leaves);
};

export const CutTree = function() {
	this.mesh = new THREE.Object3D();
	
	const trunkGeom = new THREE.CylinderGeometry(6, 6, 10, 5);
	const trunkMat = new THREE.MeshPhongMaterial({
		color: Colors.brownLight,
		flatShading: true
	});
	const trunk = new THREE.Mesh(trunkGeom, trunkMat);
	trunk.position.y = 5;
	trunk.castShadow = true;
	trunk.receiveShadow = true;
	this.mesh.add(trunk);
};

export const Bush = function() {
	this.mesh = new THREE.Object3D();
	
	const geom = new THREE.BoxGeometry(10, 10, 10);
	const mat = new THREE.MeshPhongMaterial({
		color: Colors.green,
		flatShading: true
	});
	
	const nBlocs = 3 + Math.floor(Math.random() * 3);
	for (let i = 0; i < nBlocs; i++) {
		const m = new THREE.Mesh(geom, mat);
		m.position.x = (Math.random() - 0.5) * 15;
		m.position.y = Math.random() * 5 + 5;
		m.position.z = (Math.random() - 0.5) * 15;
		m.rotation.z = Math.random() * Math.PI * 2;
		m.rotation.y = Math.random() * Math.PI * 2;
		
		const s = .5 + Math.random() * .5;
		m.scale.set(s, s, s);
		m.castShadow = true;
		m.receiveShadow = true;
		this.mesh.add(m);
	}
};

export const Forest = function() {
	this.mesh = new THREE.Object3D();
	
	const nTrees = 60;
	const nCutTrees = 15;
	const nBushes = 40;
	
	const h = 2995; 

	// Helper to place objects
	const placeItem = (item, count) => {
		const stepAngle = Math.PI * 2 / count;
		for(let i=0; i<count; i++) {
			let instance;
			if(item === 'tree') instance = new Tree();
			if(item === 'cut') instance = new CutTree();
			if(item === 'bush') instance = new Bush();
			
			const a = stepAngle*i + (Math.random() - 0.5) * 0.5;
			
			instance.mesh.position.y = Math.sin(a)*h;
			instance.mesh.position.x = Math.cos(a)*h;
			instance.mesh.rotation.z = a - Math.PI/2;
			instance.mesh.position.z = -500 + Math.random()*1000;
			
			const s = 1 + Math.random()*1.5;
			instance.mesh.scale.set(s,s,s);
			
			this.mesh.add(instance.mesh);
		}
	};
	
	placeItem('tree', nTrees);
	placeItem('cut', nCutTrees);
	placeItem('bush', nBushes);
};
