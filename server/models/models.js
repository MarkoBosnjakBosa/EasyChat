module.exports = function(mongoose) {
	const userScheme = new mongoose.Schema({
		username: String,
		email: String,
		password: String,
		firstName: String,
		lastName: String,
		avatar: {name: String, contentType: String, image: Buffer},
		sendNewsletters: Boolean,
		accepted: Boolean,
		acceptanceToken: String,
		isAdmin: Boolean
	});
	const chatroomScheme = new mongoose.Schema({
		name: String,
		icon: String,
		type: String,
		participants: Array,
		blockedParticipants: Array
	});
	const messageScheme = new mongoose.Schema({
		chatroomId: String,
		username: String,
		avatar: {name: String, contentType: String, image: Buffer},
		message: String,
		date: String
	});
	const models = {
		User: mongoose.model("User", userScheme),
		Chatroom: mongoose.model("Chatroom", chatroomScheme),
		Message: mongoose.model("Message", messageScheme)
	}
	return models;
}
