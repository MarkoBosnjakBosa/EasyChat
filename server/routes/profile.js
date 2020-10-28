module.exports = function(app, models, multer, fs) {
    const User = models.User;
    app.get("/getUser/:username", (request, response) => {
        var username = request.params.username;
        var query = {username: username};
        User.findOne(query).then(user => {
            response.status(200).json({user: user});
            response.end();
        });
    });
}