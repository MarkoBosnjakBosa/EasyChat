module.exports = function(io, models, async, moment) {
    const Chatroom = models.Chatroom;
    const User = models.User;
    const Message = models.Message;
    var chatrooms = {};
    var chatroomQuery = {};
    Chatroom.find(chatroomQuery).then(foundChatrooms => {
        foundChatrooms.forEach(foundChatroom => {
            chatrooms[foundChatroom._id] = {users: {}};
        });
    });

    io.on("connection", socket => {
        socket.on("loggedIn", (chatroomId, username) => {
            var queries = [];
            var messageQuery = {chatroomId: chatroomId};
            queries.push(function(callback) {
                Message.find(messageQuery).then(foundMessages => {
                    callback(null, foundMessages);
                }).catch(error => console.log(error));
            });
            var chatroomQuery = {_id: chatroomId};
            queries.push(function(callback) {
                Chatroom.findOne(chatroomQuery).then(chatroom => {
                    callback(null, chatroom);
                }).catch(error => console.log(error));
            });
            async.parallel(queries).then(results => {
                var messageResults = results[0];
                var chatroomResult = results[1];
                var currentChatroom = {};
                if(chatroomResult.type == "public") {
                    currentChatroom["name"] = chatroomResult.name;
                    currentChatroom["icon"] = chatroomResult.icon;
                }
                if(chatroomResult.type == "private") {
                    chatroomResult.participants.forEach(user => {
                        if(user != username) {
                            currentChatroom["name"] = user;
                            currentChatroom["icon"] = "";
                        }
                    });
                }
                socket.emit("userJoined", {messages: messageResults, users: chatrooms[chatroomId].users, currentChatroom: currentChatroom});
            });
        });
        socket.on("newUser", (chatroomId, username) => {
            socket.join(chatroomId);
            chatrooms[chatroomId].users[socket.id] = username;
            var user = {socketId: socket.id, username: username};
            socket.to(chatroomId).broadcast.emit("userOnline", user);
        });
        socket.on("newMessage", (chatroomId, message) => {
            if(chatroomId && message) {
                var dateFormat = "DD.MM.YYYY HH:mm";
                var date = moment().format(dateFormat);
                var username = chatrooms[chatroomId].users[socket.id];
                var query = {username: username};
                User.findOne(query).then(user => {
                    var newMessage = getMessageScheme(Message, chatroomId, username, user.avatar, message, date);
                    newMessage.save().then(message => {
                        io.sockets.in(chatroomId).emit("newMessage", message);
                    }).catch(error => console.log(error));
                }).catch(error => console.log(error));
            }
        });
        socket.on("editMessage", (messageId, message) => {
            if(messageId && message) {
                var query = {_id: messageId};
                var update = {message: message};
                Message.findOneAndUpdate(query, update, {new: true}).then(message => {
                    if(!isEmpty(message)) {
                        io.emit("editMessage", message);
                    }
                }).catch(error => console.log(error));
            }
        });
        socket.on("deleteMessage", messageId => {
            if(messageId) {
                var query = {_id: messageId};
                Message.findOneAndRemove(query).then(message => {
                    if(!isEmpty(message)) {
                        io.emit("deleteMessage", message._id);
                    }
                }).catch(error => console.log(error));
            }
        });
        socket.on("typing", (chatroomId, username) => socket.to(chatroomId).broadcast.emit("typing", username));
        socket.on("stopTyping", chatroomId => socket.to(chatroomId).broadcast.emit("stopTyping"));
        socket.on("disconnect", () => {
            getUserChatrooms(socket).forEach(chatroomId => {
                socket.to(chatroomId).broadcast.emit("userOffline", socket.id);
                delete chatrooms[chatroomId].users[socket.id];
            });
        });
    });

    function getMessageScheme(Message, chatroomId, username, avatar, message, date) {
        return new Message({chatroomId: chatroomId, username: username, avatar: avatar, message: message, date: date});
    }
    function getUserChatrooms(socket) {
        return Object.entries(chatrooms).reduce((ids, [id, chatroom]) => {
            if(chatroom.users[socket.id] != null) ids.push(id);
            return ids;
        }, []);
    }
    function isEmpty(object) {
        return !object || Object.keys(object).length === 0;
    }
}