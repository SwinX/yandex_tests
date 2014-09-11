var io = null;

var players = {};
var roundName = 'New Round';
var isRoundFinished = false;

exports.initialize = function(socketIo) {
	io = socketIo;

	io.on('connection', function (socket) {
		var addedPlayer = false;

		socket.on('addPlayer', function(playerName) {
			socket.playerName = playerName;
			players[playerName] = {
				name: playerName,
				estimate: null
			};
			addedPlayer = true;
			socket.emit('login', {
				players: players,
				roundName: roundName,
				isRoundFinished: isRoundFinished
			});
			socket.broadcast.emit('playerJoined', players[playerName]);
		});

		socket.on('roundNameChanged', function(newRoundName) {
			roundName = newRoundName;
			socket.broadcast.emit('roundNameChanged', newRoundName);
		});

		socket.on('turn', function(estimate) {
			players[socket.playerName].estimate = estimate;
			tryFinishRound(socket);
		});

		socket.on('newRound', function() {
			clearEstimates();
			isRoundFinished = false;
			socket.emit('newRound');
			socket.broadcast.emit('newRound');
		});

		socket.on('disconnect', function() {
			if (addedPlayer) {
				var leftPlayer = players[socket.playerName];
				socket.broadcast.emit('playerLeft', leftPlayer);
				delete players[socket.playerName];
				tryFinishRound(socket);
			}
		});

		var tryFinishRound = function(socket) {
			if (!areTurnsAvailable() && !isRoundFinished) {
				isRoundFinished = true;
				socket.emit('roundFinished', players);
				socket.broadcast.emit('roundFinished', players);
			}
		};

	});
};

var areTurnsAvailable = function() {
	for (var playerName in players) {
		if (players.hasOwnProperty(playerName)) {
			var player = players[playerName];
			if (player.estimate === null) {
				return true;
			}
		}
	}
	return false;
};

var clearEstimates = function() {
	for (var playerName in players) {
		if (players.hasOwnProperty(playerName)) {
			players[playerName].estimate = null;
		}
	}
};
