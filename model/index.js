const mongoose = require('mongoose');
const config = require('config');
const bcrypt = require('bcrypt');
mongoose.connect(config.get('db.url'))
 .then(() => {
   console.log('db connected');
 })
 .catch(() => {
   console.log('db failed to connect');
 });

const User = mongoose.model('User', {
  username: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  createdDate: { type: Date, default: Date.now }
});
const user = {
  create: async (userParam) => {
    if(await User.findOne({username: userParam.username})) {
      throw 'Username "'+userParam.username+'" is already taken';
    }
    const newUser = new User(userParam);
    if(userParam.password){
      newUser.hash = bcrypt.hashSync(userParam.password, 10);
    }
    await newUser.save();
    return {...newUser._doc, hash: undefined};
  },
  authenticate: async ({ username, password }) => {
    const theUser = await User.findOne({ username });
    if(theUser && bcrypt.compareSync(password, theUser.hash)) {
      const { hash, ...userWithoutHash } = theUser.toObject();
      return userWithoutHash;
    }else {
      throw 'User authentication failed';
    }
  },
  getAll: async () => {
    return await User.find().select('-hash');
  },
  getById: async (id) => {
    return await User.findById(id).select('-hash');
  },
  update: async (id, userParam) => {
    const theUser = await User.findById(id);
    if(!theUser) throw 'User not found';
    if(theUser.username !== userParam.username && await User.findOne({ username: userParam.username })) {
      throw 'Username "'+userParam.username+'" is already taken';
    }
    if(userParam.password) {
      userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }
    Object.assign(theUser, userParam);
    await theUser.save();
  },
  delete: async (id) => {
    await User.findByIdAndRemove(id);
  }
};

const ToDo = mongoose.model('ToDo', {
  todo: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  createdDate: { type: Date, default: Date.now }
});
const todo = {
  create: async (todoParam) => {
    const newTodo = new ToDo(todoParam);
    await newTodo.save();
    return newTodo._doc;
  },
  getAllByUser: async (userId) => {
    return await ToDo.find({ userId });
  },
  getById: async (id) => {
    return await ToDo.findById(id);
  },
  delete: async (id) => {
    await ToDo.findByIdAndRemove(id);
  }
}

 module.exports = {
  user,
  todo
 }
