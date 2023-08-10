const express = require("express");
const app = express();
const router = express.Router();
const session = require("express-session");
const User = require("../../models/User");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const APP_URL = config.get("APP_URL");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const __URL = process.env.NODE_ENV == "production" ? APP_URL["production"] : APP_URL["local"];

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

const jwt = require("jsonwebtoken");
const config = require("config");

/**
 * @route POST api/auth
 * @desc Auth users
 * @access Public
 */

console.log(`GOOGLE_CLIENT_ID`, GOOGLE_CLIENT_ID);
console.log(`GOOGLE_CLIENT_SECRET`, GOOGLE_CLIENT_SECRET);
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/social/google/callback",
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({ social_id: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        const {
          id,
          displayName,
          photos,
          provider,
          _json: { given_name, family_name, email_verified, email },
        } = profile;

        const newUser = new User({
          fullName: displayName,
          given_name,
          family_name,
          email,
          isAgree: true,
          avatar: photos && Array.isArray(photos) ? photos[0]["value"] : null,
          auth_type: provider,
          email_verified,
          auth_source: "LOGIN",
          social_id: id,
          refreshToken,
        });
        await newUser.save();

        return done(null, newUser);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/error" }),
  function (req, res) {
    console.log(`req.userreq.user`);
    console.log(req.user._id);
    let payload = {
      user: {
        id: req.user._id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) {
          console.log(`throw err;throw err;throw err;throw err;`);
          console.log(err);
          throw err;
        }
        // res.send(token);
        // window.localStorage.setItem("token", token);
        const now = new Date();
        const ttl = now.getTime() + 30000;
        res.redirect(__URL + "/authentication?token=" + token + "&expireIn=" + ttl);
      },
    );
  },
);

module.exports = router;
