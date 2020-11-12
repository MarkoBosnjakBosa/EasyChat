module.exports = function(app, models, multer, fs, path) {
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
    app.get("/getUser/:username", (request, response) => {
        var username = request.params.username;
        var query = {username: username};
        User.findOne(query).then(user => {
            response.status(200).json({user: user});
            response.end();
        }).catch(error => console.log(error));
    });
    app.put("/editUser", upload.single("avatar"), (request, response) => {
        var allowEdit = true;
        var errorFields = [];
        var username = request.body.username;
        var firstName = request.body.firstName;
        if(!username && !firstName) {
            errorFields.push("firstName");
            allowEdit = false;
        }
        var lastName = request.body.lastName;
        if(!lastName) {
            errorFields.push("lastName");
            allowEdit = false;
        }
        var avatar = request.file;
        if(!avatar && request.extensionValidationError) {
            errorFields.push("avatar");
            allowEdit = false;
        }
        if(allowEdit) {
            var sendNewsletters = request.body.sendNewsletters;
            var query = {username: username};
            var update = {};
            var removeOldAvatar = false;
            try {
                var avatarImage = fs.readFileSync(avatar.path);
                var encodedAvatarImage = avatarImage.toString("base64");
                var avatarObject = {name: avatar.filename, contentType: avatar.mimetype, image: Buffer.from(encodedAvatarImage, "base64")};
                update = {firstName: firstName, lastName: lastName, avatar: avatarObject, sendNewsletters: sendNewsletters};
                removeOldAvatar = true;
            } catch(error) {
                update = {firstName: firstName, lastName: lastName, sendNewsletters: sendNewsletters};
            }
            User.findOneAndUpdate(query, update).then(user => {
                if(removeOldAvatar) {
                    if(!isEmpty(user.avatar.name) && !isEmpty(user.avatar.contentType) && !isEmpty(user.avatar.image)) {
                        fs.unlink(path.join(__dirname, "../images/avatars/", user.avatar.name), function(error) {});
                    }
                }
                response.status(200).json({edited: true});
                response.end();
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({edited: false, errorFields: errorFields});
            response.end();
        }
    });

    function isEmpty(object) {
		return !object || Object.keys(object).length === 0;
	}
}