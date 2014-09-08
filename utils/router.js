var index = require('./../controllers/index');

exports.initialize = function(express) {
	var router = express.Router();
	router.get('/', function(req, res) {
		index.renderIndex(req, res);
	});

	router.get('/icons', function(req, res) {
		res.render('icons');
	});

	router.get('/button', function(req, res) {
		res.send('Magic button will be here');
		res.end();
	});

	router.get('/rating', function (req, res) {
		res.send('Rating control will be here');
		res.end();
	});
	return router;
};
