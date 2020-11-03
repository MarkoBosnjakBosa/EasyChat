module.exports = function(mongoose) {
	var userScheme = new mongoose.Schema({
		username: String,
		email: String,
		password: String,
		firstName: String,
		lastName: String,
		avatar: {name: String, contentType: String, image: Buffer},
		newsletters: Boolean,
		acceptance: Boolean,
		isAdmin: Boolean
	});
	var chatroomScheme = new mongoose.Schema({
		name: String,
		icon: String,
		type: String,
		participants: Array,
		blockedParticipants: Array
	});
	var messageScheme = new mongoose.Schema({
		chatroomId: String,
		username: String,
		avatar: {name: String, contentType: String, image: Buffer},
		message: String,
		date: String
	});
	var models = {
		User: mongoose.model("User", userScheme),
		Chatroom: mongoose.model("Chatroom", chatroomScheme),
		Message: mongoose.model("Message", messageScheme)
	}
	return models;
}
