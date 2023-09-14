const mongoose = require("mongoose");

const { Schema } = mongoose;

const userInfoSchema = new Schema({
  preferences: [String],
  indifferences: [String],
  _user: { type: Schema.Types.ObjectId, ref: "User" },
  details: {
    name: String,
    dob: String,
    feet: String,
    inch: String,
    activity: String,
    time: String,
  },
  image: String,
});

module.exports = mongoose.model("userInfo", userInfoSchema);
