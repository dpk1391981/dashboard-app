const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("config");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { body, validationResult } = require("express-validator");

/**
 * @route GET api/profile/me
 * @desc Test Routes
 * @access Private
 */
router.get("/me", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .sort({ createdAt: -1 })
      .exec();
    if (!profile) {
      res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error!!!");
  }
});

/**
 * @route POST api/profile
 * @desc create profile user
 * @access Private
 */
router.post(
  "/",
  [
    auth,
    [
      body("status", "Status is required!").not().isEmpty(),
      body("skills", "Skills is required!").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }
      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
      } = req.body;

      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) {
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
      }

      //Build social object
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (facebook) profileFields.social.facebook = facebook;
      if (twitter) profileFields.social.twitter = twitter;
      if (instagram) profileFields.social.instagram = instagram;
      if (linkedin) profileFields.social.linkedin = linkedin;

      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      //create
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error!!!");
    }
  }
);

/**
 * @route GET api/profile
 * @desc Get all profile
 * @access Public
 */

router.get("/", async (req, res) => {
  try {
    let profile = await Profile.find()
      .populate("user", ["name", "avatar"])
      .lean()
      .sort({ createdAt: -1 })
      .exec();
    if (!profile) {
      res.status(404).json({ msg: "No user found!!!" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error!!!");
  }
});

/**
 * @route GET api/profile
 * @desc Get pariticular profile
 * @access Public
 */

router.get("/user/:user_id", async (req, res) => {
  try {
    let userId = req.params.user_id;
    let profile = await Profile.findOne({ user: userId })
      .populate("user", ["name", "avatar"])
      .lean()
      .exec();
    if (!profile) {
      res.status(404).json({ msg: "No user found!!!" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      res.status(404).json({ msg: "No user found!!!" });
    }
    res.status(500).send("Server Error!!!");
  }
});

/**
 * @route GET api/profile
 * @desc remove account
 * @access Private
 */
router.delete("/", auth, async (req, res) => {
  try {
    //TODO- remove posts

    //remove profile
    let profile = await Profile.findOneAndRemove({ user: req.user.id });

    //remove user
    let user = await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: `User Remove with: ${req.user.id}` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error!!!");
  }
});

/**
 * @route put api/profile/experience
 * @desc add account
 * @access Private
 */

router.put(
  "/experience",
  [
    auth,
    [
      body("title", "Title is required").not().isEmpty(),
      body("company", "company is required!").not().isEmpty(),
      body("from", "from date  is required!").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }
      const {
        title,
        company,
        from,
        location,
        to,
        current,
        description,
      } = req.body;

      const newExp = {
        title,
        company,
        from,
        location,
        // to: to ? to : new Date().toISOString(),
        current,
        description,
      };

      let profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error!!!");
    }
  }
);

/**
 * @route put api/profile/experience/exp_id
 * @desc remove exp
 * @access Private
 */

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    let removeIndex = profile.experience
      .map((exp) => exp.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
    console.log(removeIndex);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error!!!");
  }
});

/**
 * @route put api/profile/education
 * @desc add education
 * @access Private
 */

router.put(
  "/education",
  [
    auth,
    [
      body("school", "school is required").not().isEmpty(),
      body("degree", "degree is required!").not().isEmpty(),
      body("fieldofstudy", "fieldofstudy  is required!").not().isEmpty(),
      body("from", "from date  is required!").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      } = req.body;

      const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };

      let profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error!!!");
    }
  }
);

/**
 * @route put api/profile/education/edu_id
 * @desc remove exp
 * @access Private
 */

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    let removeIndex = profile.education
      .map((exp) => exp.id)
      .indexOf(req.params.exp_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
    console.log(removeIndex);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error!!!");
  }
});

/**
 * @route put api/profile/github/:username
 * @desc get user repo
 * @access Public
 */

router.get("/github/:username", async (req, res) => {
  try {
    const gitHubCred = config.get("gitHubCred");
    const URL = `https://api.github.com/users/${req.params.username}/repo?per_page=5&sort=created:asc&client_id=${gitHubCred["client_id"]}&client_secret=${gitHubCred["secret_key"]}`;
    console.log(URL);
    const options = {
      uri: URL,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    //api call for github
    request(options, (err, response, body) => {
      if (err) {
        console.error(err);
      }

      if (response.body.code !== 200) {
        return res.json({ msg: "No Repo found!!!!" });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error!!!");
  }
});
module.exports = router;
