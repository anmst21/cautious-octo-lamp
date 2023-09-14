const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("users");

module.exports = (app) => {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    async (req, res) => {
      try {
        // Find the user
        const user = await User.findById(req.user.id);

        // If user is not found, handle it
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Redirect based on the 'userInfo' field
        if (user.userInfo) {
          res.redirect(
            "https://health-app-client-1bbf563dc707.herokuapp.com/app"
          );
        } else {
          res.redirect(
            "https://health-app-client-1bbf563dc707.herokuapp.com/user-info"
          );
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.get("/api/current_user", async (req, res) => {
    res.send(req.user);
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/auth");
  });
};
