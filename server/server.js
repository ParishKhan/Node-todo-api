// Library Modules
var  express = require('express');
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

// Listening PORT
app.listen(3000, () => {
  console.log('App is listening on port 3000')
});

module.exports = {app}