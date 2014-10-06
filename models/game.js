var util = require('util');
var events = require('events');
var PlayerModel = require('./player');

var Game = function() {
	this._isRoundFinished = false;
	this._roundName = 'New Round';
	this._players = {};
	console.log('game created');
};

util.inherits(Game, events.EventEmitter);

Game.prototype.getGameInfo = function(currentPlayerId) {
	return {
		currentPlayer: this._players[currentPlayerId] || null,
		players: this._players,
		isRoundFinished: this._isRoundFinished,
		roundName: this._roundName
	};
};

Game.prototype.getPlayerById = function(playerId) {
	return this._players[playerId];
};

Game.prototype.onAddPlayer = function(playerName) {
	var newPlayer = new PlayerModel.Player(playerName);
	this._players[newPlayer.id] = newPlayer;
	return newPlayer;
};

Game.prototype.onRemovePlayer = function(playerId) {
	if (!this._players[playerId]) {
		return null;
	}
	delete this._players[playerId];
	this._tryFinishRound();
};

Game.prototype.onTurn = function(playerId, estimate) {
	if (this._players[playerId]) {
		this._players[playerId].turn(estimate);
	}
	this._tryFinishRound();
};

Game.prototype.isRoundFinished = function() {
	return this._isRoundFinished;
};

Game.prototype.onChangeRoundName = function(roundName) {
	this._roundName = roundName;
};

Game.prototype.onNewRound = function() {
	for (var playerId in this._players) {
		if (this._players.hasOwnProperty(playerId)) {
			this._players[playerId].turn(null);
		}
	}
	this._isRoundFinished = false;
};

Game.prototype._areTurnsAvailable = function() {
	var self = this;
	var result = Object.keys(this._players).some(function(playerName) {
		var player = self._players[playerName];
		return !player.isTurnPerformed();
	});
	return result;
};

Game.prototype._tryFinishRound = function() {
	if (!this._areTurnsAvailable() && !this._isRoundFinished) {
		this._isRoundFinished = true;
		this.emit('roundFinished', this._players);
	}
};

exports.Game = Game;