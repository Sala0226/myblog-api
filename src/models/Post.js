const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true },
  image:   { type: String, default: '' },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  comments: [
    {
      user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content:   { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);