require("dotenv").config(); 
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET_KEY = process.env.SECRET_KEY; // Access SECRET_KEY from .env

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    // Verify the token
    const decodedMessage = jwt.verify(token, SECRET_KEY);

    // Find the user by ID from the decoded token
    const user = await User.findById(decodedMessage._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    }
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  userAuth,
};
