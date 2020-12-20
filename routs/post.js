const express = require('express');
const multer = require('multer');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const fileMiddleware = require('../middleware/files');
const { postValidators } = require('../utils/validators');
const fs = require('fs');

const file = fileMiddleware.array('imgUpload', 5);

router.get('/', async (req, res) => {
  const posts = await Post.find({}).populate('userId', 'email name');
  res.status(200).json(posts);
});

router.post('/upload', auth, async (req, res) => {
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

router.post('/', auth, postValidators, async (req, res) => {
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

router.post('/deleteImg', auth, async (req, res) => {
  try {
    console.log(req.body);
    const links = req.body;
    if (links == []) {
      return res.status(200).json();
    }
    for (let i = 0; i < links.length; i++) {
      if (links[i].includes('images\\')) {
        fs.unlink(links[i], (err) => {
          if (err) throw err;
          console.log('File was deleted');
        });
        res.status(200).json();
      } else {
        res.status(406).json();
      }
    }
  } catch (e) {
    res.status(406).json();
  }
});

router.delete('/:postId', auth, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  try {
    if (JSON.stringify(post.userId) == JSON.stringify(req.user._id)) {
      await Post.deleteOne({ _id: req.params.postId, userId: req.user._id });
      await req.user.deletePost(post);

      if (post.img) {
        for (let i = 0; i < post.img.length; i++) {
          fs.unlink(post.img[i], (err) => {
            if (err) {
              return res.status(404).json();
            }
            console.log('File was deleted');
          });
        }
      }

      res.status(200).json({
        message: req.params.postId,
      });
    } else if (
      JSON.stringify(req.user._id) == JSON.stringify(process.env.ADMIN_ID)
    ) {
      req.user = await User.findById(post.userId);
      await Post.deleteOne({ _id: req.params.postId, userId: req.user._id });
      await req.user.deletePost(post);

      if (post.img) {
        for (let i = 0; i < post.img.length; i++) {
          fs.unlink(post.img[i], (err) => {
            if (err) {
              return res.status(404).json();
            }
            console.log('File was deleted');
          });
        }
      }

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
