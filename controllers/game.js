var GameModel = require('./../models/game');

var io = null;
var game = new GameModel.Game();

exports.initialize = function(socketIo) {
	io = socketIo;

	game.on('roundFinished', function(players) {
		io.emit('roundFinished', players);
	});

	io.on('connection', function (socket) {

		var addedPlayer = false;

		socket.on('addPlayer', function(playerName) {
			var player = game.onAddPlayer(playerName);
			socket.playerId = player.id;
			addedPlayer = true;

			socket.emit('login', game.getGameInfo(socket.playerId));
			socket.broadcast.emit('playerJoined', player);
		});

		socket.on('changeRoundName', function(newRoundName) {
			game.onChangeRoundName(newRoundName);
			socket.broadcast.emit('changeRoundName', newRoundName);
		});

		socket.on('turn', function(estimate) {
			game.onTurn(socket.playerId, estimate)
		});

		socket.on('newRound', function() {
			game.onNewRound();
			socket.emit('newRound');
			socket.broadcast.emit('newRound');
		});

		socket.on('disconnect', function() {
			if (addedPlayer) {
				var leftPlayer = game.getPlayerById(socket.playerId);
				socket.broadcast.emit('playerLeft', leftPlayer);
				game.onRemovePlayer(socket.playerId);
			}
		});
	});
};
