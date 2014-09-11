var views = {
	index: 'index'
}

exports.renderIndex = function(request, response) {
	response.render(views.index);
};