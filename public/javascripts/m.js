;(function(){
	var def = null;

	var _getDefault = function(){
	    if(typeof localStorage.getItem('default') == 'string' && localStorage.getItem('default') != ''){
	        def = JSON.parse(localStorage.getItem('default'));
	    }else{
	        def = {code: 'USD', name: '美元'};
	    }
	    var info = _createInfo(def, true);
	    return _fillBox(info, $('.cc'));
	};

	var _setDefault = function(code, name){
	    localStorage.setItem('default', JSON.stringify({code: code, name: name}));
	};

	var _createInfo = function(item, def){
		if(def) var result = $('<div class="result left"><input type="number" value="1"></div>');
		else var result = $('<div class="result left" id="amt_'+ item.code +'">0</div>');
		var flag = $('<div class="flag left"><img src="/images/flags/'+item.code+'.png" /><span>'+item.code+'</span></div>');
		var unit = $('<div class="unit">'+ item.name +'</div>');
		var clear = $('<div class="clear"></div>');
		return {flag: flag, result: result, unit: unit, clear: clear};
	};

	var _fillBox = function(info, box){
		box.empty();
		box.append(info.flag)
			.append(info.result)
			.append(info.clear)
			.append(info.unit);
		return box;
	};

	var _createBox = function(item, target){
		var box = $('<div class="'+ target +'"></div>');
		var info = _createInfo(item, false);
		box = _fillBox(info, box);
		box.on('taphold', function(){
				var item = {code: $(this).find('span').html(),
							name: $(this).find('.unit').html()
							};
				$.confirm('移除此货币？', function(ans){
					if(ans){
						box.remove();
						_removeFavorite(item);
					}
				});
			});
		box.click(function(){
			var item = {}, def_item = def;
			item.code = $(this).find('span').html();
			item.name = $(this).find('.unit').html();
			_setDefault(item.code, item.name);
			_getDefault();
			var content = _createInfo(def_item, false);
			_fillBox(content, $(this));
			_getRate();
		});
		return box;
	};

	var _setList = function(){
		$('.list').empty();
		for(var i = 0; i < types.length; i++){
			if(def.code == types[i].code) continue;
			var box = _createBox(types[i], 'currency');
			
			$('.list').append(box);
		}
	};

	var _setRate = function(r, code){
		var samount = $('input[type=number]').val();
		var tamount = samount * r.rate;
		$('#amt_' + code).html(tamount);
	};

	var _getRate = function(){
		$('.currency').each(function(){
			var code = $(this).find('span').html();
			_fetchRate(code, 0);
		});
	};

	var _fetchRate = function(target, force){
		var api = '/cc/r/'+ def.code +'/'+ target + '/' + force;
		$.ajax({url: api})
		.done(function(r){
			var samount = $('input[type=number]').val();
			var tamount = samount * r.rate;
			$('#amt_' + r.target).html(tamount.toFixed(2));
		});
	};

	var _createSection = function(idx){
		var section = $('<div class="section"></div>');
		var idx = $('<div class="index">'+ idx +'</div>');
		return section.append(idx);
	};

	var _createItem = function(key, name){
		var item = $('<div class="item"><div class="cflag"><img src="/images/flags/'+ key +'.png" /><span>'+ key +'</span><span>'+ name +'</span></div></div>')
		return item;
	};

	var _getList = function(){
		var api = '/cc/cl';
		$.ajax({url: api})
		.done(function(r){
			$('.clist').empty();
			$.each(r, function(idx, section){
				var sec = _createSection(idx);
				$.each(section, function(code, info){
					var item = _createItem(code, info.name);
					sec.append(item);
					item.click(function(){
						var newbie = {code: code, name: info.name};
						_closeList();
						var box = _createBox(newbie, 'currency');
						$('.list').append(box);
						_fetchRate(code, 0);
						_addFavorite(newbie);
					});
				});
				$('.clist').append(sec);
			});
		});
	};

/*
	var _msgBox = function(msg){
		$('.msgbox').removeClass('fadeout');
		$('.msgbox').addClass('fadein');
		var windowwidth = document.documentElement.clientWidth;
		var windowheight = document.documentElement.clientHeight;
		var msgh = $('.msgbox').height();
		var msgw = $('.msgbox').width();
		$('.msgbox').css({
			'top': windowheight/2 - msgh,
			'left': windowwidth/2 - msgw/2
		});
		$('.msgbox').html(msg);
		/*setTimeout(function(){
			$('.msgbox').removeClass('fadein');
			$('.msgbox').addClass('fadeout');
		}, 1000);
	};*/

	var _openList = function(){
		$('.page').css('display', 'none');
		$('.all').css('display', 'block');
	};

	var _closeList = function(){
		$('.page').css('display', 'block');
		$('.all').css('display', 'none');
	};

	var _addFavorite = function(item){
		var exists = false;
		for(var i = 0; i < types.length; i++){
			if(types[i].code == item.code){
				exists = true;
				break;
			}
		}
		if(! exists){
			types.push(item);
		}
		localStorage.setItem('favorites', JSON.stringify(types));
	};

	var _removeFavorite = function(item){
		for(var i = 0; i < types.length; i++){
			if(types[i].code == item.code){
				console.log(item);
				types = types.removeByCode(item.code);
				console.log(types);
				break;
			}
		}
		localStorage.setItem('favorites', JSON.stringify(types));
	};

	Array.prototype.removeByCode = function(code) {
		console.log(code);
		var tmp = [];
		for(var i = 0; i < this.length; i++){
			if(this[i].code != code){
				tmp.push(this[i]);
			}
		}
		return tmp;
	};

	var init = function(){
		_getDefault();
		_setList();
		_getRate();
		_getList();

		$('#plus').click(function(){
			_openList();
		});
		$('#close').click(function(){
			_closeList();
		});

		$('#cresult').on('change', function(){
			$('[id^="amt_"').each(function(){
				var code = $(this).attr('id').split('_')[1];
				_fetchRate(code, 0);
			});
		});
	};

	init();
}());