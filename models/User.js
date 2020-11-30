const { Schema, model } = require('mongoose');
const Post = require('../models/Post');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userPosts: {
    posts: [
      {
        postId: {
          type: Schema.Types.ObjectId,
          ref: 'posts',
          reqiured: true,
        },
      },
    ],
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
});

userSchema.methods.addPost = function (post) {
  this.userPosts.posts.push({
    postId: post._id,
  });
  this.count++;
  return this.save();
};

userSchema.methods.deletePost = function (post) {
  id = post._id;
  idx = this.userPosts.posts.findIndex((i) => i._id === id);
  this.userPosts.posts.splice(idx, 1);
  this.count--;
  return this.save();
};

module.exports = model('User', userSchema);
