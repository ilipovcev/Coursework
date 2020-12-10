const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const fileMiddleware = require('../middleware/files');

router.get('/', async (req, res) => {
  const posts = await Post.find({}).populate('userId', 'email name');
  res.status(200).json(posts);
});

router.post(
  '/upload',
  fileMiddleware.array('imgUpload', 10),
  async (req, res) => {
    let link = [];

    for (let i = 0; i < req.files.length; i++) {
      console.log(req.files[i].path);
      link.push(req.files[i].path);
    }

    console.log(link);
    res.status(201).json(link);
  }
);

router.post('/', auth, async (req, res) => {
  const postData = {
    text: req.body.text,
    img: req.body.img,
    userId: req.user,
  };
  const post = new Post(postData);

  try {
    await req.user.addPost(post);
    await post.save();
    res.status(201).json(post);
  } catch (e) {
    console.log(e);
  }
});

router.delete('/:postId', async (req, res) => {
  const post = await Post.findById(req.params.postId);
  try {
    if (JSON.stringify(post.userId) === JSON.stringify(req.user._id)) {
      await Post.deleteOne({ _id: req.params.postId, userId: req.user._id });
      await req.user.deletePost(post);
      res.status(200).json({
        message: req.params.postId,
      });
    } else if (
      JSON.stringify(req.user._id) ===
      JSON.stringify('5f9d6a43cff3d912b82229e3')
    ) {
      req.user = await User.findById(post.userId);
      await Post.deleteOne({ _id: req.params.postId, userId: req.user._id });
      await req.user.deletePost(post);
      res.status(200).json({
        message: req.params.postId,
      });
    } else {
      res.status(403).json({
        message: 'У вас нет прав удалять чужой пост!',
      });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
