module.exports = function(app, io, models) {
    const Chatroom = models.Chatroom;
    const Message = models.message;
    var rooms = {};

    io.on("connection", socket => {
        socket.emit("loggedIn", {
            users: users.map(user => user.username),
            messages: messages
        });
        socket.on("newUser", username => {
            socket.username = username;
            users.push(socket);
            io.emit("userOnline", socket.username);
        });
        socket.on('msg', message => {
            var newMessage = getMessageScheme(Message, publicChatroomId, message, socket.username, date);
            newMessage.save().then(message => {
                messages.push(message);
                io.emit('msg', message);
            }).catch(error => console.log(error));
        });
        socket.on("disconnect", () => {
            io.emit("userLeft", socket.username);
            users.splice(users.indexOf(socket), 1);
        });
    });
}