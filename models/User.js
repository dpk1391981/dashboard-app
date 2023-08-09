const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  mobileNumber: { type: String },
  isAgree: { type: Boolean, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  email_verified: { type: Boolean, default: false },
  auth_type: {
    type: String,
    enum: ["google", "facebook", "twitter", "mannual"],
    default: "mannual",
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
  },
  social_id: { type: String },
  refreshToken: { type: Object },
  auth_source: {
    type: String,
    enum: ["LOGIN", "REGISTER"],
    default: "REGISTER",
  },
});

module.exports = user = mongoose.model("user", UserSchema);
