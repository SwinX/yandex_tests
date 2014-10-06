var Player = function(name) {
	this.id = new Date().valueOf() + name;
	this.name = name;
	this.estimate = null;
};

Player.prototype.turn = function(estimate) {
	this.estimate = estimate;
};

Player.prototype.isTurnPerformed = function() {
	return this.estimate !== null;
};

exports.Player = Player;
