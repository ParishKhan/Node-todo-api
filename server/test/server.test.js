const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todos} = require('./../models/todos');

var todosTest = [{
  text: "First test todo"
},
{
  text: "Second test todo"
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
})