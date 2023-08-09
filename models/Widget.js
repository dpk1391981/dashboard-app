const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WidgetSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  color: {
    primary: {
      type: String,
    },
    secondary: {
      type: String,
    },
  },
  logo: { type: String },
  createAt: { type: Date, default: Date.now },
  state: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

module.exports = Widget = mongoose.model("widget", WidgetSchema);
