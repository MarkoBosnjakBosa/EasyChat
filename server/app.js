const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const models = require("./models/models.js")(mongoose);
const bcryptjs = require("bcryptjs");
const mailer = require("nodemailer");
const dontenv = require("dotenv").config();
const baseUrl = process.env.BASE_URL;
const port = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL;
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const loginUrl = process.env.LOGIN_URL;
const resetPasswordUrl = process.env.RESET_PASSWORD_URL;
const transporter = getTransporter();
app.use(cors({origin: "*"}));
app.use(express.json());
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

const registration = require("./routes/registration.js")(app, bcryptjs, models, transporter, emailUser, baseUrl, port, loginUrl);
const login = require("./routes/login.js")(app, jwt, bcryptjs, models);
const forgotPassword = require("./routes/forgotPassword.js")(app, bcryptjs, models, transporter, emailUser, resetPasswordUrl);
const adminOverview = require("./routes/admin/overview.js")(app, models);

mongoose.connect(databaseUrl, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const database = mongoose.connection;
database.on("error", function(error) {
    console.log("Connection to the database has not been established!");
    console.log(error);
});
database.on("open", function() {
    console.log("Connection to the database has been successfully established!");
});

app.listen(port, function() {
	console.log("Tasks app listening on " + baseUrl + port + "!");
});

function getTransporter() {
 	return mailer.createTransport({service: "gmail", auth: { user: emailUser, pass: emailPassword}});
}
