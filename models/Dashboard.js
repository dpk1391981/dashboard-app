const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DashboardSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
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
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  widgets: [
    {
      type: Schema.Types.ObjectId,
      ref: "widget",
    },
  ],
  logo: { type: String },
  createAt: { type: Date, default: Date.now },
  state: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  favourite: { type: Boolean, default: false },
});

module.exports = Dashboard = mongoose.model("dashboard", DashboardSchema);
