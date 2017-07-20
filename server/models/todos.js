var mongoose = require('mongoose');

var Todos = mongoose.model('Todos', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: null
  }
});

module.exports = {Todos}