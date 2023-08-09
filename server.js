const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const ROUTES = {
  users: require("./routes/api/users"),
  auth: require("./routes/api/auth"),
  profile: require("./routes/api/profile"),
  social: require("./routes/api/socialAuth"),
  dashboard: require("./routes/api/dashboard"),
  widget: require("./routes/api/widget"),
};

const passport = require("passport");

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "1391981",
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const connectDB = require("./config/db");

app.use(
  cors({
    origin: ["*"],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
  }),
);

// const setUpProxy = require("./middleware/setUpProxy");

// setUpProxy(app);
//connect DB
connectDB();

//Initate body parser
app.use(express.json({ extended: false }));

//Define routes
app.use("/api/users", ROUTES["users"]);
app.use("/api/auth", ROUTES["auth"]);
app.use("/api/social", ROUTES["social"]);
app.use("/api/dashboard", ROUTES["dashboard"]);
app.use("/api/widget", ROUTES["widget"]);

//server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started @ ${PORT}`);
});
