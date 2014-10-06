(function () {
	var socket = io();
	var view = new View();

	var currentPlayerId = null;
	var players = null;
	var isRoundFinished = false;

	var $currentInput = view.getLoginInput().focus();

	$(function() {
		view.toggleGameContainer(false);

		$(document).on('keydown', function (e) {
			var event = e || window.event;
			if (!(event.ctrlKey || event.metaKey || event.altKey)) {
				$currentInput.focus();
			}
			if (event.which === 13) {
				if (isLoggedIn()) {
					changeRoundName();
				} else {
					login();
				}
			}
		});

		view.getRestartRoundButton().on('click', function() {
			socket.emit('newRound');
		});

		view.getEstimateButtons().on('click', function() {
			var estimate = $(this).data('estimate');
			socket.emit('turn', estimate);
			view.getEstimateButtons().prop('disabled', true);

			var currentPlayer = players[currentPlayerId];
			currentPlayer.estimate = estimate;
			view.renderPlayer(currentPlayer, true);
		});

		function login() {
			var name = cleanInput($currentInput.val());
			if (name) {
				socket.emit('addPlayer', name);
			}
		}

		function isLoggedIn() {
			return players !== null;
		}

		function changeRoundName() {
			var newRoundName = cleanInput($currentInput.val());
			if (newRoundName) {
				view.renderRoundName(newRoundName);
				socket.emit('changeRoundName', newRoundName);
			}
		}

		function cleanInput(input) {
			var trimmed = $.trim(input);
			return $('<div/>').text(trimmed).text();
		}

		//Socket evens
		socket.on('login', function(data) {
			view.toggleLoginContainer(false);
			view.toggleGameContainer(true);

			$currentInput = view.getRoundNameInput();

			currentPlayerId = data.currentPlayer.id;
			players = data.players;

			isRoundFinished = data.isRoundFinished;
			view.getEstimateButtons().prop('disabled', isRoundFinished);

			view.currentPlayerId = currentPlayerId;
			view.renderRoundName(data.roundName);
			view.renderPlayers(players, isRoundFinished);
		});

		socket.on('changeRoundName', function(newRoundName) {
			view.renderRoundName(newRoundName);
		});

		socket.on('playerJoined', function(player) {
			if (isLoggedIn()) {
				players[player.id] = player;
				view.renderPlayer(player, isRoundFinished);
			}
		});

		socket.on('playerLeft', function(player) {
			if (isLoggedIn()) {
				var leftPlayer = players[player.id];
				view.removePlayerNode(leftPlayer);
				delete players[leftPlayer.id];
			}
		});

		socket.on('newRound', function() {
			if (!isLoggedIn()) {
				return;
			}
			isRoundFinished = false;
			for (var playerId in players) {
				if (players.hasOwnProperty(playerId)) {
					players[playerId].estimate = null;
				}
			}
			view.getEstimateButtons().prop('disabled', false);
			view.renderPlayers(players, isRoundFinished);
		});

		socket.on('roundFinished', function(finishedPlayers) {
			if (!isLoggedIn()) {
				return;
			}
			isRoundFinished = true;
			for (var playerId in finishedPlayers) {
				if (finishedPlayers.hasOwnProperty(playerId)) {
					players[playerId].estimate = finishedPlayers[playerId].estimate;
				}
			}
			view.renderPlayers(players, isRoundFinished);
		});
	});
})();
