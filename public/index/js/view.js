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

	function View() {
		if (!this instanceof  View) {
			throw new Error('Renderer constructor called without "new".');
		}

		this.currentPlayerId = null;

		this._playerNodes = {};

		this._$currentInput = null;
		this.focusLoginInput();
		this._$playersList = $(selectors.playersList);
		this._$estimateButtons = $(selectors.estimateSettingContainer).find('input[type=button]');
	}

	View.prototype.onEstimateButtonClick = function(handler) {
		this._$estimateButtons.on('click', handler);
	};

	View.prototype.onRestartRoundButtonClick = function(handler) {
		$(selectors.restartRoundContainer).find('input[type=button]').on('click', handler);
	};

	View.prototype.toggleEstimateButtonsDisabled = function(disabledOrNot) {
		this._$estimateButtons.prop('disabled', disabledOrNot);
	};

	View.prototype.focusLoginInput = function() {
		this._$currentInput = $(selectors.loginInput);
	};

	View.prototype.focusRoundNameInput = function() {
		this._$currentInput = $(selectors.roundNameInput);
	};

	View.prototype.focusOnCurrentInput = function() {
		this._$currentInput.focus();
	};

	View.prototype.getCurrentInputValue = function() {
		return this._$currentInput.val();
	};

	View.prototype.toggleLoginContainer = function(showOrHide) {
		this._toggleContainer($(selectors.loginContainer), showOrHide);
	};

	View.prototype.toggleGameContainer = function(showOrHide) {
		this._toggleContainer($(selectors.gameContainer), showOrHide);
	};

	View.prototype._toggleContainer = function($container, showOrHide) {
		if (showOrHide) {
			$container.show();
			$container.removeClass(classes.displayNone);
		} else {
			$container.fadeOut();
			$container.addClass(classes.displayNone);
		}
	};

	View.prototype.renderPlayers = function(players, mustShowEstimates) {
		this._$playersList.empty();
		for (var playerId in players) {
			if (players.hasOwnProperty(playerId)) {
				this.renderPlayer(players[playerId], mustShowEstimates);
			}
		}
	};

	View.prototype.renderPlayer = function(player, mustShowEstimates) {
		var $li = this._getPlayerNode(player);
		var $playerNameDiv = $li.find(selectors.playerName);
		$playerNameDiv.text(player.name);
		$playerNameDiv.css('color', player.id === this.currentPlayerId ? 'red' : 'black');
		$li.find(selectors.playerEstimate).text(mustShowEstimates ? player.estimate || 'No estimate' : '*');
		this._$playersList.append($li);
		return $li;
	};

	View.prototype.removePlayerNode = function(player) {
		if (this._playerNodes[player.id]) {
			this._playerNodes[player.id].remove();
			delete this._playerNodes[player.id];
		}
	};

	View.prototype.renderRoundName = function(roundName) {
		$(selectors.roundTitle).text(roundName);
	};

	View.prototype._getPlayerNode = function(player) {
		var node = this._playerNodes[player.id];
		if (!node) {
			this._playerNodes[player.id] = this._createPlayerNode();
		}
		return this._playerNodes[player.id];
	};

	View.prototype._createPlayerNode = function() {
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

	window.View = View;

})();

