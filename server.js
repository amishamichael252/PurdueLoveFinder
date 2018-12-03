const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const express = require('express')
const port = 20000
const app = express()

let sql = 'SELECT * FROM Users where username = ? AND password = ?'

let db = new sqlite3.Database('user_database', sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to the in-memory SQLite databse.');
});

app.get('/login', (request, response) => {
	/*var readRecords = function(callback) {
		db.serialize(function() {
			db.all("SELECT * FROM Users", function(err, allrows) {
				if (err != null) {
					console.log(err);
					callback(err);
				}
				console.log(util.inspect(allRows));
				callback(allRows);
				db.close();
			});
		});
	}
	*/
	db.serialize(function() {	
		var username = request.query.username;
		var password = request.query.password;
		console.log(username + " " + password)
		db.get(sql, [username, password], (err, row) => {
			if (err) {
				return console.error(err.message)
			}
			if (row == null) {
				let insert = "INSERT INTO Users (username, password) VALUES ('" + username + "', '" + password + "')"
				console.log(insert)
				db.run(insert, function(err) {
					if (err) {
						return console.log(err.message);
					}
					console.log('${username} has been added');
					response.sendFile(path.join(__dirname + '/src/Profile.html');
				});
			} else {
				response.sendFile(path.join(__dirname + '/src/Questionaire.html');
			}
		});
	});
	db.close();
	
});



app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname + '/src/FirstPage.html'))
});


app.listen(port, (err) => {
	if (err) {
		return constol.log('Err', err)
	}
	console.log('server is on ${port}')
})
