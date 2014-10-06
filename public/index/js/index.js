(function () {
	var socket = io();
	var renderer = new Renderer();

	var currentPlayerId = null;
	var players = null;
	var isRoundFinished = false;

	var $currentInput = renderer.getLoginInput().focus();

	$(function() {
		renderer.toggleGameContainer(false);

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

		renderer.getRestartRoundButton().on('click', function() {
			socket.emit('newRound');
		});

		renderer.getEstimateButtons().on('click', function() {
			var estimate = $(this).data('estimate');
			socket.emit('turn', estimate);
			renderer.getEstimateButtons().prop('disabled', true);

			var currentPlayer = players[currentPlayerId];
			currentPlayer.estimate = estimate;
			renderer.renderPlayer(currentPlayer, true);
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
				renderer.renderRoundName(newRoundName);
				socket.emit('changeRoundName', newRoundName);
			}
		}

		function cleanInput(input) {
			var trimmed = $.trim(input);
			return $('<div/>').text(trimmed).text();
		}

		//Socket evens
		socket.on('login', function(data) {
			renderer.toggleLoginContainer(false);
			renderer.toggleGameContainer(true);

			$currentInput = renderer.getRoundNameInput();

			currentPlayerId = data.currentPlayer.id;
			players = data.players;

			isRoundFinished = data.isRoundFinished;
			renderer.getEstimateButtons().prop('disabled', isRoundFinished);

			renderer.currentPlayerId = currentPlayerId;
			renderer.renderRoundName(data.roundName);
			renderer.renderPlayers(players, isRoundFinished);
		});

		socket.on('changeRoundName', function(newRoundName) {
			renderer.renderRoundName(newRoundName);
		});

		socket.on('playerJoined', function(player) {
			if (isLoggedIn()) {
				players[player.id] = player;
				renderer.renderPlayer(player, isRoundFinished);
			}
		});

		socket.on('playerLeft', function(player) {
			if (isLoggedIn()) {
				var leftPlayer = players[player.id];
				renderer.removePlayerNode(leftPlayer);
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
			renderer.getEstimateButtons().prop('disabled', false);
			renderer.renderPlayers(players, isRoundFinished);
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
			renderer.renderPlayers(players, isRoundFinished);
		});
	});
})();
