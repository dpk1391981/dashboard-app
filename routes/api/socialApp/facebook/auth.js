const express = require("express");
const app = express();
const router = express.Router();
const axios = require("axios");
const session = require("express-session");
const User = require("../../../../models/User");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const config = require("config");
const APP_URL = config.get("APP_URL");
const API_URL = config.get("API_URL");
const FACE_BOOK_CRED = config.get("FACEBOOK_CRED");

const FACEBOOK_CLIENT_ID = FACE_BOOK_CRED["app_id"];
const FACEBOOK_CLIENT_SECRET = FACE_BOOK_CRED["app_secret"];
const __URL = process.env.NODE_ENV == "production" ? APP_URL["production"] : APP_URL["local"];
const __API_URL = process.env.NODE_ENV == "production" ? API_URL["production"] : API_URL["local"];

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "1391981",
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

/**
 * @route POST api/auth
 * @desc Auth users
 * @access Public
 */

console.log(`FACEBOOK_CLIENT_ID`, FACEBOOK_CLIENT_ID);
console.log(`FACEBOOK_CLIENT_SECRET`, FACEBOOK_CLIENT_SECRET);

// Configure the Facebook strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: __API_URL + "/api/social/facebook/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const metrics = "page_views,page_engaged_users";

      const apiUrl = `https://graph.facebook.com/v13.0/${FACEBOOK_CLIENT_ID}/insights?metric=${metrics}&access_token=${accessToken}`;

      // Make the API request
      axios
        .get(apiUrl)
        .then((response) => {
          // Handle the response data here
          const metricsData = response.data.data;
          console.log("Metrics Data:", metricsData);
        })
        .catch((error) => {
          // Handle errors
          console.error("Error fetching data:", error);
        });

      return done(null, { profile, accessToken });
    },
  ),
);

router.get("/", passport.authenticate("facebook"));

// Facebook authentication callback
router.get("/callback", passport.authenticate("facebook", { failureRedirect: "/" }), (req, res) => {
  // Successful authentication
  console.log(`facebook request`);
  // console.log(req);
  res.redirect(__URL + "/authentication?");
});

module.exports = router;
