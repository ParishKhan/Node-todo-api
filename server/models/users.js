const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

var UsersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      messages: '{VALUE} is not a valid email id'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  token: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]

});


UsersSchema.methods.generateAuthTokens = function() {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'secrets').toString()

  user.token.push({access, token});

  return user.save().then(() => {
    return token;
  })
}

var Users = mongoose.model('Users', UsersSchema);

module.exports = {Users}