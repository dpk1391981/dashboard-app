const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

//models
const Dashboard = require("../../models/Dashboard");
const User = require("../../models/User");

function convertToSlug(Text) {
  return Text.toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

/**
 * @route GET api/posts
 * @desc submit posts
 * @access Private
 */
router.post("/create", [auth, [body("title", "title is required!!!!").not().isEmpty()]], async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    const { title, color, widgets } = req.body;
    const slug = convertToSlug(title);
    const titleExist = await Dashboard.findOne({ slug, user: req.user.id });
    if (titleExist) {
      return res.status(400).json({ errors: [{ msg: "You have already used the title!" }] });
    }

    const NewDashboard = {
      title: title,
      slug: convertToSlug(title),
      associated_user: [req.user.id],
      root_user: req.user.id,
      color,
      widgets,
      logo: null,
    };

    const DashboardObj = new Dashboard(NewDashboard);
    let saveDashboard = await DashboardObj.save();
    return res.json(saveDashboard);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

/**
 * @route GET api/posts
 * @desc get post by id
 * @access Private
 */

router.get("/:userId", auth, async (req, res) => {
  try {
    let UserDashboards = await Dashboard.find({ root_user: req.user.id }).populate("associated_user", {
      _id: 1,
      fullName: 1,
      email: 1,
      status: 1,
      email_verified: 1,
    });
    if (!UserDashboards) {
      return res.status(400).json({ msg: "No Dashboard found!!!" });
    }

    return res.json(UserDashboards);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Dashboard found!!!" });
    }
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

/**
 * @route GET api/posts
 * @desc get post by id
 * @access Private
 */

router.get("/view/:db_id", auth, async (req, res) => {
  try {
    let getDashboardBySlug = await Dashboard.findOne({ _id: req.params.db_id, root_user: req.user.id }).populate(
      "widgets",
    );
    if (!getDashboardBySlug) {
      return res.status(400).json({ msg: "No Dashboard found!!!" });
    }

    return res.json(getDashboardBySlug);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Dashboard found!!!" });
    }
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

/**
 * @route PUT api/posts/like/post_id
 * @desc like a post
 * @access Private
 */

router.put("/edit/:id", [auth, [body("title", "title is required!!!!").not().isEmpty()]], async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const UpdatedData = req.body;
    const dashboardId = req.params.id;

    const slug = convertToSlug(UpdatedData["title"]);
    UpdatedData["slug"] = slug;

    let data = await Dashboard.findByIdAndUpdate(dashboardId, UpdatedData);
    res.json(data);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

/**
 * @route PUT api/posts/like/post_id
 * @desc like a post
 * @access Private
 */

router.put("/favourite/:dashboardId", [auth], async (req, res) => {
  try {
    const { dashboardId } = req.params || {};
    if (!dashboardId) {
      res.json({ msg: "Required!" });
    }
    let dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
      res.json({ msg: "No Dashboard found!" });
    }
    const favourite = !dashboard["favourite"];

    let data = await Dashboard.findByIdAndUpdate(dashboardId, { favourite });
    res.json(data);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

module.exports = router;
