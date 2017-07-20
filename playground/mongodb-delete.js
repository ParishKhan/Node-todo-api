const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) return console.log('Unable to connect ot MongoDB server');

  console.log('Connected to mongodb server');

  db.collection('Todo').findOneAndDelete({_id: new ObjectID("596e043d19d54919c5a6ba6c")}).then((result) => {
    console.log(result);
  });

});