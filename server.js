const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const express = require('express')
const port = process.env.PORT 
const app = express()
const shell = require('shelljs');
const Cookies = require('cookies');
const cookieParser = require('cookie-parser');
const fs = require('fs');
app.use(cookieParser());

let sql = 'SELECT * FROM Users where username = ? AND password = ?'

app.use('/matches', express.static(__dirname + "/matches"));


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
	var sex = request.query.Gender;
	
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
	+ "', Gender = '" + sex
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
	findMatches(username, db);
	db.close();
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
				findMatches(username, db);
				/* make array variable
				run db get and iterate through the row
				(first see how multiple rows are sent back through row)
				*/
			}
			db.close();
		});
	});
	
});

function findMatches(username, db) {
	let select = "SELECT * FROM Users WHERE NOT username = '" + username + "';";
	var matches = [];
	var currRequest = "SELECT * FROM USers WHERE username = '" + username + "';";
	var currInterests = [];
	var qSex;
	var qLooking;
	var qAge;
	var qMajor;
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
					qSex = row.Gender;
					qLooking = row.LookingFor;
					qMajor = row.Major;
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
					var sex = row.Gender;
					if (sex == "Female") {
					sex = "Women";
					}
					else if (sex == "Male") {
					sex = "Men";
					}
					var Looking = row.LookingFor;
					if (Looking == "Men") {
					Looking = "Male";
					}
					else if (Looking == "Women") {
					Looking = "Female";
					}
					var matchCount = 0;
					console.log("qSex: " + qSex + " Looking: " + Looking + "Sex: " + sex + "qLooking: " + qLooking);
					if (qSex == Looking || Looking == "Both") { 
						console.log("Looking 1 pass");
						if (sex == qLooking || qLooking == "Both") {
							console.log("Looking 2 pass");
							var arr = row.Interests.split(",");	
							var major = row.Major;
							if (qMajor == major) {
								matchCount += 5;
							}					
							var age = row.Age;
							if (Math.abs(qAge - age) <= 2) {
								matchCount += 2;
							}	
							for (var i = 0; i < currInterests.length; i++) {
								if (arr.includes(currInterests[i])) {
									matchCount++;
								}
							}
						}
					}
					if (matchCount != 0) {
						var matchName = row.FullName;
						var percentMatch = Math.ceil((matchCount / (7 + currInterests.length)) * 100);
						var matchString = "Match Name: " + matchName + " Compatibility: " + percentMatch + "% Phone Number: " + row.Phone + "\nGo Gettem Tiger!\n";
						matches.push(matchString);
						console.log("MATCHSTRING: " + matchString);
					}
					}
			});
			var writeString = "";
			for (var i = 0; i < matches.length; i++) {
				console.log(matches[i]);
				writeString += matches[i];
			}
			console.log(writeString);
			fs.writeFile(__dirname + "/matches/matches.txt", writeString, function(err) {
					if (err) {
					return console.log(err);
					}
					console.log("File saved");
					});
			});
	}


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
