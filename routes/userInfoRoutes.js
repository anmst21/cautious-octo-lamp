const mongoose = require("mongoose");
const User = mongoose.model("users");
const UserInfo = mongoose.model("userInfo");
const requireLogin = require("../middlewares/requireLogin");
const uploadToS3 = require("../services/aws");
const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  app.get("/api/fetchUser", requireLogin, async (req, res) => {
    try {
      const userInfo = await UserInfo.findOne({ _user: req.user.id });

      if (!userInfo) {
        return res.status(404).json({ error: "User info not found" });
      }

      res.json(userInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/submitUserInfo/image", requireLogin, async (req, res) => {
    try {
      const userInfo = await UserInfo.findOne({ _user: req.user.id });

      if (!userInfo) {
        return res.status(404).json({ error: "No user info exists" });
      }

      if (!userInfo.image) {
        return res
          .status(200)
          .json({ message: "No image exists for this user" });
      }

      const filename = userInfo.image;

      // Send the filename to the client
      res.status(200).json({ filename: filename });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post(
    "/api/submitUserInfo/image",
    upload.single("profileImage"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      try {
        const result = await uploadToS3(
          req.file.buffer,
          req.file.originalname,
          "images-raging-incel"
        );
        const imageLocation = result.Location;

        let userInfo = await UserInfo.findOne({ _user: req.user.id });

        if (userInfo) {
          userInfo = await UserInfo.findOneAndUpdate(
            { _user: req.user.id },
            { $set: { image: imageLocation } },
            { new: true }
          );
        } else {
          userInfo = new UserInfo({
            _user: req.user.id,
            image: imageLocation,
          });
          await userInfo.save();
        }

        res.status(200).json(userInfo);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.post("/api/submitUserInfo", requireLogin, async (req, res) => {
    const { details: details } = req.body;

    try {
      let userInfo = await UserInfo.findOne({ _user: req.user.id });

      if (userInfo) {
        userInfo = await UserInfo.findOneAndUpdate(
          { _user: req.user.id },
          { $set: { details: details } },
          { new: true }
        );
      } else {
        userInfo = new UserInfo({
          details,
          _user: req.user.id,
        });
        await userInfo.save();
      }

      res.status(200).json(userInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/submitUserInfo", requireLogin, async (req, res) => {
    try {
      const userInfo = await UserInfo.findOne({ _user: req.user.id });

      if (!userInfo) {
        return res.status(404).json({ error: "No user info exists" });
      }

      res.status(200).json(userInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/userInfoDone", requireLogin, async (req, res) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.id },
        { userInfo: true },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(400).json({ error: "User not found." });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/submitPreferences", requireLogin, async (req, res) => {
    try {
      const userInfo = await UserInfo.findOne({ _user: req.user.id });

      if (!userInfo) {
        return res
          .status(400)
          .json({ error: "No record found for this user." });
      }

      userInfo.preferences = req.body;

      await userInfo.save();

      res.status(200).json(userInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/submitIndifferences", requireLogin, async (req, res) => {
    try {
      const userInfo = await UserInfo.findOne({ _user: req.user.id });

      if (!userInfo) {
        return res
          .status(400)
          .json({ error: "No record found for this user." });
      }

      userInfo.indifferences = req.body;

      await userInfo.save();

      res.status(200).json(userInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
};
