const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

// user: {
//   id,
//   name,
//   username,
//   todos: [
//      title,
//      deadline,
//      done,
//      created_at
//   ]  
// }

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers

  const user = users.find(user => user.username === username)
  if (!user){
    return res.status(404).json({ error: "user not found" })
  }

  req.user = user

  return next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body
  if (!name || !username) {
    return res.status(400).json({ error: 'invalid request values' })
  }
  const userAlreadyExists = users.find(user => user.username === username)
  if (userAlreadyExists){
    return res.status(400).json({ error: 'User already exists' })
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser)
  return res.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  return res.status(200).json(req.user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body
  if (!title || !deadline) {
    return res.status(400).json({ error: 'invalid request values' })
  }
  const newTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  req.user.todos.push(newTodo)
  return res.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params
  const { title, deadline } = req.body
  if (!title && !deadline) {
    return res.status(400).json({ error: 'invalid request values' })
  }
  req.user.todos.forEach(todo => {
    if (todo.id === id) {
      todo.title = title ? title : todo.title
      todo.deadline = deadline ? deadline : todo.deadline
      return res.status(201).json(todo)
    }
  })
  return res.status(404).json({ error: 'todo not found' })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { id } = req.params
  req.user.todos.forEach(todo => {
    if (todo.id === id) {
      todo.done = true
      return res.status(201).json(todo)
    }
  })
  return res.status(404).json({ error: 'todo not found' })
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params
  req.user.todos.forEach((todo, idx, todos) => {
    if (todo.id === id) {
      todos.splice(idx, 1)
      return res.status(204).send()
    }
  })
  return res.status(404).json({ error: 'todo not found' })

});

module.exports = app;