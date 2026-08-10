const { User } = require("../models/User.model");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const loginDetailsService = require("./LoginDetails.service");
const { emitForceLogout } = require("../utils/socket");

const SALT_ROUNDS = 12;

// Enforces: cannot alter self, and only Super Admin can alter a Super Admin
const assertCanAlterTarget = (requester, target) => {
  if (String(target._id) === String(requester._id)) {
    throw new Error("You cannot alter your own account.");
  }
};

exports.registerUser = async (userData, requester) => {

  let user = await User.findOne({ email: userData.email });

  if (user) {
    throw new Error("User already registered.");
  }

  // Sanitize user data
  const sanitizedUserData = Object.fromEntries(
    Object.entries(userData).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  );

  // Create user
  user = new User(
    _.pick(sanitizedUserData, [
      "name",
      "email",
      "password",
      "role",
      "isActive",
    ]),
  );

  // Hash password
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  return user;
};

exports.getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

exports.getAllUsers = async () => {
  return await User.find().select("name email role isActive").sort({ _id: 1 });
};

exports.updateUserStatus = async (userId, isActive, requester) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  assertCanAlterTarget(requester, user);

  user.isActive = isActive;

  await user.save();

  if (!isActive) {
    const activeSessions =
      await loginDetailsService.getActiveSessionsByUser(userId);

    await loginDetailsService.deactivatePreviousSessions(
      userId,
      "Admin Logout",
    );

    activeSessions.forEach((session) => emitForceLogout(session.socket_id));
  }

  return user;
};

exports.updateUserRole = async (userId, role, requester) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  assertCanAlterTarget(requester, user);

  user.role = role;
  await user.save();
  const activeSessions =
    await loginDetailsService.getActiveSessionsByUser(userId);
  await loginDetailsService.deactivatePreviousSessions(userId, "Admin Logout");
  activeSessions.forEach((session) =>
    emitForceLogout(session.socket_id, "account:roleChanged"),
  );
  return user;
};

exports.updateUserName = async (userId, name, requester) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  assertCanAlterTarget(requester, user);

  user.name = name;

  await user.save();

  return user;
};

exports.deleteUser = async (userId, requester) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  assertCanAlterTarget(requester, user);

  const activeSessions =
    await loginDetailsService.getActiveSessionsByUser(userId);

  await loginDetailsService.deactivatePreviousSessions(userId, "Admin Logout");

  activeSessions.forEach((session) => emitForceLogout(session.socket_id));

  await user.deleteOne();

  return user;
};
