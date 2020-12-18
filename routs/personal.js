const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth = require('../middleware/auth');
const PostPersonal = require('../models/PostPersonal');
const fileMiddleware = require('../middleware/files');
const { postValidators } = require('../utils/validators');
const fs = require('fs');

const file = fileMiddleware.array('imgUploadPersonal', 5);

router.get('/', auth, async (req, res) => {
  const posts = await PostPersonal.find({ userId: req.user }).populate(
    'userId',
    'email name'
  );
  //console.log(posts);
  res.status(200).json(posts);
});

router.post('/uploadPersonal', async (req, res) => {
  file(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(406).json();
    } else {
      try {
        let link = [];

        for (let i = 0; i < req.files.length; i++) {
          console.log(req.files[i].path);
          link.push(req.files[i].path);
        }

        console.log(link);
        res.status(201).json(link);
      } catch (e) {
        console.log(e);
      }
    }
  });
});

router.post('/deleteImg', async (req, res) => {
  try {
    console.log(req.body);
    const links = req.body;
    for (let i = 0; i < links.length; i++) {
      fs.unlink(links[i], (err) => {
        if (err) throw err;
        console.log('File was deleted');
      });
    }
    res.status(200);
  } catch (e) {
    res.status(406);
  }
});

router.post('/', auth, postValidators, async (req, res) => {
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

  for (let i = 0; i < post.img.length; i++) {
    fs.unlink(post.img[i], (err) => {
      if (err) throw err;
      console.log('File was deleted');
    });
  }
  res.status(200).json({
    message: req.params.postId,
  });
});

module.exports = router;
