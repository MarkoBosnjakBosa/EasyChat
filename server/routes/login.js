module.exports = function(app, jwt, bcryptjs, models) {
  	const User = models.User;
  	app.post("/checkUsername", (request, response) => {
   		var username = request.body.username;
   		if(username) {
			var query = {username: username};
			User.findOne(query).then(user => {
				if(!isEmpty(user)) {
					response.status(200).json({exists: true});
					response.end();
				} else {
					response.status(200).json({exists: false, empty: false});
					response.end();
				}
			}).catch(error => console.log(error));
		} else {
			response.status(200).json({exists: false, empty: true});
			response.end();
		}
 	});
 	app.post("/login", (request, response) => {
		var allowLogin = true;
		var errorFields = [];
		var username = request.body.username;
		if(!username || invalidUsername(username)) {
			errorFields.push("username");
			allowLogin = false;
		}
		var password = request.body.password;
		if(!password || invalidPassword(password)) {
			errorFields.push("password");
			allowLogin = false;
		}
		if(allowLogin) {
			var query = {username: username};
			User.findOne(query).then(user => {
				if(!isEmpty(user)) {
					if(user.accepted) {
						bcryptjs.compare(password, user.password, function(error, foundPassword) {
							if(foundPassword) {
								const token = jwt.sign({userId: user._id, username: user.username}, "newSecretKey", {expiresIn: "2h"});
								response.status(200).json({valid: true, token: token, user: user});
								response.end();
							} else {
								response.status(200).json({valid: false, allowed: true});
								response.end();
							}
						});
					} else {
						errorFields.push("username");
						response.status(200).json({valid: false, allowed: false, errorFields: errorFields});
						response.end();
					}
				} else {
					errorFields.push("username");
					response.status(200).json({valid: false, allowed: false, errorFields: errorFields});
					response.end();
				}
			}).catch(error => console.log(error));
		} else {
			response.status(200).json({valid: false, allowed: false, errorFields: errorFields});
			response.end();
		}
	});
	app.get("/checkStatus", (request, response) => {
		try {
            const token = request.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, "newSecretKey");
			request.userData = decoded;
			response.status(200).json({loggedIn: true});
        } catch (error){
            response.status(401).json({loggedIn: false});
		}
	});

	function invalidUsername(username) {
		var usernameFormat = /^[a-z0-9_.-]*$/;
		if(usernameFormat.test(username)) {
			return false;
		} else {
			return true;
		}
	}
 	function invalidPassword(password) {
		var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
		if(passwordFormat.test(password)) {
			return false;
		} else {
			return true;
		}
 	}
 	function isEmpty(object) {
   		return !object || Object.keys(object).length === 0;
 	}
}
