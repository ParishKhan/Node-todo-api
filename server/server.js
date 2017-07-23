// Library Modules
var {ObjectID} = require('mongodb');
var express = require('express');
var bodyParser = require('body-parser');

// Local Modules
var {mongoose} = require('./db/mongoose');
var {Todos} = require('./models/todos');
var {Users} = require('./models/users');

var app = express(); // New Express App

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
  console.log(id);
  if(!ObjectID.isValid(id)) return res.status(404).send();

  Todos.findById(id).then((todo) => {
    if(!id) return res.status(404).send();

    res.status(200).send(todo);
  }, () => {
    res.status(400).send();
  });
})

// Listening PORT
app.listen(3000, () => {
  console.log('App is listening on port 3000')
});

module.exports = {app}