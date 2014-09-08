(function() {
	window.pp = {}; // PP is short for Planning Poker

	var buildSelectors = function(selectors, source, characterToPrependWith) {
		$.each(source, function(propertyName, value){
			selectors[propertyName] = characterToPrependWith + value;
		});
	};

	pp.buildSelectors = function(classNames, ids) {
		var selectors = {};
		if(classNames) {
			buildSelectors(selectors, classNames, ".");
		}
		if(ids) {
			buildSelectors(selectors, ids, "#");
		}
		return selectors;
	};
})();
