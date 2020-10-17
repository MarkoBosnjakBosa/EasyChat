module.exports = function(mongoose) {
  var userScheme = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    avatar: {name: String, contentType: String, image: Buffer},
    acceptance: Boolean,
  	admin: Boolean
  });
  var models = {
    User: mongoose.model("User", userScheme)
  }
  return models;
}
