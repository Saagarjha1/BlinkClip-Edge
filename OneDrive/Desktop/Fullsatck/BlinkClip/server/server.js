// Load environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");
const Clip = require("./models/Clip");
const auth = require("./middleware/auth");

const app = express();

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: [
      "http://localhost:5000"
    ],
    credentials: true
  })
);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow requests with no origin (e.g., mobile apps or curl) or any HTTPS origin
//       if (!origin || origin.startsWith('https://')) {
//         callback(null, true);  // Allow the origin
//       } else {
//         callback(new Error('Not allowed by CORS'));  // Block non-HTTPS
//       }
//     },
//     credentials: true  // Keep this for auth/cookies
//   })
// );

app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ---------- DATABASE ----------
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("\u2705 MongoDB connected"))
  .catch((err) => console.error("\u274C MongoDB error:", err));

// ---------- ROUTES ----------

// Home Page
app.get("/", (req, res) => {
  res.render("index");
});

// Dashboard with Search
app.get("/dashboard", auth, async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const user = await User.findById(req.user.id);
    const query = { user: req.user.id };
    if (searchQuery) {
      query.text = { $regex: searchQuery, $options: "i" };
    }
    const clips = await Clip.find(query).sort({ createdAt: -1 });
    res.render("dashboard", { user, clips, searchQuery });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while loading dashboard");
  }
});

// Signup (HTML)
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send("Registration failed");
  }
});

// Login (HTML)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("Invalid password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send("Login failed");
  }
});

// Save Clip (HTML)
app.post("/save", auth, async (req, res) => {
  const { text } = req.body;
  try {
    const clip = new Clip({ user: req.user.id, text });
    await clip.save();
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send("Error saving clip");
  }
});

// Edit Clip
app.get("/clip/edit/:id", auth, async (req, res) => {
  try {
    const clip = await Clip.findOne({ _id: req.params.id, user: req.user.id });
    if (!clip) return res.status(404).send("Clip not found");
    res.render("edit", { clip });
  } catch (err) {
    res.status(500).send("Error loading edit page");
  }
});

app.post("/clip/edit/:id", auth, async (req, res) => {
  const { text } = req.body;
  try {
    const updated = await Clip.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { text },
      { new: true }
    );
    if (!updated) return res.status(404).send("Clip not found");
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send("Error updating clip");
  }
});

// View Full Clip
app.get("/clip/view/:id", auth, async (req, res) => {
  try {
    const clip = await Clip.findOne({ _id: req.params.id, user: req.user.id });
    if (!clip) return res.status(404).send("Clip not found");
    res.render("viewClip", { clip });
  } catch (err) {
    res.status(500).send("Error loading clip");
  }
});

// Delete Clip (HTML)
app.post("/clip/delete/:id", auth, async (req, res) => {
  try {
    const clip = await Clip.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!clip) return res.status(404).send("Clip not found");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting clip");
  }
});

// All Clips (HTML)
app.get("/clips", auth, async (req, res) => {
  try {
    const clips = await Clip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.render("clips", { clips });
  } catch (err) {
    res.status(500).send("Failed to fetch clips");
  }
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// ---------- API ROUTES FOR EXTENSION ----------

// Token-based auth for API
const apiAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: "Invalid token" });
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token expired or invalid" });
  }
};

// API Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.json({ token });
  } catch (err) {
    console.error("API Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Login for me (user info)
app.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// API Signup
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.json({ token });
  } catch (err) {
    console.error("API Signup Error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Save Clip (API)
app.post("/api/clip", apiAuth, async (req, res) => {
  const { text, url, title } = req.body;
  try {
    const clip = new Clip({
      user: req.user._id,
      text,
      sourceUrl: url,
      pageTitle: title,
    });
    await clip.save();
    res.json({ success: true, message: "Clip saved" });
  } catch (err) {
    console.error("Clip save error:", err);
    res.status(500).json({ error: "Error saving clip" });
  }
});

// Fetch Clips (API)
app.get("/api/clips", apiAuth, async (req, res) => {
  try {
    const clips = await Clip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(clips);
  } catch (err) {
    console.error("Fetch clips error:", err);
    res.status(500).json({ error: "Failed to fetch clips" });
  }
});

// Delete Clip (API)
app.delete("/api/clip/:id", apiAuth, async (req, res) => {
  try {
    const clip = await Clip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!clip) return res.status(404).json({ error: "Clip not found" });
    res.json({ success: true, message: "Clip deleted" });
  } catch (err) {
    console.error("Delete clip error:", err);
    res.status(500).json({ error: "Error deleting clip" });
  }
});

// ---------- SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\uD83D\uDE80 Server started on http://localhost:${PORT}`);
});
