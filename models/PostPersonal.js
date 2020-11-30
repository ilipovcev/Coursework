const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postPersonalSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('postsPersonal', postPersonalSchema);
