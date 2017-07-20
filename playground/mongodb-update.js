const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) return console.log('Unable to connect ot MongoDB server');

  console.log('Connected to mongodb server');

  db.collection('Todo').findOneAndUpdate({
      _id: new ObjectID("596dec6c799ef029c426bb0e")
    }, {
      $set: {
        completed: true
      }
    }, {
      returnOriginal: false
    }).then((result) => {
      console.log(result);
    })

});