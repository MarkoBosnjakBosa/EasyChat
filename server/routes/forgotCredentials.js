module.exports = function(app, bcryptjs, models, transporter, emailUser, baseUrl, port, resetPasswordUrl) {
	const User = models.User;
	app.post("/forgotCredentials", (request, response) => {
		var email = request.body.email;
		var option = request.body.option;
		if(email && isValidEmail(email) && option) {
			var query = {email: email}; 
			User.findOne(query).then(user => {
				if(!isEmpty(user)) {
					if(option == "password") {
						sendResetPasswordEmail(user.email, user.firstName, user.username, user.acceptanceToken);
					} else if(option == "username") {
						sendForgotUsernameEmail(user.email, user.firstName, user.username);
					} else {
						sendConfirmationEmail(user.email, user.firstName, user.username, user.acceptanceToken);
					}
					response.status(200).json({sent: true});
					response.end();
				} else {
					response.status(200).json({sent: false});
					response.end();
				}
			}).catch(error => console.log(error));
		} else {
			response.status(200).json({sent: false});
			response.end();
		}
	});
	app.put("/resetPassword", (request, response) => {
		var username = request.body.username;
		var acceptanceToken = request.body.acceptanceToken;
		var password = request.body.password;
		if(username && password && isValidPassword(password)) {
			var query = {$and: [{username: username}, {acceptanceToken: acceptanceToken}]}; 
			bcryptjs.genSalt(10, (error, salt) => {
				bcryptjs.hash(password, salt, (error, hash) => {
					var update = {password: hash};
					User.findOneAndUpdate(query, update, {new: true}).then(user => {
						if(!isEmpty(user)) {
							response.status(200).json({reset: true});
							response.end();
						} else {
							response.status(200).json({reset: false});
							response.end();
						}
					}).catch(error => console.log(error));
				});
			});
		} else {
			response.status(200).json({reset: false});
			response.end();
		}
	});
    
	function sendResetPasswordEmail(email, firstName, username, acceptanceToken) {
		var mailOptions = {
			from: emailUser,
			to: email,
			subject: "Reset password",
			html: "<html>" +
				"<body>" +
				"<p>Dear <b>" + firstName + "</b>,</p>" +
				"<p>you have requested to change your password. Click on the button below to proceed with your request:" +
				"<p style='margin-bottom: 30px;'><a href='" + resetPasswordUrl + "?username=" + username + "&acceptanceToken=" + acceptanceToken + "' target='_blank' style=' background-color: #1a1aff; border: none; color: #fff; padding: 10px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; cursor: pointer; border-radius:5px;'>Reset password</a></p>" +
				"<p>Kind regards,<br/> your Admin Team</p>" +
				"</body>" +
				"</html>"
		};
		transporter.sendMail(mailOptions).then().catch(error => console.log(error));
	}
	function sendForgotUsernameEmail(email, firstName, username) {
		var mailOptions = {
			from: emailUser,
			to: email,
			subject: "Retrieve username",
			html: "<html>" +
				"<body>" +
				"<p>Dear <b>" + firstName + "</b>,</p>" +
				"<p>you have requested to retrieve your username. Your username is: <b><i>" + username + "</i></b>.</p>" +
				"<p>Kind regards,<br/> your Admin Team</p>" +
				"</body>" +
				"</html>"
		};
		transporter.sendMail(mailOptions).then().catch(error => console.log(error));
	}
	function sendConfirmationEmail(email, firstName, username, acceptanceToken) {
		var mailOptions = {
			from: emailUser,
			to: email,
			subject: "Confirm registration",
			html: "<html>" +
				"<body>" +
				"<p>Dear <b>" + firstName + "</b>,</p>" +
				"<p>thank you for using EasyChat. Click on the button below to proceed with your registration:" +
				"<p style='margin-bottom: 30px;'><a href='" + baseUrl + port + "/confirm/registration/?username=" + username + "&acceptanceToken=" + acceptanceToken + "' target='_blank' style=' background-color: #1a1aff; border: none; color: #fff; padding: 10px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; cursor: pointer; border-radius:5px;'>Confirm registration</a></p>" +
				"<p>Kind regards,<br/> your Admin Team</p>" +
				"</body>" +
				"</html>"
		};
		transporter.sendMail(mailOptions).then().catch(error => console.log(error));
	}
	function isValidEmail(email) {
		var emailFormat = /\S+@\S+\.\S+/;
		if(emailFormat.test(email)) {
			return true;
		} else {
			return false;
		}
	}	
	function isValidPassword(password) {
		var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
		if(passwordFormat.test(password)) {
			return true;
		} else {
			return false;
		}
	}	
	function isEmpty(object) {
		return !object || Object.keys(object).length === 0;
	}
}