const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) return console.log('Unable to connect ot MongoDB server');

  console.log('Connected to mongodb server');

  db.collection('Todo').find({completed: false}).toArray().then((docs) => {
    console.log('Todo');
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err) => {
    console.log('Unable to fetch todo', err);
  })

 // db.close();
});