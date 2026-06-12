export const HUD = {
	ammoElement: null,

	init: function() {
		this.ammoElement = document.getElementById('ammo');
	},

	updateAmmo: function(currentAmmo) {
		if (this.ammoElement) {
			this.ammoElement.innerText = currentAmmo;
			if (currentAmmo === 0) {
				this.ammoElement.style.color = '#ff4444';
			}
		}
	}
};
