const { User } = require("../models/User.model");
const bcrypt = require("bcrypt");
const _ = require("lodash");

const SALT_ROUNDS = 12;

exports.registerUser = async (userData) => {
  // Check if user already exists
  let user = await User.findOne({ email: userData.email });
  if (user) {
    throw new Error("User already registered.");
  }

  // Create new user with selected fields
  user = new User(_.pick(userData, ["name", "email", "password", "isAdmin"]));

  // Hash password
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  user.password = await bcrypt.hash(user.password, salt);

  // Save user to database
  await user.save();

  return user;
};

exports.getUserById = async (id) => {
  return await User.findById(id).select("-password");
};
