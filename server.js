const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const ROUTES = {
  users: require("./routes/api/users"),
  auth: require("./routes/api/auth"),
  social: require("./routes/api/socialAuth"),
  fb: require("./routes/api/socialApp/facebook/auth"),
  dashboard: require("./routes/api/dashboard"),
  widget: require("./routes/api/widget"),
  ga_metrics: require("./routes/api/socialApp/google_anaylitcs/gAnalytics"),
  ga_oauth: require("./routes/api/socialApp/google_anaylitcs/oauth"),
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
    AccessControlAllowOrigin: "*",
    origin: "*",
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
app.use("/api/social/facebook", ROUTES["fb"]);
app.use("/api/dashboard", ROUTES["dashboard"]);
app.use("/api/widget", ROUTES["widget"]);
app.use("/api/metrics/google", ROUTES["ga_metrics"]);
app.use("/api/metrics/ga/auth", ROUTES["ga_oauth"]);

//server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started @ ${PORT}`);
});
