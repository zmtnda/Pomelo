// This middleware assumes cookieParser has been "used" before this

var crypto = require('crypto');

var sessions = {};
var duration = 7200000; // Two hours in milliseconds
var cookieName = 'CHSAuth';

exports.router = function(req, res, next) {
	console.log("Session js");
   if (req.cookies[cookieName]) {
      if (sessions[req.cookies[cookieName]]) {
         if (sessions[req.cookies[cookieName]].lastUsed < new Date().getTime() - duration) {
            delete sessions[req.cookies[cookieName]];
         }
         else {
            req.session = sessions[req.cookies[cookieName]];
         }
      }
   }
   next();
};

var Session = function Session(user) {
	console.log("new session");
   this.firstName = user.firstName;
   this.lastName = user.lastName;
   this.id = user.id_log;
	 this.tec_id = user.id_tec;
   this.email = user.email;
   this.loginTime = new Date().getTime();
   this.lastUsed = new Date().getTime();
   this.role = user.role;
   this.website = user.website;
   this.avatar = user.avatar;
   this.aboutMe = user.aboutMe;
   this.companyName = user.companyName;
   this.companyAddress = user.companyAddress;
   this.companyPhone = user.companyPhone;
	 this.panelAlbum_id = user.panelAlbum_id;
	 this.panelAlbum = user.panelAlbum;
};

Session.prototype.isAdmin = function() {
   return this.role == 2;
};

Session.prototype.isTechnician = function() {
   return this.role == 1;
};

exports.makeSession = function makeSession(user, res) {

	console.log("make session");
   var cookie = crypto.randomBytes(16).toString('hex');
   var session = new Session(user);

   res.cookie(cookieName, cookie, { maxAge: duration, httpOnly: true });
   sessions[cookie] = session;

   return cookie;
};

exports.deleteSession = function(cookie) {
   delete sessions[cookie];
};

exports.cookieName = cookieName;
exports.sessions = sessions;
