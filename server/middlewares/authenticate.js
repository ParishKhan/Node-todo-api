const {Users} = require('./../models/users.js');

var authenticate = function(req, res, next) {
  var token = req.header('x-auth');

  Users.findByToken(token).then((user) => {
    if(!user) {
      return new Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send()
  });
}

module.exports = {authenticate}