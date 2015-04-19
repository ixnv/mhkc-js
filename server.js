var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var mhkc = require('./mhkc.js');
var keys = {};
var KEY_LENGTH = 16; // длина ключей

// users
var usernames = {};
var numUsers = 0;

// server
http.listen(3000, function() {
  	console.log('чат запущен на 3000 порту');

  	/* 
		для целей демонстрации ключи создаются только один раз - при запуске сервера.
	 	в реальной жизни это, разумеется, неприменимо
	*/
  	keys = mhkc.gen_keys(KEY_LENGTH);
  	keys.KEY_LENGTH = KEY_LENGTH;
  	
  	// вывести информацию о ключах
  	console.log('Открытый ключ:', keys.pub_key);
  	console.log('Закрытый ключ:', keys.pr_key);
});

// routes
app.use(express.static(path.join(__dirname, '.')));

app.get('/', function(req, res) {
  	res.sendFile('index.html', {
  		root: path.join(__dirname, '.') 
  	});
});

// socket.io
io.on('connection', function (socket) {
	var addedUser = false;

	socket.on('new message', function (data) {
		console.log('\n', socket.username, data);

		io.sockets.emit('new message', {
		  username: socket.username,
		  message: data
		});
	});

	socket.on('add user', function (username) {
		socket.username = username;
		usernames[username] = username;
		++numUsers;
		addedUser = true;

		socket.emit('get keys', keys);

		io.sockets.emit('user joined', {
			username: socket.username,
			numUsers: numUsers
		});
	});

	socket.on('disconnect', function () {
		if (addedUser) {
		  delete usernames[socket.username];
		  --numUsers;

		  io.sockets.emit('user left', {
		    username: socket.username,
		    numUsers: numUsers
		  });
		}
	});
});