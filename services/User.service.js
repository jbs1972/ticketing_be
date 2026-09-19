const { User } = require("../models/User.model");
const { Company } = require("../models/Company.model");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const CounterModel = require("../models/Counter.model");
const loginDetailsService = require("./LoginDetails.service");
const { emitForceLogout } = require("../utils/socket");
const { toTitleCase } = require("../utils/textNormalizer");

const SALT_ROUNDS = 12;

// Enforces: cannot alter self, cannot alter a Super Admin, and a Company
// Admin cannot alter users outside their own company
const assertCanAlterTarget = (requester, target) => {
  if (String(target._id) === String(requester._id)) {
    throw new Error("You cannot alter your own account.");
  }
  if (target.role === "superadmin") {
    throw new Error("You cannot alter a Super Admin account.");
  }
  if (
    requester.role === "admin" &&
    String(target.company) !== String(requester.company)
  ) {
    throw new Error("You cannot alter users outside your company.");
  }
};

// Company-scoped sequential user codes: CompanyID + 3-digit sequence
// (e.g. company 1001's users -> 10011001, 10011002, ...)
const generateUserCode = async (companyObjectId) => {
  const company = await Company.findById(companyObjectId).select("companyId");
  const companyId = company.companyId;
  const counterId = `userCode:${companyId}`;
  const counter = await CounterModel.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true },
  );
  if (counter) {
    return `${companyId}${String(counter.seq).padStart(3, "0")}`;
  }
  const newCounter = await CounterModel.create({ _id: counterId, seq: 1001 });
  return `${companyId}${String(newCounter.seq).padStart(3, "0")}`;
};

exports.registerUser = async (userData, requester) => {
  let user = await User.findOne({ email: userData.email });
  if (user) {
    throw new Error("User already registered.");
  }

  // Sanitize user data (email/password kept exactly as provided, only trimmed)
  const sanitizedUserData = Object.fromEntries(
    Object.entries(userData).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  );

  if (requester.role === "admin") {
    sanitizedUserData.company = requester.company;
  } else if (requester.role === "superadmin") {
    if (!sanitizedUserData.company) {
      throw new Error(
        "Company is required when creating a user as Super Admin.",
      );
    }
  }

  user = new User(
    _.pick(sanitizedUserData, [
      "name",
      "email",
      "password",
      "role",
      "company",
      "projects",
      "isActive",
    ]),
  );

  // Name is stored in Title Case; email and password stay as provided
  user.name = toTitleCase(user.name);

  if (sanitizedUserData.company) {
    user.userCode = await generateUserCode(sanitizedUserData.company);
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  return user;
};

exports.getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

exports.getAllUsers = async (requester, companyId) => {
  const filter = {};
  if (requester.role === "admin") {
    filter.company = requester.company;
  } else if (requester.role === "superadmin" && companyId) {
    filter.company = companyId;
  }
  return await User.find(filter)
    .select(
      "name email role isActive registrationDate company projects userCode",
    )
    .sort({ registrationDate: 1 });
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
  user.name = toTitleCase(name);
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

exports.getMentionableUsers = async () => {
  return await User.find({ isActive: true }).select("_id name");
};

exports.changeOwnPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect.");
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  return user;
};
