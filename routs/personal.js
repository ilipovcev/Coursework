const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PostPersonal = require('../models/PostPersonal');
const fileMiddleware = require('../middleware/files');

router.get('/', auth, async (req, res) => {
  const posts = await PostPersonal.find({ userId: req.user }).populate(
    'userId',
    'email name'
  );
  //console.log(posts);
  res.status(200).json(posts);
});

router.post(
  '/uploadPersonal',
  fileMiddleware.array('imgUploadPersonal', 10),
  async (req, res) => {
    let link = [];

    for (let i = 0; i < req.files.length; i++) {
      console.log(req.files[i].path);
      link.push(req.files[i].path);
    }

    res.status(201).json(link);
  }
);

router.post('/', auth, async (req, res) => {
  const postData = {
    text: req.body.text,
    img: req.body.img,
    userId: req.user,
  };
  const post = new PostPersonal(postData);
  try {
    await req.user.addPost(post);
    await post.save();
    res.status(201).json(post);
  } catch (e) {
    console.log(e);
  }
});

router.delete('/:postId', auth, async (req, res) => {
  const post = await PostPersonal.findById(req.params.postId);
  await PostPersonal.deleteOne({ _id: req.params.postId });
  await req.user.deletePost(post);
  res.status(200).json({
    message: req.params.postId,
  });
});

module.exports = router;
