(function() {
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

	function Renderer() {
		if (!this instanceof  Renderer) {
			throw new Error('Renderer constructor called without "new".');
		}

		this.currentPlayerId = null;

		this._playerNodes = {};

		this._$playersList = $(selectors.playersList);
		this._$estimateButtons = $(selectors.estimateSettingContainer).find('input[type=button]');
	};

	Renderer.prototype.getEstimateButtons = function() {
		return this._$estimateButtons;
	};

	Renderer.prototype.getRestartRoundButton = function() {
		return $(selectors.restartRoundContainer).find('input[type=button]');
	};

	Renderer.prototype.getLoginInput = function() {
		return $(selectors.loginInput);
	};

	Renderer.prototype.getRoundNameInput = function() {
		return $(selectors.roundNameInput);
	};

	Renderer.prototype.toggleLoginContainer = function(showOrHide) {
		this._toggleContainer($(selectors.loginContainer), showOrHide);
	};

	Renderer.prototype.toggleGameContainer = function(showOrHide) {
		this._toggleContainer($(selectors.gameContainer), showOrHide);
	};

	Renderer.prototype._toggleContainer = function($container, showOrHide) {
		if (showOrHide) {
			$container.show();
			$container.removeClass(classes.displayNone);
		} else {
			$container.fadeOut();
			$container.addClass(classes.displayNone);
		}
	};

	Renderer.prototype.renderPlayers = function(players, mustShowEstimates) {
		this._$playersList.empty();
		for (var playerId in players) {
			if (players.hasOwnProperty(playerId)) {
				this.renderPlayer(players[playerId], mustShowEstimates);
			}
		}
	};

	Renderer.prototype.renderPlayer = function(player, mustShowEstimates) {
		var $li = this._getPlayerNode(player);
		var $playerNameDiv = $li.find(selectors.playerName);
		$playerNameDiv.text(player.name);
		$playerNameDiv.css('color', player.id === this.currentPlayerId ? 'red' : 'black');
		$li.find(selectors.playerEstimate).text(mustShowEstimates ? player.estimate || 'No estimate' : '*');
		this._$playersList.append($li);
		return $li;
	};

	Renderer.prototype.removePlayerNode = function(player) {
		if (this._playerNodes[player.id]) {
			this._playerNodes[player.id].remove();
			delete this._playerNodes[player.id];
		}
	};

	Renderer.prototype.renderRoundName = function(roundName) {
		$(selectors.roundTitle).text(roundName);
	};

	Renderer.prototype._getPlayerNode = function(player) {
		var node = this._playerNodes[player.id];
		if (!node) {
			this._playerNodes[player.id] = this._createPlayerNode();
		}
		return this._playerNodes[player.id];
	};

	Renderer.prototype._createPlayerNode = function() {
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
	};

	window.Renderer = Renderer;

})();

