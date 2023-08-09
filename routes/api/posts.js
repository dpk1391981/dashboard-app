const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

//models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

/**
 * @route GET api/posts
 * @desc submit posts
 * @access Private
 */
router.post(
  "/",
  [auth, [body("text", "Text is required!!!!").not().isEmpty()]],
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
      }
      const { text } = req.body;
      const user = await User.findById(req.user.id).select("-password");
      const newPost = {
        text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      const posts = new Post(newPost);
      let savePost = await posts.save();
      return res.json(savePost);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server Error!!!");
    }
  }
);

/**
 * @route GET api/posts
 * @desc get all posts
 * @access Private
 */

router.get("/", auth, async (req, res) => {
  try {
    let posts = await Post.find()
      // .populate("user", ["name", "avatar"])
      // .lean()
      .sort({ date: -1 });
    if (!posts || posts.length < 1) {
      return res.status(400).json({ msg: "No Post found!!!" });
    }

    return res.json(posts);
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

router.get("/:post_id", auth, async (req, res) => {
  try {
    let posts = await Post.findById(req.params.post_id);
    if (!posts) {
      return res.status(400).json({ msg: "No Post found!!!" });
    }

    return res.json(posts);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Post found!!!" });
    }
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

/**
 * @route DELETE api/posts
 * @desc delete post by id
 * @access Private
 */

router.delete("/:post_id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.json({ msg: "No post found!!!" });
    }
    if (post.user.toString() != req.user.id) {
      return res.json({ msg: "User not authorized!!" });
    }
    //remove post
    post.remove();
    res.json(post);
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

router.put("/like/:post_id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);

    //check if post is already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "post already liked!!!" });
    }
    post.likes.unshift({
      user: req.user.id,
    });
    post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

/**
 * @route PUT api/posts/dislike/post_id
 * @desc dislike a post
 * @access Private
 */

router.put("/dislike/:post_id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);

    //check if post is already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length <
      1
    ) {
      return res.status(400).json({ msg: "Post not liked yet!!!" });
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error!!!");
  }
});

/**
 * @route PUT api/posts/comment/post_id
 * @desc comment on post
 * @access Private
 */
router.post(
  "/comment/:post_id",
  [auth, [body("text", "Comment is required!!@").not().isEmpty()]],
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
      }
      const { text } = req.body;
      const user = await User.findById(req.user.id).select("-password");
      let post = await Post.findById(req.params.post_id);
      const newComment = {
        text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      post.save();
      return res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error!!!");
    }
  }
);

/**
 * @route DELETE api/posts/comment/post_id/comment_id
 * @desc delete on post
 * @access Private
 */

router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(400).json({ msg: "No post found!!!" });
    }
    const comment = post.comments.find((cm) => cm.id === req.params.comment_id);

    console.log(comment);
    //check if comment not found
    if (!comment) {
      return res.status(400).json({ msg: "No comment found!!!" });
    }

    //check authorized user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized!!!" });
    }
    const removeIndex = post.comments
      .map((cm) => cm.id.toString())
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);

    post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "No comment found!!!" });
    }
    res.status(500).send("Server Error!!!");
  }
});
module.exports = router;
