(function () {
	var classes = {
		loginInput: 'loginInput'
	};

	var selectors = pp.buildSelectors(classes, null);
	$(function() {
		$(window).on('keydown', function (event) {
			if (!(event.ctrlKey || event.metaKey || event.altKey)) {
				$(selectors.loginInput).focus();
			}
			if (event.which === 13) {
				login();
			}
		});
		function login() {
			var username = cleanLogin($(selectors.loginInput).val().trim());
			if (username) {
				//Do login here
			}
		}
		function cleanLogin(login) {
			return $('<div/>').text(login).text();
		}
	});
})();
