const mongoose = require("mongoose");
const Post = mongoose.model("post");
const requireLogin = require("../middlewares/requireLogin");
const uploadToS3 = require("../services/aws");
const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  app.delete("/api/users/:id", requireLogin, async (req, res) => {
    const { id } = req.params;

    try {
      const user = await Post.findByIdAndRemove(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully", id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post(
    "/api/submitPostInfo",
    upload.single("profileImage"),
    requireLogin,
    async (req, res) => {
      const { goal, planDesc, planName, style, vegan } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      try {
        const result = await uploadToS3(
          req.file.buffer,
          req.file.originalname,
          "posts-raging-incel"
        );
        const imageLocation = result.Location;

        const postInfo = new Post({
          goal,
          planDesc,
          planName,
          style,
          vegan,
          image: imageLocation,
          _user: req.user.id,
        });
        await postInfo.save();

        res.status(201).json(postInfo);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.get("/api/posts", requireLogin, async (req, res) => {
    try {
      const posts = await Post.find({ _user: req.user.id }).sort({ date: -1 });
      res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
};
