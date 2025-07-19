const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function to send JWT as cookie
const sendTokenAsCookie = (res, user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.json({
    user: { name: user.name, email: user.email },
  });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswerHash: hashedAnswer,
    });

    return sendTokenAsCookie(res, user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    return sendTokenAsCookie(res, user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Logout (optional)
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ msg: "Logged out" });
});

// ✅ Get Security Question
router.get("/security-question", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user || !user.securityQuestion)
      return res.status(404).json({ msg: "User not found or no security question set" });

    res.json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Reset Password Using Security Question
router.post("/reset-password-with-security", async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.securityAnswerHash)
      return res.status(400).json({ msg: "Invalid request" });

    const isMatch = await bcrypt.compare(securityAnswer, user.securityAnswerHash);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect security answer" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;