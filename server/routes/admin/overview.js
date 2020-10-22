module.exports = function(app, models) {
    const User = models.User;
    const Chatroom = models.Chatroom;
    app.get("/getChatrooms/:username", (request, response) => {
        var username = request.params.username;
        var query = {participants: username};
        Chatroom.find(query).then(chatrooms => {
            var public = [];
            var private = [];
            chatrooms.forEach(chatroom => {
                if(chatroom.type == "public") {
                    public.push(chatroom);
                }
                if(chatroom.type == "private") {
                    chatroom.participants.forEach(user => {
                        if(user != username) {
                            private.push({_id: chatroom._id, name: user});
                        }
                    });
                }
            });
            response.status(200).json({public: public, private: private});
            response.end();
        });
    });
    app.get("/getAvailableChatrooms/:username", (request, response) => {
        var username = request.params.username;
        var query = {$and: [{type: "public"}, {participants: {$ne: username}}]};
        Chatroom.find(query).then(availableChatrooms => {
            response.status(200).json({availableChatrooms: availableChatrooms});
            response.end();
        });
    });
    app.post("/createPublicChatroom", (request, response) => {
        var allowCreation = true;
        var errorFields = [];
        var name = request.body.name;
        if(!name) {
            errorFields.push("name");
            allowCreation = false;
        }
        var icon = request.body.icon;
        if(!icon) {
            errorFields.push("icon");
            allowCreation = false;
        }
        if(allowCreation) {
            var type = "public";
            var participants = ["admin"];
            var blockedParticipants = [];
            var newPublicChatroom = getChatroomScheme(Chatroom, name, icon, type, participants, blockedParticipants);
            newPublicChatroom.save().then(publicChatroom => {
                response.status(200).json({created: true, publicChatroom: publicChatroom});
                response.end();
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({created: false, errorFields: errorFields});
            response.end();
        }
    });
    app.put("/editPublicChatroom", (request, response) => {
        var _id = request.body._id;
        var name = request.body.name;
        var icon = request.body.icon;
        if(_id && name && icon) {
            var query = {_id: _id};
            var update = {name: name, icon: icon};
            Chatroom.findOneAndUpdate(query, update, {new: true}).then(publicChatroom => {
                if(!isEmpty(publicChatroom)) {
                    response.status(200).json({edited: true});
                    response.end();
                }
                else {
                    response.status(200).json({edited: false});
                    response.end();
                }
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({edited: false});
            response.end();
        }
    });
    app.delete("/deletePublicChatroom/:publicChatroomId", (request, response) => {
        var _id = request.params.publicChatroomId;
        if(_id) {
            var query = {_id: _id};
            Chatroom.findOneAndRemove(query).then(publicChatroom => {
            if(!isEmpty(publicChatroom)) {
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
    app.put("/blockParticipant", (request, response) => {
        var _id = request.body._id;
        var participant = request.body.participant;
        if(_id && participant) {
            var query = {_id: _id};
            var update = {$pull: {participants: participant}, $push: {blockedParticipants: participant}};
            Chatroom.findOneAndUpdate(query, update, {new: true}).then(publicChatroom => {
                if(!isEmpty(publicChatroom)) {
                    response.status(200).json({blocked: true, publicChatroom: publicChatroom});
                    response.end();
                } else {
                    response.status(200).json({blocked: false});
                    response.end(); 
                }
            });
        } else {
            response.status(200).json({blocked: false});
            response.end();
        }
    });
    app.put("/allowParticipant", (request, response) => {
        var _id = request.body._id;
        var participant = request.body.participant;
        if(_id && participant) {
            var query = {_id: _id};
            var update = {$push: {participants: participant}, $pull: {blockedParticipants: participant}};
            Chatroom.findOneAndUpdate(query, update, {new: true}).then(publicChatroom => {
                if(!isEmpty(publicChatroom)) {
                    response.status(200).json({allowed: true, publicChatroom: publicChatroom});
                    response.end();
                } else {
                    response.status(200).json({allowed: false});
                    response.end(); 
                }
            });
        } else {
            response.status(200).json({allowed: false});
            response.end();
        }
    });
    app.put("/joinAvailableChatroom", (request, response) => {
        var _id = request.body._id;
        var participant = request.body.participant;
        var errorFields = ["availableChatroom"];
        if(_id && participant) {
            var query = {_id: _id};
            var update = {$push: {participants: participant}};
            Chatroom.findOneAndUpdate(query, update, {new: true}).then(availableChatroom => {
                if(!isEmpty(availableChatroom)) {
                    response.status(200).json({joined: true, availableChatroom: availableChatroom});
                    response.end();
                } else {
                    response.status(200).json({joined: false, errorFields: errorFields});
                    response.end();
                }
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({joined: false, errorFields: errorFields});
            response.end();
        }
    });
    app.get("/getAvailableUsers/:username", (request, response) => {
        var username = request.params.username;
        var chatroomQuery = {$and: [{type: "private"}, {participants: username}]};
        Chatroom.find(chatroomQuery).then(chatrooms => {
            var alreadyParticipating = [username];
            chatrooms.forEach(chatroom => {
                var participants = chatroom.participants;
                participants.forEach(participant => { if(participant != username) alreadyParticipating.push(participant); });
            });
            var userQuery = {};
            User.find(userQuery).then(users => {
                var availableUsers = [];
                users.forEach(user => {
                    if(!alreadyParticipating.includes(user.username)) {
                        availableUsers.push(user.username); 
                    };
                });
                response.status(200).json({availableUsers: availableUsers});
                response.end();
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    });
    app.post("/createPrivateChatroom", (request, response) => {
        var firstUsername = request.body.firstUsername;
        var secondUsername = request.body.secondUsername;
        if(firstUsername && secondUsername) {
            var name = "privateChatroom_" + firstUsername + "_" + secondUsername;
            var icon = null;
            var type = "private";
            var participants = [firstUsername, secondUsername];
            var blockedParticipants = [];
            var newPrivateChatroom = getChatroomScheme(Chatroom, name, icon, type, participants, blockedParticipants);
            newPrivateChatroom.save().then(privateChatroom => {
                response.status(200).json({created: true, privateChatroom: {_id: privateChatroom._id, name: secondUsername}});
                response.end();
            }).catch(error => console.log(error));
        } else {
            var errorFields = ["availableUser"];
            response.status(200).json({created: false, errorFields: errorFields});
            response.end();
        }
    });
    app.delete("/deletePrivateChatroom/:privateChatroomId", (request, response) => {
        var _id = request.params.privateChatroomId;
        if(_id) {
            var query = {_id: _id};
            Chatroom.findOneAndRemove(query).then(privateChatroom => {
            if(!isEmpty(privateChatroom)) {
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

    function getChatroomScheme(Chatroom, name, icon, type, participants, blockedParticipants) {
        return new Chatroom({name: name, icon: icon, type: type, participants: participants, blockedParticipants: blockedParticipants});
    }
    function isEmpty(object) {
        return !object || Object.keys(object).length === 0;
    }
}
  