require('./config/config.js');
// Library Modules
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Local Modules
var {mongoose} = require('./db/mongoose');
var {Todos} = require('./models/todos');
var {Users} = require('./models/users');
var {authenticate} = require('./middlewares/authenticate.js');

var app = express(); // New Express App

// Env Variables
const PORT = process.env.PORT;

// Middlewares
app.use(bodyParser.json());

// Handle post request
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todos({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
});

// Handle get request
app.get('/todos', authenticate, (req, res) => {
  Todos.find({_creator: req.user._id}).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

// Handle get request for /todos/id
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) return res.status(404).send();

  Todos.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send();

    res.status(200).send(todo);
  }, () => {
    res.status(400).send();
  });
});


// Handle delete request for /todos/id
app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) return res.status(404).send();

  Todos.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send();

    res.status(200).send(todo);
  }, () => {
    res.status(400).send();
  })
});

// Handle Update request for /todos/id
app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) return res.status(404).send();

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
 
  Todos.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {$set: body}, {new: true}).then((todo) => {
    if(!todo) return res.status(404).send();
    res.status(200).send({todo});

  }).catch((err) => res.status(400).send());
});


// Handle User POST for /users route
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  var usersave = new Users({
    email: body.email,
    password: body.password
  })

  usersave.save().then((doc) => {
    return usersave.generateAuthTokens().then((token) => {
      res.header('x-auth', token).send({
        "_id": doc._id,
        "email": doc.email
      });
    });
    
  }, (err) => res.status(400).send(err))
});

// Handle User profile route
app.get('/users/me', authenticate, (req, res) => {
  res.status(200).send(req.user);
});


// Handle Login
// app.post('/users/login', (req, res) => {
//   var body = _.pick(req.body, ['email', 'password']);
//   var email = body.email;
//   var password = body.password;

//   Users.findByCredentials(email, password).then((response) => {
//     res.send(response)
//   }).catch((err) => {
//     res.send(err);
//   })
// });

// POST /users/login
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  Users.findByCredentials(body.email, body.password).then((user) => {
    
    return user.generateAuthTokens().then((token) => {
      res.header('x-auth', token).send({
        "_id": user._id,
        "email": user.email
      });
    })
  }).catch((e) => {
    res.status(400).send();
  })
})

// DELETE /users/me/token (Logout user)
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  })
})


// Listening PORT
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

module.exports = {app}