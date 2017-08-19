const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todos} = require('./../models/todos');
const {Users} = require('./../models/users');
const {todosTest, populateTodo, usersTest, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodo);

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
      });
  });
});

describe('GET /users/me', () => {
  it('Should return user if authenticate', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', usersTest[0].token[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(usersTest[0]._id.toHexString());
        expect(res.body.email).toBe(usersTest[0].email);
      })
      .end(done);
  });

  it('Should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('Should create a new user', (done) => {
    var user = {
      email: 'exampletest@gmail.com',
      password: 'somesecret!'
    }

    request(app)
      .post('/users')
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(user.email);
      })
      .end((err) => {
        if(err) return done();

        Users.findOne({email: user.email}).then((userdata) => {
          expect(userdata).toExist();
          expect(userdata.password).toNotBe(user.password);
          done();
        })
      });
  });

  it('Should return validation error if request invalid', (done) => {
    var user = {
      email: 'exampletest@gmail.com',
      password: 'som'
    }

    request(app)
      .post('/users')
      .send(user)
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
        expect(res.body._id).toNotExist();
      })
      .end(done);
  });

  it('Should not create user if email in use', (done) => {
    var user = {
      email: 'parish@gmail.com',
      password: 'useronepassword!'
    }

    request(app)
      .post('/users')
      .send(user)
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
        expect(res.body._id).toNotExist();
      })
      .end(done);
  })
});


describe('POST /users/login', () => {
  it('Should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({'email': usersTest[1].email, 'password': usersTest[1].password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if(err) return done(err);

        Users.findById(usersTest[1]._id).then((user) => {
          expect(user.token[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((err) => done(err));
      })
  });

  it('Should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({'email': usersTest[1].email, 'password': 'crackme!@'})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err) => {
        if(err) return done(err);

        Users.findOne({email: usersTest[1].email}).then((user) => {
          expect(user.token[0]).toBe(undefined);
          done();
        }).catch(err => done(err));
      })
  });
})