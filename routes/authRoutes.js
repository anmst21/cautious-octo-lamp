const passport = require("passport");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");
const keys = require("../config/keys");
const User = mongoose.model("users");

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

sgMail.setApiKey(keys.sgKey);

async function sendOTP(email, otp) {
  const msg = {
    to: email,
    from: keys.myEmail,
    subject: "Your OTP",
    text: `Your OTP is: ${otp}`,
    html: `<strong>Your OTP is: ${otp}</strong>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent");
  } catch (error) {
    console.error(error.toString());
  }
}

module.exports = (app) => {
  app.post("/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ success: false, message: info.message });
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.status(200).json({
          success: true,
          message: "Logged in successfully",
          user: { email: user.email, userInfo: user.userInfo },
        });
      });
    })(req, res, next);
  });

  app.post("/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already registered." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const otp = generateOTP();
      console.log(otp);

      const otpExpires = new Date();
      otpExpires.setMinutes(otpExpires.getMinutes() + 5);

      user = new User({
        email,
        password: hashedPassword,
        otpData: {
          otp,
          otpExpires,
        },
      });

      await user.save();

      sendOTP(email, otp);

      res.json({
        message: "User registered successfully. Please verify your email.",
        email: email,
        otpExpires: otpExpires.toISOString(),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  app.post("/auth/verify-register", async (req, res) => {
    try {
      const { email, otp } = req.body;

      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found." });
      }

      if (user.otpData.otpExpires < Date.now()) {
        return res.status(400).json({ message: "OTP has expired." });
      }

      if (user.otpData.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP." });
      }

      user.otpData = undefined;

      await user.save();

      res.json({ message: "Email verification successful." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  app.post("/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;

      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found." });
      }

      const otp = generateOTP();

      const otpExpires = new Date();
      otpExpires.setMinutes(otpExpires.getMinutes() + 5);

      user.otpData = {
        otp,
        otpExpires,
      };

      await user.save();

      sendOTP(email, otp);
      res.json({
        message: "Password reset OTP sent. Please check your email.",
        email: email,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  app.post("/auth/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;

      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found." });
      }

      if (!user.otpData || new Date() > user.otpData.otpExpires) {
        const otp = generateOTP();

        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 5);

        user.otpData = {
          otp,
          otpExpires,
        };

        await user.save();

        sendOTP(email, otp);

        return res.json({
          message: "A new OTP has been sent. Please check your email.",
          email: email,
          otpExpires: otpExpires,
        });
      } else {
        return res.status(400).json({
          message: "Your OTP has not yet expired. Please wait.",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  app.post("/auth/verify-reset", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found." });
      }

      if (user.otpData.otpExpires < Date.now()) {
        return res.status(400).json({ message: "OTP has expired." });
      }

      if (user.otpData.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.otpData = undefined;

      await user.save();

      res.json({ message: "Password reset successful." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });
};
