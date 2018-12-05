const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const express = require('express')
const port = 20000
const app = express()
const shell = require('shelljs');
const Cookies = require('cookies');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

let sql = 'SELECT * FROM Users where username = ? AND password = ?'



app.get('/question', (request, response) => {
	/*var js = require("jsdom");
	var $ = require("jquery")(new js.JSDOM().window);
	var arr = [];
	arr.push("HELLO");
	$("input[name='Interests[]']:checked").each(function(){
		arr.push($(this).val());
		console.log("pushing");
	});*/
	var username = request.query.username;
	var name = request.query.Name;
	var age = request.query.Age;
	var loc = request.query.Location;
	var sexuality = request.query.Sexuality;
	var year = request.query.Year;
	var major = request.query.Major;
	var phone = request.query.Phone;
	var arr = request.query.interests;
	var date = request.query.pDate;
	
	var sql = "UPDATE Users SET " 
	+ "FullName = '" + name
	+ "', Age = '" + age 
	+ "', Location = '" + loc
	+ "', LookingFor = '" + sexuality
	+ "', YearInCollege = '" + year
	+ "', Major = '" + major
	+ "', Phone = '" + phone
	+ "', Interests = '" + arr
	+ "', PerfectDate = '" + date
	+ "' WHERE username = '" + username
	+ "';";
	
	let db = new sqlite3.Database('user_database', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Connected to the in-memory SQLite databse.');
	});
	
	db.serialize(function() {	
		db.run(sql, function(err) {
			if (err) {
				return console.log(err.message);
			}
			console.log(username + " has been updated");
		response.sendFile(path.join(__dirname + '/src/Profile.html'));
		});
	});
});

app.get('/profile', (request, response) => {

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
	let db = new sqlite3.Database('user_database', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Connected to the in-memory SQLite databse.');
	});
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
					var cookieToken = Math.random().toString();
					cookieToken = cookieToken.substring(2, cookieToken.length);
					response.cookie('name', cookieToken)
					let token = "UPDATE Users SET token = '" + cookieToken + "' WHERE username = '" + username + "';";
					db.run(token, function(err) {
						if (err) {
							return console.log(err.message);
						}
					});
					response.sendFile(path.join(__dirname + '/src/Questionaire.html'));
				});
			} else {
				console.log(request.cookies['name']);
				response.sendFile(path.join(__dirname + '/src/Profile.html'));
				let select = "SELECT * FROM Users WHERE NOT username = '" + username + "';";
				var matches = [];
				var currRequest = "SELECT * FROM USers WHERE username = '" + username + "';";
				var currInterests = [];
				db.all(currRequest, [], (err, row) => {
					if (err) {
						return console.log(err.message);
					}
					row.forEach((row) => {
						console.log("Name: " + row.username + " Interests: " + row.Interests);
						if (!row.Interests) {
							console.log("Fill in interests");
							return;
						}
						currInterests = row.Interests.split(",");
					});
				});
				db.all(select, [], (err, row) => {
					if (err) {
						return console.log(err.message);
					}
					row.forEach((row) => {
						if (!row.Interests) {
							console.log("Fill in interests");
						}
						else {
							var arr = row.Interests.split(",");	
							var matchCount = 0;
							for (var i = 0; i < currInterests.length; i++) {
								if (arr.includes(currInterests[i])) {
									matchCount++;
								}
							}
							var matchName = row.username;
							var matchString = matchName + " " + matchCount;
							console.log("MATCHSTRING: " + matchString);
							matches.push(matchString);
						}
					});
					for (var i = 0; i < matches.length; i++) {
						console.log(matches[i]);
					}
				});
				/* make array variable
				run db get and iterate through the row
				(first see how multiple rows are sent back through row)
				*/
			}
			db.close();
		});
	});
	
});

app.get('/logout', (request, response) => {
	response.clearCookie('name');
	response.sendFile(path.join(__dirname + '/src/FirstPage.html'));
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
