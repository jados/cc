var express = require('express');
var router = express.Router();
var Currency = require('../modules/cc');

//to get rate
router.get('/r/:scur/:tcur/:force', function(req,res){
	var scur = req.params.scur || '';
	var tcur = req.params.tcur || '';
	var force = req.params.force || 0;

	if(scur == '' || tcur == ''){
		res.send('<h1>Invalid request</h1>');
	}else{
		Currency.getRate(scur, tcur, force)
		.then(function(d){
			var d = Currency.d2j(d);
			d.source = scur;
			d.target = tcur;
			res.json(d);
		}).catch(function(e){
			Currency.errHandler(e, scur, tcur)
			.then(function(d){
				var d = Currency.d2j(d);
				d.source = scur;
				d.target = tcur;
				res.json(d);
			}).catch(function(e){
				res.send(e);
			});
		});
	}
});

//to get currency data
router.get('/c/:code', function(req, res){
	var code = req.params.code || '';
	if(code == ''){
		res.send('<h1>Invalid request</h1>');
	}else{
		Currency.getItem(code)
		.then(function(d){
			res.json(d);
		}).catch(function(e){
			res.status(400).send('CNOENT: '+ e);
		});
	}
});

//to get currency list
router.get('/cl', function(req, res){
	res.json(Currency.money);
});

router.get('/cl/:idx', function(req, res){
	var idx = req.params.idx.toUpperCase();
	Currency.list(idx)
	.then(function(d){
		res.json(d);
	}).catch(function(e){
		res.status(400).send('CNOENT: '+ e);
	})
});

router.use(function(req, res, next) {
	res.status(404).send('<h1>Invalid request</h1>');
});

module.exports = router;