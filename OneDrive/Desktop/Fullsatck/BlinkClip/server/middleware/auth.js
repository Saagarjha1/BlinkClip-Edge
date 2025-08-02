const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.cookies.token; //  Read from cookie

  if (!token) {
    return res.status(401).send("Access denied. No token.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: user._id }
    next();
  } catch (err) {
    return res.status(400).send("Invalid token.");
  }
};
