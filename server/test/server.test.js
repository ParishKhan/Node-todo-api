const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todos} = require('./../models/todos');

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

beforeEach((done) => {
  Todos.remove({}).then(() => {
    return Todos.insertMany(todosTest)
  }).then(() => done());
});

describe('POST /todos', () => {
  it('Should Create A New Todo', (done) => {
    var text = "Test todo text";

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) return done(err);

        Todos.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      })
  });

  it('Should Not Create Todo With Invalid Body Data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) return done(err);

        Todos.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      })
  });
});

describe('GET /todos', () => {
  it('Should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {
  it('Should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todosTest[0]._id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(todosTest[0].text);
      })
      .end(done);
  });

  it('Should return 404 if todo not found', (done) => {
    var hexID = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexID}`)
      .expect(404)
      .end(done);
  });

  it('Should return 404 for non object ID', (done) => {
    var randomID = 123456789;

    request(app)
      .get(`/todos/${randomID}`)
      .expect(404)
      .end(done);
  });

});



describe('DELETE /todos/:id', () => {
  it('Should remove a todo', (done) => {
    var todoid = todosTest[0]._id.toHexString();

    request(app)
      .delete(`/todos/${todoid}`)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(todoid);
      })
      .end((err, res) => {
        if(err) return done(err);

        Todos.findById(todoid).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((err) => done(err));
      })
  });

  it('Should return 404 if todo not found', (done) => {
    var hexID = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .expect(404)
      .end(done);
  });

  it('Should return 404 for invalid object ID', (done) => {
    var randomID = 123456789;

    request(app)
      .delete(`/todos/${randomID}`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('Should Update a todo', (done) => {
    var id = todosTest[0]._id.toHexString();
    var updateTodo = {
      "text": "should updated",
      "completed": true
    }
    
    request(app)
      .patch(`/todos/${id}`)
      .send(updateTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updateTodo.text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end((err, res) => {
        Todos.findById(id).then((todo) => {
          expect(todo.text).toBe(updateTodo.text);
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          done()
        }).catch((err) => done(err));
      })
  });

  it('Should clear completedAt when todo is not completed', (done) => {
    var id = todosTest[1]._id.toHexString();
    var updateTodo = {
      "text": "should updated",
      "completed": false
    }

    request(app)
      .patch(`/todos/${id}`)
      .send(updateTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updateTodo.text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end((err, res) => {
        Todos.findById(id).then((todo) => {
          expect(todo.text).toBe(updateTodo.text);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBe(null);
          done()
        }).catch((err) => done(err));
      })
  })
})