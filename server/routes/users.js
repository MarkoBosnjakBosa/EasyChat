module.exports = function(app, models, async, fs, path) {
    const User = models.User;
    const Message = models.Message;
    const Chatroom = models.Chatroom;
    app.get("/getUsers/:username", (request, response) => {
        var username = request.params.username;
        var query = {username: {$ne: username}};
        User.find(query).then(users => {
            response.status(200).json({users: users});
            response.end();
        }).catch(error => console.log(error));
    });
    app.delete("/deleteUser/:username", (request, response) => {
        var username = request.params.username;
        if(username) {
            var queries = [];
            var usernameQuery = {username: username};
            queries.push(function(callback) {
                User.findOneAndRemove(usernameQuery).then(user => {
                    if(!isEmpty(user.avatar.name) && !isEmpty(user.avatar.contentType) && !isEmpty(user.avatar.image)) {
                        fs.unlink(path.join(__dirname, "../images/avatars/", user.avatar.name), function(error) {});
                    }
                    callback(null, user);
                }).catch(error => console.log(error));
            });
            queries.push(function(callback) {
                Message.deleteMany(usernameQuery).then(messages => {
                    callback(null, messages);
                }).catch(error => console.log(error));
            });
            var publicChatroomQuery = {type: "public", $or: [{participants: username}, {blockedParticipants: username}]};
            var publicChatroomUpdate = {$pull: {participants: username, blockedParticipants: username}};
            queries.push(function(callback) {
                Chatroom.updateMany(publicChatroomQuery, publicChatroomUpdate).then(publicChatroom => {
                    callback(null, publicChatroom);
                }).catch(error => console.log(error));
            });
            var privateChatroomQuery = {type: "private", participants: username};
            queries.push(function(callback) {
                Chatroom.deleteMany(privateChatroomQuery).then(privateChatroom => {
                    callback(null, privateChatroom);
                }).catch(error => console.log(error));
            });
            async.parallel(queries).then(results => {
                var userResult = results[0];
                if(!isEmpty(userResult)) {
                    response.status(200).json({deleted: true});
                    response.end();
                } else {
                    response.status(200).json({deleted: false});
                    response.end();
                }
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({deleted: false});
            response.end();
        }
    });

    function isEmpty(object) {
        return !object || Object.keys(object).length === 0;
    }
}