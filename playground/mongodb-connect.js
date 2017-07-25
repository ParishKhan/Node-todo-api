const MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.MONGODB || 'mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) return console.log('Unable to connect ot MongoDB server');

  console.log('Connected to mongodb server');

  db.collection('Todo').insertOne({
    text: 'Something todo',
    complete: false
  }, (err, result) => {
    if(err) return console.log('Unable to insert Todo', err);

    console.log(JSON.stringify(result.ops));
  })

  db.close();
});