module.exports = function(app, mongoose, models, bodyParser) {
    var Chatroom = models.Chatroom;
    app.get("/getChatrooms", (request, response) => {
        Chatroom.find({}).then(chatrooms => {
            var public = [];
            var private = [];
            chatrooms.forEach(function(chatroom) {
                if(chatroom.type == "public") {
                    public.push(chatroom);
                }
                if(chatroom.type == "private") {
                    private.push(chatroom);
                }
            });
            response.status(200).json({private: private, public: public});
            response.end();
        });
    });
    app.post("/createChatroom", (request, response) => {
        var allowRegistration = true;
        var errorFields = [];
        var name = request.body.name;
        if(!name) {
            errorFields.push("name");
            allowRegistration = false;
        }
        var icon = request.body.icon;
        if(!icon) {
            errorFields.push("icon");
            allowRegistration = false;
        }
        if(allowRegistration) {
            var type = "public";
            var participants = ["admin"];
            var blockedParticipants = [];
            var newChatroom = getChatroomScheme(Chatroom, name, icon, type, participants, blockedParticipants);
            newChatroom.save().then(chatroom => {
                response.status(200).json({created: true});
                response.end();
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({created: false, errorFields: errorFields});
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
  