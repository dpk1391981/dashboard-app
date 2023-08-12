const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const { body, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
/**
 * @route GET api/users
 * @desc List users
 * @access Public
 */

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.find({}, [
      "_id",
      "avatar",
      "fullName",
      "email",
      "mobileNumber",
      "status",
      "email_verified",
      "isSuperAdmin",
      "role",
    ]);
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * @route POST api/users
 * @desc Register users
 * @access Public
 */
router.post(
  "/",
  [
    body("fullName", "Full name is required!!!").not().isEmpty(),
    body("email", "Please include a validate email address!!!").isEmail(),
    body("mobileNumber", "Mobile Number Required!").not().isEmpty(),
    body("agree", "Agree required!").not().isEmpty(),
    body("password", "Password required").not().isEmpty(),
    body("password", "Please enter with 6 or more character!!!").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
      }

      const { fullName, email, mobileNumber, password, agree } = req.body;
      let user = await User.findOne({ email });
      console.log(`useruseruser`);
      console.log(user);

      if (user) {
        return res.status(400).json({ errors: [{ msg: "User already exists!!!" }] });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        fullName,
        email,
        mobileNumber,
        isAgree: agree,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //Save user
      await user.save();
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
      console.log(`Error @register user: ${error.message}`);
      res.status(500).send("Server Error");
    }
  },
);

router.put(
  "/profile/update",
  [
    body("fullName", "Full name is required!!!").not().isEmpty(),
    body("email", "Please include a validate email address!!!").isEmail(),
  ],
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
      }

      const { body } = req;
      const { password, _id } = body;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        body["password"] = await bcrypt.hash(password, salt);
      }

      body["isAgree"] = true;
      let user = await User.findByIdAndUpdate(_id, body);

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid user!" }] });
      }

      res.json({ user });
    } catch (error) {
      console.log(`Error @update user profile: ${error.message}`);
      res.status(500).send("Server Error");
    }
  },
);

module.exports = router;
