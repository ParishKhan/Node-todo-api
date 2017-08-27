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
   token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
 }]
}, {
  _id: userTwoId,
  email: 'parish2@gmail.com',
  password: 'usertwopassword!',
  token: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}]


var todosTest = [{
  _id: new ObjectID,
  text: "First test todo",
  _creator: userOneId
},
{
  _id: new ObjectID,
  text: "Second test todo",
  completed: true,
  completedAt: 333,
  _creator: userTwoId
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