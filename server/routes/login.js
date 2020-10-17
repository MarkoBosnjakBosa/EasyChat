module.exports = function(app, bcryptjs, mongoose, models, bodyParser) {
  const User = models.User;
  app.post("/checkLogin", (request, response) => {
   var login = request.body.login;
   if(login) {
     var query = {$or: [{username: login}, {email: login}]};
     User.findOne(query).then(user => {
       if(!isEmpty(user)) {
         response.status(200).json({exists: true});
         response.end();
       } else {
         response.status(200).json({exists: false, empty: false});
         response.end();
       }
     }).catch(error => console.log(error));
   } else {
     response.status(200).json({exists: false, empty: true});
     response.end();
   }
 });
 app.post("/login", (request, response) => {
   var allowLogin = true;
   var errorFields = [];
   var login = request.body.login;
   if(!login) {
     errorFields.push("login");
     allowLogin = false;
   }
   var password = request.body.password;
   if(!password || invalidPassword(password)) {
     errorFields.push("password");
     allowLogin = false;
   }
   if(allowLogin) {
     var query = {$or: [{username: login}, {email: login}]};
     User.findOne(query).then(user => {
       if(!isEmpty(user)) {
         bcryptjs.compare(password, user.password, function(error, foundPassword) {
           if(foundPassword) {
             //request.session.username = admin.username;
             response.status(200).json({valid: true, admin: user.admin});
             response.end();
           } else{
             response.status(200).json({valid: false, allowed: true});
             response.end();
           }
         })
       } else {
         errorFields.push("login");
         response.status(200).json({valid: false, allowed: false, errorFields: errorFields});
         response.end();
       }
     });
   } else {
     response.status(200).json({valid: false, allowed: false, errorFields: errorFields});
     response.end();
   }
 });

 function invalidPassword(password) {
   var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
   if(passwordFormat.test(password)) {
     return false;
   } else {
     return true;
   }
 }
 function isEmpty(object) {
   return !object || Object.keys(object).length === 0;
 }
}
