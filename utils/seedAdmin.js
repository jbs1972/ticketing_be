const bcrypt = require("bcrypt");
const { User } = require("../models/User.model");

const SALT_ROUNDS = 12;

// Runs once at startup: creates the first Admin only if the users collection is empty
const seedAdmin = async () => {
  try {
    const userCount = await User.countDocuments();

    if (userCount > 0) return;

    const name = process.env.SEED_ADMIN_NAME;
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      console.log("⚠️  Skipped admin seeding: SEED_ADMIN_* env vars not set.");
      return;
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("✅ Initial Admin created");
  } catch (err) {
    console.error("❌ Admin seeding failed:", err.message);
  }
};

module.exports = seedAdmin;
