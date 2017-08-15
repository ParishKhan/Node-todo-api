const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todos} = require('./../../models/todos');
const {Users} = require('./../../models/users');

var userOneId = new ObjectID();
var userTwoId = new ObjectID();

var usersTest = [{
 _id: userOneId,
 email: 'parish@gmail.com',
 password: 'useronepassword!',
 token: [{
   access: 'auth',
   token: jwt.sign({_id: userOneId, access: 'auth'}, 'secrets').toString()
 }]
}, {
  _id: userTwoId,
  email: 'parish2@gmail.com',
  password: 'usertwopassword!'
}]


var todosTest = [{
  _id: new ObjectID,
  text: "First test todo"
},
{
  _id: new ObjectID,
  text: "Second test todo",
  completed: true,
  completedAt: 333
}]


var populateTodo = (done) => {
  Todos.remove({}).then(() => {
    return Todos.insertMany(todosTest)
  }).then(() => done());
}


var populateUsers = (done) => {
  Users.remove({}).then(() => {
    var userOne = new Users(usersTest[0]).save();
    var userTwo = new Users(usersTest[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
}


module.exports = {todosTest, populateTodo, usersTest, populateUsers}