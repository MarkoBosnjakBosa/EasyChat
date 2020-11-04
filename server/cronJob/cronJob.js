module.exports = function(cron, models, fs, moment, transporter, emailUser) {
    const User = models.User;
    cron.schedule("0 0 * * 1", function() {
        var stream = fs.createWriteStream("./logs/logs.md", {flags:"a"});
        var query = {sendNewsletters: true};
        User.find(query).then(users => {
            users.forEach(user => {
                sendNewsletterEmail(user.email, user.firstName);
                var log = "Weekly newsletter has been sent to **" + user.username + "** with the following email address **" + user.email + "** at **" + moment().format("DD.MM.YYYY HH:mm:ss") + "**.";
                stream.write("\n" + log);
            });
        });
    });

    function sendNewsletterEmail(email, firstName) {
		var mailOptions = {
			from: emailUser,
			to: email,
			subject: "Weekly newsletter",
			html: "<html>" +
				"<body>" +
				"<p>Dear <b>" + firstName + "</b>,</p>" +
				"<p>thank you for using EasyChat. We wish you a great start into the week." +
				"<p>Kind regards,<br/> your Admin Team</p>" +
				"</body>" +
				"</html>"
		};
		transporter.sendMail(mailOptions).then().catch(error => console.log(error));
	}
}