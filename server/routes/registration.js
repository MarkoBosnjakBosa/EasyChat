module.exports = function(app, bcryptjs, models, multer, fs, transporter, emailUser, baseUrl, port, loginUrl) {
	const User = models.User;
	var storage = multer.diskStorage({
		destination: function (request, file, callback) {
		  	callback(null, "images/avatars/");
		},
		filename: function (request, file, callback) {
			var fileArray = file.originalname.split(".");
            var fileName = fileArray[0] + "_" + Date.now() + "." + fileArray[1];
		  	callback(null, fileName);
		},
	});
	var upload = multer({
		storage: storage,
		fileFilter: function (request, file, callback) {
			if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
				callback(null, true);
		  	} else {
				request.extensionValidationError = true;
				return callback(null, false, request.extensionValidationError);
		  	}
		},
		limits: {fileSize: 500000}
	});
	app.post("/createUser", upload.single("avatar"), (request, response) => {
		var allowRegistration = true;
		var errorFields = [];
		var username = request.body.username;
		if(!username) {
			errorFields.push("username");
			allowRegistration = false;
		}
		var email = request.body.email;
		if(!email || invalidEmail(email)) {
			errorFields.push("email");
			allowRegistration = false;
		}
		var password = request.body.password;
		if(!password || invalidPassword(password)) {
			errorFields.push("password");
			allowRegistration = false;
		}
		var firstName = request.body.firstName;
		if(!firstName) {
			errorFields.push("firstName");
			allowRegistration = false;
		}
		var lastName = request.body.lastName;
		if(!lastName) {
			errorFields.push("lastName");
			allowRegistration = false;
		}
		var avatar = request.file;
		if(!avatar && request.extensionValidationError) {
			errorFields.push("avatar");
			allowRegistration = false;
		}
		if(allowRegistration) {
			var query = {$or: [{username: username}, {email: email}]};
			User.findOne(query).then(user => {
				if(!isEmpty(user)) {
					var error = {created: false, alreadyExists: true};
					if(user.username == username) {
						error.field = "username";
					} else {
						error.field = "email";
					}
					response.status(200).json(error);
					response.end();
				} else {
					var sendNewsletters = true;
					var accepted = false;
					var isAdmin = false;
					var avatarImage = fs.readFileSync(avatar.path);
          			var encodedAvatarImage = avatarImage.toString("base64");
					var avatarObject = {name: avatar.filename, contentType: avatar.mimetype, image: Buffer.from(encodedAvatarImage, "base64")};
					var newUser = getUserScheme(User, username, email, password, firstName, lastName, avatarObject, sendNewsletters, accepted, isAdmin);
					bcryptjs.genSalt(10, (error, salt) => {
						bcryptjs.hash(newUser.password, salt, (error, hash) => {
							newUser.password = hash;
							newUser.save().then(user => {
								sendConfirmationEmail(user.username, user.email, user.firstName);
								response.status(200).json({created: true});
								response.end();
							}).catch(error => console.log(error));
						});
					});
				}
			}).catch(error => console.log(error));
		} else {
			response.status(200).json({created: false, alreadyExists: false, errorFields: errorFields});
			response.end();
		}
	});
	app.get("/confirm/registration/:username", (request, response) => {
		var username = request.params.username;
		var query = {username: username};
		var update = {accepted: true};
		User.findOneAndUpdate(query, update, {new: true}).then(user => {
			if(!isEmpty(user)) {
				response.render("registration.html", {confirmed: true, loginUrl: loginUrl});
			} else {
				response.render("registration.html", {confirmed: false, adminEmail: emailUser});
			}
		}).catch(error => console.log(error));
	});

	function getUserScheme(User, username, email, password, firstName, lastName, avatar, sendNewsletters, accepted, isAdmin) {
		return new User({username: username, email: email, password: password, firstName: firstName, lastName: lastName, avatar: avatar, sendNewsletters: sendNewsletters, accepted: accepted, isAdmin: isAdmin});
	}
	function sendConfirmationEmail(username, email, firstName) {
		var mailOptions = {
			from: emailUser,
			to: email,
			subject: "Confirm registration",
			html: "<html>" +
				"<body>" +
				"<p>Dear <b>" + firstName + "</b>,</p>" +
				"<p>thank you for using EasyChat. Click on the button below to proceed with your registration:" +
				"<p style='margin-bottom: 30px;'><a href='" + baseUrl + port + "/confirm/registration/" + username + "' target='_blank' style=' background-color: #1a1aff; border: none; color: #fff; padding: 10px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; cursor: pointer; border-radius:5px;'>Confirm registration</a></p>" +
				"<p>Kind regards,<br/> your Admin Team</p>" +
				"</body>" +
				"</html>"
		};
		transporter.sendMail(mailOptions).then().catch(error => console.log(error));
	}
	function invalidEmail(email) {
		var emailFormat = /\S+@\S+\.\S+/;
		if(emailFormat.test(email)) {
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
