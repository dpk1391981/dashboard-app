const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const Widget = require("../../models/Widget");

router.get("/", auth, async (req, res) => {
  try {
    let widgets = await Widget.find();
    if (!widgets || widgets.length < 1) {
      return res.status(400).json({ msg: "No Post found!!!" });
    }

    return res.json(widgets);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

module.exports = router;
