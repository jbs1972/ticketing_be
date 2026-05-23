const mongoose = require("mongoose");

const config = require("./env.config");

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri);

    console.log("=================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`✅ Database : ${config.dbName}`);
    console.log("=================================");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = connectDatabase;