$(function () {
	var socket = io();
	var keys = {};

	$('#send-msg-form').submit(function(e) {
		var msg = $('#m').val().trim();

		if (!msg.length) {
			log('введите сообщение');
			return false;
		}

		// шифруем сообщение
		msg = encode(msg, keys.KEY_LENGTH, keys.pub_key);

		socket.emit('new message', msg);
		$('#m').val('');
		return false;
	});	

	$('#sign-in-btn').click(function () {
		var user_name = $('#user-name').val().trim();
		
		if (!user_name.length) {
			log('Введите имя');
			return;
		}

		// отправляем на сервер событие добавления пользователя
		socket.emit('add user', user_name);

		$('#sign-in-modal').hide();
		$('#chat').show();
	});

	socket.on('get keys', function (received_keys) {
		keys = received_keys;
	});

	socket.on('new message', function(msg) {
		// шифруем сообщение
		msg.message = decode(msg.message, keys.KEY_LENGTH, keys.pr_key, keys.invmodulo, keys.modulo);

		$('#messages').append($('<li>').text(msg.username + ': ' + msg.message));
	});

	socket.on('user joined', function (data) {
	    log(data.username + ' присоединился');
	    updateUsers(data);
	});

	socket.on('user left', function (data) {
		log(data.username + ' покинул чат');
		updateUsers(data);
	});

	function log(msg) {
		Materialize.toast(msg, 4000);
	}

	function updateUsers(data) {
		$('#users-count').fadeOut().html(data.numUsers).fadeIn();
	}
});