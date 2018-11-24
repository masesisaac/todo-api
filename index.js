const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {user, todo} = require('./model');
const port = process.env.PORT || 3100;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  const {username, password} = req.body;
  if(username && password){
    let newUser = await user.create({username, password});
    res.status(200).send(newUser);
  }else {
    res.status(400).send('username and password are required');
  }
});

app.get('/login', async (req, res) => {
  const {username, password} = req.body;
  if(username && password){
    user.authenticate({username, password})
      .then((theUser) => res.status(200).send(theUser))
      .catch((err) => res.status(400).send('username or password wrong'))
  }else {
    res.status(400).send('username and password are required');
  }
});

app.post('/todo', async (req, res) => {
  const { ToDo, userId } = req.body;
  if(ToDo && userId) {
    let theTodo = await todo.create({todo: ToDo, userId});
    res.status(200).send(theTodo);
  }else{
    res.status(400).send('todo and owner are required');
  }
});

app.get('/todos', async (req, res) => {
  const { userId } = req.body;
  if(userId){
    let todos = await todo.getAllByUser(userId);
    res.status(200).send(todos);
  }else{
    res.status(400).send('owner is required');
  }
});

app.delete('/todo', async (req, res) => {
  const { id } = req.body;
  if(id){
    await todo.delete(id);
    res.status(200).send('done');
  }else {
    res.status(400).send('todo id is required');
  }
});

app.listen(port, ()=>{
  console.log('Server started on port '+port);
});
