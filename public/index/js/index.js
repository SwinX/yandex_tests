(function () {
	var classes = {
		loginContainer: 'loginContainer',
		loginInput: 'loginInput',
		gameContainer: 'gameContainer',
		roundTitle: 'roundTitle',
		roundNameInput: 'roundNameInput',
		restartRoundContainer: 'restartRoundContainer',
		estimateSettingContainer: 'estimateSettingContainer',
		playersList: 'playersList',

		row: 'row',
		col: 'col',
		playerName: 'playerName',
		playerEstimate: 'playerEstimate',

		button: 'button',

		displayNone: 'displayNone'
	};

	var selectors = pp.buildSelectors(classes, null);

	var socket = io();
	var currentPlayerId = null;
	var players = null;
	var isRoundFinished = false;
	var $currentInput = $(selectors.loginInput).focus();

	var $playersList = $(selectors.playersList);
	var $estimateButtons = $(selectors.estimateSettingContainer).find('input[type=button]');

	$(function() {
		$(selectors.gameContainer).fadeOut(0);

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

		$(selectors.restartRoundContainer).find('input[type=button]').on('click', function() {
			socket.emit('newRound');
		});

		$estimateButtons.on('click', function() {
			var estimate = $(this).data('estimate');
			socket.emit('turn', estimate);
			$estimateButtons.prop('disabled', true);

			var currentPlayer = players[currentPlayerId];
			currentPlayer.estimate = estimate;
			renderPlayer(currentPlayer, true);
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
				renderRoundName(newRoundName);
				socket.emit('changeRoundName', newRoundName);
			}
		}

		function cleanInput(input) {
			var trimmed = $.trim(input);
			return $('<div/>').text(trimmed).text();
		}

		//rendering

		function renderPlayers(mustShowEstimates) {
			$playersList.empty();
			for (var player in players) {
				if (players.hasOwnProperty(player)) {
					$playersList.append(renderPlayer(players[player], mustShowEstimates));
				}
			}
		}

		function renderPlayer(player, mustShowEstimates) {
			var $li = player.htmlNode || createPlayerNode();
			var $playerNameDiv = $li.find(selectors.playerName);
			$playerNameDiv.text(player.name);
			$playerNameDiv.css('color', player.name === currentPlayerId ? 'red' : 'black');
			$li.find(selectors.playerEstimate).text(mustShowEstimates ? player.estimate || 'No estimate' : '*');
			player.htmlNode = $li;
			return $li;
		}

		function createPlayerNode() {
			var $li = $('<li />');
			var $row = $('<div />', {
				"class": classes.row
			});
			$row.append($('<div />', {
				"class": classes.playerName + ' ' + classes.col
			}));
			$row.append($('<div />', {
				"class": classes.playerEstimate + ' ' + classes.col
			}));
			$li.append($row);
			return $li;
		}

		function renderRoundName(newRoundName) {
			$(selectors.roundTitle).text(newRoundName);
		}

		//Socket evens
		socket.on('login', function(data) {
			$(selectors.loginContainer).fadeOut();
			$(selectors.loginContainer).off('click');
			$(selectors.gameContainer).show();
			$(selectors.gameContainer).removeClass(classes.displayNone);
			$currentInput = $(selectors.roundNameInput);
			currentPlayerId = data.currentPlayer.id;
			players = data.players;
			isRoundFinished = data.isRoundFinished;
			$estimateButtons.prop('disabled', isRoundFinished);
			renderRoundName(data.roundName);
			renderPlayers(isRoundFinished);
		});

		socket.on('changeRoundName', function(newRoundName) {
			renderRoundName(newRoundName);
		});

		socket.on('playerJoined', function(player) {
			if (isLoggedIn()) {
				players[player.id] = player;
				$playersList.append(renderPlayer(player, isRoundFinished));
			}
		});

		socket.on('playerLeft', function(player) {
			if (isLoggedIn()) {
				var leftPlayer = players[player.id];
				leftPlayer.htmlNode.remove();
				delete players[leftPlayer.id];
			}
		});

		socket.on('newRound', function() {
			if (!isLoggedIn()) {
				return;
			}
			isRoundFinished = true;
			for (var playerId in players) {
				if (players.hasOwnProperty(playerId)) {
					players[playerId].estimate = null;
				}
			}
			$estimateButtons.prop('disabled', false);
			renderPlayers(false);
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
			renderPlayers(isRoundFinished);
		});
	});
})();
