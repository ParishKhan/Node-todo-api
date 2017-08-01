// Library Modules
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

// Local Modules
var {mongoose} = require('./db/mongoose');
var {Todos} = require('./models/todos');
var {Users} = require('./models/users');

var app = express(); // New Express App

// Env Variables
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());

// Handle post request
app.post('/todos', (req, res) => {
  var todo = new Todos({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
});

// Handle get request
app.get('/todos', (req, res) => {
  Todos.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

// Handle get request for /todos/id
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) return res.status(404).send();

  Todos.findById(id).then((todo) => {
    if(!todo) return res.status(404).send();

    res.status(200).send(todo);
  }, () => {
    res.status(400).send();
  });
});


// Handle delete request for /todos/id
app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) return res.status(404).send();
  Todos.findOneAndRemove({_id: id}).then((todo) => {
    if(!todo) return res.status(404).send();

    res.status(200).send(todo);
  }, () => {
    res.status(400).send();
  })
});

// Handle Update request for /todos/id
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) return res.status(404).send();

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
 
  Todos.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if(!todo) return res.status(404).send();
    res.status(200).send({todo});

  }).catch((err) => res.status(400).send());
})

// Listening PORT
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

module.exports = {app}