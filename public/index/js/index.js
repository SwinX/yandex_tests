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

		displayNone: 'displayNone'
	};

	var selectors = pp.buildSelectors(classes, null);

	var socket = io();
	var currentPlayerName = null;
	var players = null;
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

			var currentPlayer = players[currentPlayerName];
			currentPlayer.estimate = estimate;
			renderPlayer(currentPlayer, true);
		});

		function login() {
			var name = cleanInput($currentInput.val().trim());
			if (name) {
				currentPlayerName = name;
				socket.emit('addPlayer', name);
			}
		}

		function isLoggedIn() {
			return players !== null;
		}

		function changeRoundName() {
			var newRoundName = cleanInput($.trim($currentInput.val()));
			if (newRoundName) {
				renderRoundName(newRoundName);
				socket.emit('roundNameChanged', newRoundName);
			}
		}

		function cleanInput(login) {
			return $('<div/>').text(login).text();
		}

		//rendering

		function renderPlayers(mustShowEstimates) {
			$playersList.empty();
			for (player in players) {
				if (players.hasOwnProperty(player)) {
					$playersList.append(renderPlayer(players[player], mustShowEstimates));
				}
			}
		}

		function renderPlayer(player, mustShowEstimates) {
			var $li = player.htmlNode || createPlayerNode();
			var $playerNameDiv = $li.find(selectors.playerName);
			$playerNameDiv.text(player.name);
			$playerNameDiv.css('color', player.name === currentPlayerName ? 'red' : 'black');
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
			$(selectors.gameContainer).removeClass(classes.displayNone)
			$currentInput = $(selectors.roundNameInput);
			players = data.players;
			$estimateButtons.prop('disabled', data.isRoundFinished);
			renderRoundName(data.roundName);
			renderPlayers(data.isRoundFinished);
		});

		socket.on('roundNameChanged', function(newRoundName) {
			renderRoundName(newRoundName);
		});

		socket.on('playerJoined', function(player) {
			if (isLoggedIn()) {
				players[player.name] = player;
				$playersList.append(renderPlayer(player, false));
			}
		});

		socket.on('playerLeft', function(player) {
			if (isLoggedIn()) {
				var leftPlayer = players[player.name];
				leftPlayer.htmlNode.remove();
				delete players[leftPlayer.name];
			}
		});

		socket.on('newRound', function() {
			if (!isLoggedIn()) {
				return;
			}
			for (player in players) {
				if (players.hasOwnProperty(player)) {
					players[player].estimate = null;
				}
			}
			$estimateButtons.prop('disabled', false);
			renderPlayers(false);
		});

		socket.on('roundFinished', function(finishedPlayers) {
			if (!isLoggedIn()) {
				return;
			}
			for (player in finishedPlayers) {
				if (finishedPlayers.hasOwnProperty(player)) {
					players[player].estimate = finishedPlayers[player].estimate;
				}
			}
			renderPlayers(true);
		});
	});
})();
