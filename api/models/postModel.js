const mongoose = require('mongoose');

const {Schema} = mongoose;

const postModel = new Schema(
  {
    _id:  mongoose.Schema.Types.ObjectId,
    title:  {
      type: String,
      required: true
    },
    body:  {
      type: String,
      required: true
    },
  }, {timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Post', postModel);