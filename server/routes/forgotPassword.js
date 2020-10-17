module.exports = function(app, bcryptjs, mongoose, models, transporter, emailUser, bodyParser, resetPasswordUrl) {
  var User = models.User;
  app.post("/forgotPassword", (request, response) => {
    var email = request.body.email;
    if(email && isValidEmail(email)) {
      var query = {email: email};
      User.findOne(query).then(user => {
        if(!isEmpty(user)) {
          sendResetPasswordEmail(user.username, user.email, user.firstName);
          response.status(200).json({exists: true});
          response.end();
        } else {
          response.status(200).json({exists: false});
          response.end();
        }
      }).catch(error => console.log(error));
    } else {
      response.status(200).json({exists: false});
      response.end();
    }
  });
  app.post("/resetPassword", (request, response) => {
    var username = request.body.username;
    var password = request.body.password;
    if(username && password && isValidPassword(password)) {
      var query = {username: username};
      bcryptjs.genSalt(10, (error, salt) => {
        bcryptjs.hash(password, salt, (error, hash) => {
          var update = {password: hash};
          User.findOneAndUpdate(query, update, {new: true}).then(user => {
            if(!isEmpty(user)) {
              response.status(200).json({reset: true});
              response.end();
            } else {
              response.status(200).json({reset: false});
              response.end();
            }
          }).catch(error => console.log(error));
        });
      });
    } else {
      response.status(200).json({reset: false});
      response.end();
    }
  });

  function sendResetPasswordEmail(username, email, firstName) {
    var mailOptions = {
     from: emailUser,
     to: email,
     subject: "Reset password",
     html: "<html>" +
       "<body>" +
         "<p>Dear <b>" + firstName + "</b>,</p>" +
         "<p>you have requested to change your password. Click on the button below to proceed with your request:" +
         "<p style='margin-bottom: 30px;'><a href='" + resetPasswordUrl + username + "' target='_blank' style=' background-color: #1a1aff; border: none; color: #fff; padding: 10px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; cursor: pointer; border-radius:5px;'>Reset password</a></p>" +
         "<p>Kind regards,<br/> your Admin Team</p>" +
       "</body>" +
     "</html>"};
   transporter.sendMail(mailOptions).then().catch(error => console.log(error));
 }
 function isValidEmail(email) {
   var emailFormat = /\S+@\S+\.\S+/;
   if(emailFormat.test(email)) {
     return true;
   } else {
     return false;
   }
 }
 function isValidPassword(password) {
   var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
   if(passwordFormat.test(password)) {
     return true;
   } else {
     return false;
   }
 }
 function isEmpty(object) {
   return !object || Object.keys(object).length === 0;
 }
}
