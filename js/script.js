$(document).ready(function(){
	
	// Запускаємо метод init, коли документ буде готовий:
	chat.init();
	
});

var chat = {
	
	// data містить перменная для використання в класах:
	
	data : {
		lastID 		: 0,
		noActivity	: 0
	},
	
	// Init прив'язує обробники подій і встановлює таймери:
	
	init : function(){
		
		// Використовуємо плагін jQuery defaultText, включений внизу:
		$('#name').defaultText('Псевдоним');
		$('#email').defaultText('Email (используется Gravatar)');
		
		// Конвертуємо div #chatLineHolder в jScrollPane,
// зберігаємо API плагіна в chat.data:
		
		chat.data.jspAPI = $('#chatLineHolder').jScrollPane({
			verticalDragMinHeight: 12,
			verticalDragMaxHeight: 12
		}).data('jsp');
		
		// Використовуємо перменная working для запобігання
// множинних відправок форми:
		
		var working = false;
		
		// Регістріуем персону в чаті:
		
		$('#loginForm').submit(function(){
			
			if(working) return false;
			working = true;
			
			// Використовуємо нашу функцію tzPOST
// (визначається внизу):
			
			$.tzPOST('login',$(this).serialize(),function(r){
				working = false;
				
				if(r.error){
					chat.displayError(r.error);
				}
				else chat.login(r.name,r.gravatar);
			});
			
			return false;
		});
		
		// Відправляємо дані нового рядка чату:
		
		$('#submitForm').submit(function(){
			
			var text = $('#chatText').val();
			
			if(text.length == 0){
				return false;
			}
			
			if(working) return false;
			working = true;
			
			// Генеруємо тимчасовий ID для чату:
			var tempID = 't'+Math.round(Math.random()*1000000),
				params = {
					id			: tempID,
					author		: chat.data.name,
					gravatar	: chat.data.gravatar,
					text		: text.replace(/</g,'&lt;').replace(/>/g,'&gt;')
				};

		// Використовуємо метод addChatLine, щоб додати чат на екран
// негайно, не чекаючи заверщенія запиту AJAX:
			
			chat.addChatLine($.extend({},params));
			
			// Використовуємо метод tzPOST, щоб відправити чат
// черех запит POST AJAX:
			
			$.tzPOST('submitChat',$(this).serialize(),function(r){
				working = false;
				
				$('#chatText').val('');
				$('div.chat-'+tempID).remove();
				
				params['id'] = r.insertID;
				chat.addChatLine($.extend({},params));
			});
			
			return false;
		});
		
		// Відключаємо користувача:
		
		$('a.logoutButton').live('click',function(){
			
			$('#chatTopBar > span').fadeOut(function(){
				$(this).remove();
			});
			
			$('#submitForm').fadeOut(function(){
				$('#loginForm').fadeIn();
			});
			
			$.tzPOST('logout');
			
			return false;
		});
		
		// Перевіряємо стан підключення користувача (оновлення браузера)
		
		$.tzGET('checkLogged',function(r){
			if(r.logged){
				chat.login(r.loggedAs.name,r.loggedAs.gravatar);
			}
		});
		
		// самовиконувана функції таймаута
		
		(function getChatsTimeoutFunction(){
			chat.getChats(getChatsTimeoutFunction);
		})();
		
		(function getUsersTimeoutFunction(){
			chat.getUsers(getUsersTimeoutFunction);
		})();
		
	},
	
	// Метод login приховує дані реєстрації користувача
// і виводить форму написання повідомлення
	
	login : function(name,gravatar){
		
		chat.data.name = name;
		chat.data.gravatar = gravatar;
		$('#chatTopBar').html(chat.render('loginTopBar',chat.data));
		
		$('#loginForm').fadeOut(function(){
			$('#submitForm').fadeIn();
			$('#chatText').focus();
		});
		
	},
	
	// Метод render генерує розмітку HTML,
// яка потрібна для інших методів:
	
	render : function(template,params){
		
		var arr = [];
		switch(template){
			case 'loginTopBar':
				arr = [
				'<span><img src="',params.gravatar,'" width="23" height="23" />',
				'<span class="name">',params.name,
				'</span><a href="" class="logoutButton rounded">Выйти</a></span>'];
			break;
			
			case 'chatLine':
				arr = [
					'<div class="chat chat-',params.id,' rounded"><span class="gravatar"><img src="',params.gravatar,
					'" width="23" height="23" onload="this.style.visibility=\'visible\'" />','</span><span class="author">',params.author,
					':</span><span class="text">',params.text,'</span><span class="time">',params.time,'</span></div>'];
			break;
			
			case 'user':
				arr = [
					'<div class="user" title="',params.name,'"><img src="',
					params.gravatar,'" width="30" height="30" onload="this.style.visibility=\'visible\'" /></div>'
				];
			break;
		}
		
		// Єдиний метод join для масиву виконується
// бисстрее, ніж множинні злиття рядків
		
		return arr.join('');
		
	},
	
	// Метод addChatLine додає рядок чату на сторінку
	
	addChatLine : function(params){
		
		// Все показання часу виводяться в форматі тимчасового пояса користувача
		
		var d = new Date();
		if(params.time) {
			
			// PHP повертає час в форматі UTC (GMT). Ми використовуємо його для формування об'єкта date
// і подальшого виведення в форматі тимчасового пояса користувача.
// JavaScript конвертує його для нас.
			
			d.setUTCHours(params.time.hours,params.time.minutes);
		}
		
		params.time = (d.getHours() < 10 ? '0' : '' ) + d.getHours()+':'+
					  (d.getMinutes() < 10 ? '0':'') + d.getMinutes();
		
		var markup = chat.render('chatLine',params),
			exists = $('#chatLineHolder .chat-'+params.id);

		if(exists.length){
			exists.remove();
		}
		
		if(!chat.data.lastID){
			// Якщо це перший запис в чаті, видаляємо
// параграф з повідомленням про те, що ще нічого не написано:
			
			$('#chatLineHolder p').remove();
		}
		
		// Если это не временная строка чата:
		if(params.id.toString().charAt(0) != 't'){
			var previous = $('#chatLineHolder .chat-'+(+params.id - 1));
			if(previous.length){
				previous.after(markup);
			}
			else chat.data.jspAPI.getContentPane().append(markup);
		}
		else chat.data.jspAPI.getContentPane().append(markup);
		
		// Так як ми додали новий контент, потрібно
// знову ініціювати плагін jScrollPane:
		
		chat.data.jspAPI.reinitialise();
		chat.data.jspAPI.scrollToBottom(true);
		
	},
	
	// Даний метод запитує останній запис в чаті
// (починаючи з lastID), і додає її на сторінку.
	
	getChats : function(callback){
		$.tzGET('getChats',{lastID: chat.data.lastID},function(r){
			
			for(var i=0;i<r.chats.length;i++){
				chat.addChatLine(r.chats[i]);
			}
			
			if(r.chats.length){
				chat.data.noActivity = 0;
				chat.data.lastID = r.chats[i-1].id;
			}
			else{
				// Якщо немає записів в чаті, збільшуємо
// лічильник noActivity.
				
				chat.data.noActivity++;
			}
			
			if(!chat.data.lastID){
				chat.data.jspAPI.getContentPane().html('<p class="noChats">Ничего еще не написано</p>');
			}
			
			// Встановлюємо таймаут для наступного запиту
// в залежності активності чату:
			
			var nextRequest = 1000;
			
			// 2 секунди
			if(chat.data.noActivity > 3){
				nextRequest = 2000;
			}
			
			if(chat.data.noActivity > 10){
				nextRequest = 5000;
			}
			
			// 15 секунд
			if(chat.data.noActivity > 20){
				nextRequest = 15000;
			}
		
			setTimeout(callback,nextRequest);
		});
	},
	
	// Запит всіх осіб.
	
	getUsers : function(callback){
		$.tzGET('getUsers',function(r){
			
			var users = [];
			
			for(var i=0; i< r.users.length;i++){
				if(r.users[i]){
					users.push(chat.render('user',r.users[i]));
				}
			}
			
			var message = '';
			
			if(r.total<1){
				message = 'Никого нет в онлайне';
			}
			else {
				message = 'В онлайне: ' + r.total;
			}
			
			users.push('<p class="count">'+message+'</p>');
			
			$('#chatUsers').html(users.join(''));
			
			setTimeout(callback,15000);
		});
	},
	
	// Даний метод виводить повідомлення про помилку нагорі сторінки:
	
	displayError : function(msg){
		var elem = $('<div>',{
			id		: 'chatErrorMessage',
			html	: msg
		});
		
		elem.click(function(){
			$(this).fadeOut(function(){
				$(this).remove();
			});
		});
		
		setTimeout(function(){
			elem.click();
		},5000);
		
		elem.hide().appendTo('body').slideDown();
	}
};

// Формування GET & POST:

$.tzPOST = function(action,data,callback){
	$.post('php/ajax.php?action='+action,data,callback,'json');
}

$.tzGET = function(action,data,callback){
	$.get('php/ajax.php?action='+action,data,callback,'json');
}
// Метод jQuery для заміщає тексту:

$.fn.defaultText = function(value){
	
	var element = this.eq(0);
	element.data('defaultText',value);
	
	element.focus(function(){
		if(element.val() == value){
			element.val('').removeClass('defaultText');
		}
	}).blur(function(){
		if(element.val() == '' || element.val() == value){
			element.addClass('defaultText').val(value);
		}
	});
	
	return element.blur();
}