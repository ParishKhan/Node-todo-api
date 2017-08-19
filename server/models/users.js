const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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


UsersSchema.methods.removeToken = function(token) {
  var user = this;

  return user.update({
    $pull: {
      token: {token}
    }
  })
} 


UsersSchema.statics.findByToken = function(token) {
  var Users = this, decodedToken
  
  try {
    decodedToken = jwt.verify(token, 'secrets')
  } catch(e) {
    // return new Promise((reject, resolve) => {
    //   reject();
    // })
    return Promise.reject();
  }

  return Users.findOne({
    '_id': decodedToken._id,
    'token.token': token,
    'token.access': 'auth'
  }) 
}


UsersSchema.statics.findByCredentials = function(email, password) {
  var Users = this;
  return Users.findOne({email}).then((user) => {
    if(!user) return Promise.reject();

    return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, response) => {
          if(response) {
            // generate web token and send response
            // var access = 'auth';
            // var newToken = User.generateAuthTokens();
            // userdata.token = newToken;

            resolve(user);
          } else {
            reject();
          }
        });
    })
  })
}


UsersSchema.pre('save', function(next) {
  var user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      })
    })
  } else {
    next();
  }
})

var Users = mongoose.model('Users', UsersSchema);

module.exports = {Users}