const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
  userInfo: { type: Boolean, default: false },
  otpData: {
    otp: String,
    otpExpires: Date,
  },
});

mongoose.model("users", userSchema);
