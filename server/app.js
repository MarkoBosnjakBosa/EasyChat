const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cron = require("node-cron");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const models = require("./models/models.js")(mongoose);
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const async = require("async");
const mailer = require("nodemailer");
const moment = require("moment");
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
app.use("/favicon", express.static("favicon"));
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

const registration = require("./routes/registration.js")(app, bcryptjs, models, multer, fs, transporter, emailUser, baseUrl, port, loginUrl);
const login = require("./routes/login.js")(app, jwt, bcryptjs, models);
const forgotCredentials = require("./routes/forgotCredentials.js")(app, bcryptjs, models, transporter, emailUser, baseUrl, port, resetPasswordUrl);
const overview = require("./routes/overview.js")(app, models);
const chatroom = require("./chatroom/chatroom.js")(io, models, async, moment);
const users = require("./routes/users.js")(app, models, async, fs, path);
const profile = require("./routes/profile.js")(app, models, multer, fs, path);
const cronJob = require("./cronJob/cronJob.js")(cron, models, fs, moment, transporter, emailUser);

mongoose.connect(databaseUrl, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const database = mongoose.connection;
database.on("error", function(error) {
    console.log("Connection to the database has not been established!");
    console.log(error);
});
database.on("open", function() {
    console.log("Connection to the database has been successfully established!");
});

http.listen(port, function() {
    console.log("Tasks app listening on " + baseUrl + port + "!");
});

function getTransporter() {
    return mailer.createTransport({service: "gmail", auth: {user: emailUser, pass: emailPassword}});
}
