const mongoose = require("mongoose");

const ClipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  sourceUrl: { type: String },        // URL of the clipped page
  pageTitle: { type: String },        // Title of the page
  pageDescription: { type: String },  // Meta description
  pageImage: { type: String },        // Image URL (og:image or similar)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Clip", ClipSchema);
