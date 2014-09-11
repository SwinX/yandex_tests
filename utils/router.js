var index = require('./../controllers/index');

exports.initialize = function(express) {
	var router = express.Router();
	router.get('/', function(req, res) {
		index.renderIndex(req, res);
	});
	return router;
};
