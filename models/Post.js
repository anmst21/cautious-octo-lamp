const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  goal: String,
  planDesc: String,
  planName: String,
  style: String,
  vegan: Boolean,
  date: { type: Date, default: Date.now },
  calories: { type: Number, default: 2000 },
  _user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  image: String,
});

module.exports = mongoose.model("post", postSchema);
