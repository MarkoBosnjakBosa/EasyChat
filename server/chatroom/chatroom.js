module.exports = function(app, io, models, moment) {
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
        socket.on("loggedIn", (chatroomId) => {
            var messageQuery = {chatroomId: chatroomId};
            Message.find(messageQuery).then(foundMessages => {
                socket.emit("userJoined", {messages: foundMessages, users: chatrooms[chatroomId].users});
            });
        });
        socket.on("newUser", (chatroomId, username) => {
            socket.join(chatroomId);
            chatrooms[chatroomId].users[socket.id] = username;
            socket.to(chatroomId).broadcast.emit("userOnline", username);
        });
        socket.on("newMessage", (chatroomId, message) => {
            var dateFormat = "DD.MM.YYYY HH:mm";
            var date = moment().format(dateFormat);
            var username = chatrooms[chatroomId].users[socket.id];
            var query = {username: username};
            User.findOne(query).then(user => {
                var newMessage = getMessageScheme(Message, chatroomId, username, user.avatar, message, date);
                newMessage.save().then(message => {
                    io.emit("newMessage", message);
                }).catch(error => console.log(error));
            }).catch(error => console.log(error));
        });
        socket.on("disconnect", () => {
            getUserChatrooms(socket).forEach(chatroomId => {
                socket.to(chatroomId).broadcast.emit("userOffline", chatrooms[chatroomId].users[socket.id]);
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
}