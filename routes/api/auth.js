const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Dashboard = require("../../models/Dashboard");

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

/**
 * @route GET api/auth
 * @desc Test Routes
 * @access Public
 */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * @route POST api/auth
 * @desc Auth users
 * @access Public
 */
router.post(
  "/",
  [
    body("email", "Please include a validate email address!!!").not().isEmpty().isEmail(),
    body("password", "Please enter password!!!").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
      }

      console.log(`req.bodyreq.body`);
      console.log(req.body);
      const { email, password } = req.body;
      let user = await User.findOne({ email });

      console.log(user);
      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      if (user.password || user["auth_type"] === "mannual") {
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) {
          return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
        }
      } else {
        return res.status(400).json({
          errors: [{ msg: "Your account found as  " + user["auth_type"] + " please login and set your password" }],
        });
      }

      let payload = {
        user: {
          id: user.id,
        },
      };
      //jwt token
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        },
      );
    } catch (error) {
      console.log(`Error @auth user: ${error.message}`);
      res.status(500).send("Server Error");
    }
  },
);

module.exports = router;
