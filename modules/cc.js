var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var http = require('http');
var money = require('./currencies');

var Currency = {
	_appkey: '',
	_api: 'http://download.finance.yahoo.com/d/quotes.csv?e=.csv&f=sl1d1t1&s=%s=x',
	_savepath: 'rates',
	money: money
};

Currency.d2a = function(obj){
	return obj.replace(/"/g, '').replace(/\n/, '').split(',');
};

Currency.d2j = function(obj){
	var arr = Currency.d2a(obj);
	return {label: arr[0], rate: arr[1], date: arr[2], time: arr[3]};
};

Currency.saveFile = function(scur, tcur, data){
	var fp = Currency._savepath + '/' + scur + tcur;
	var wstream = fs.createWriteStream(fp);
	wstream.write(data);
	wstream.end();
};

Currency.readFile = function(scur, tcur){
	return new Promise(function(resolve, reject){
		var buf = '';
		var fp = Currency._savepath + '/' + scur + tcur;
		var rstream = fs.createReadStream(fp);
		rstream.on('data', function(d){
			buf += d;
		});
		rstream.on('end', function(){
			resolve(buf);
		});
		rstream.on('error', function(e){
			reject(e);
		});
	});
}

Currency.getRateByUrl = function(scur, tcur){
	return new Promise(function(resolve, reject){
		var buf = '';
		var url = Currency._api.replace('%s', scur + tcur);
		http.get(url, function(r){
			r.on('data', function(d){
				buf += d;
			});
			r.on('end', function(){
				Currency.saveFile(scur, tcur, buf);
				resolve(buf);
			});
			r.on('err', function(e){
				reject(e);
			});
		});
	});
};

Currency.getRateByFile = function(scur, tcur){
	var fp = Currency._savepath + '/' + scur + tcur;
	return Currency.readFile(fp);
};

Currency.getRate = function(scur, tcur, force){
	var getRateMethod = Currency.getRateByUrl;
	if(force === 0) getRateMethod = Currency.getRateByFile;

	return getRateMethod(scur, tcur);
};

Currency.errHandler = function(e, scur, tcur){
	if(e.code == 'ENOENT'){
		return Currency.getRateByUrl(scur, tcur);
	}
};

Currency.list = function(idx){
	return new Promise(function(resolve, reject){
		if(money.hasOwnProperty(idx)){
			resolve(money[idx]);
		}else{
			reject(idx);
		}
	});
};

Currency.getItem = function(code){
	return new Promise(function(resolve, reject){
		var items = {};
		var n = 0;
		var found = false;
		for(var idx in Currency.money){
			items = Currency.money[idx];
			n = 0;
			for(var k in items){
				n++;
				if(k == code){
					found = true;
					resolve(items[k]);
				}
				if(n == Object.keys(items).length){
					if(! found){
						reject(code);
					}
				}
			}
		}
	});
};

module.exports = Currency;