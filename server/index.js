const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const dotenv = require('dotenv');
const fs = require('fs');

const User = require('./models/userModel');
const Post = require('./models/postModel');

dotenv.config();
const app = express();
app.use(morgan('dev'));
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

const uploadMiddleware = multer({ dest: 'uploads/' });
const secret = process.env.SECRET;

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB).then(console.log('successfully connected to database'));

// controllers
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await User.create({ username, password });
    jwt.sign({ username, id: newUser._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        status: 'success',
        id: newUser._id,
        username,
      });
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      err,
      message: err.message,
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.json('Please provide user name and password');
    }
    const user = await User.findOne({ username });
    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(400).json('wrong username or password');
    } else {
      jwt.sign({ username, id: user._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          status: 'success',
          id: user._id,
          username,
        });
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
});

app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json({
    status: 'success',
  });
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;

    const { title, summary, content } = req.body;
    const newPost = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.status(200).json({
      status: 'success',
      data: newPost,
    });
  });
});

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json({
        status: 'fail',
        title: 'you are not the author',
        message: 'only the author of this post can edit this post',
      });
    }
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.status(200).json({
      status: 'success',
      newPath,
      postDoc,
    });
  });
});

app.get('/post', async (req, res) => {
  const posts = await Post.find()
    .populate('author', ['username'])
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: posts,
  });
});

app.get('/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', [
      'username',
    ]);
    res.status(202).json({
      status: 'success',
      post,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
