const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // For security question-based reset
  securityQuestion: { type: String },
  securityAnswerHash: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
