const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to generate a token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token will be valid for 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Check if all fields are filled
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  } 

  // 2. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // 3. Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Create the new user in the database
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  // 5. If user was created, send back user data (and a token)
  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

/**
 * @desc    Authenticate (login) a user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find the user by email
  const user = await User.findOne({ email });

  // 2. Check if user exists AND if password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    // 3. Send back user data (and a token)
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // 401 means 'Unauthorized'
    throw new Error("Invalid email or password");
  }
});

module.exports = {
  registerUser,
  loginUser,
};
