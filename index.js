const express = require("express");
const keys = require("./config/keys");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const app = express();
const cors = require("cors");

require("./models/User");
require("./models/UserInfo");
require("./models/Post");
require("./services/passport");

mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;

app.use(
  cookieSession({
    maxAge: 30 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(
  cors({
    origin: "https://health-app-client-1bbf563dc707.herokuapp.com",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

require("./routes/authRoutes")(app);
require("./routes/googleAuthRoutes")(app);
require("./routes/userInfoRoutes")(app);
require("./routes/postRoutes")(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT);
