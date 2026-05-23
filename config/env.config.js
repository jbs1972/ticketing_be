const dotenv = require("dotenv");
const path = require("path");

/*
|--------------------------------------------------------------------------
| Environment Detection
|--------------------------------------------------------------------------
*/

const environment = process.env.NODE_ENV || "dev";

/*
|--------------------------------------------------------------------------
| Resolve Environment File
|--------------------------------------------------------------------------
*/

const envFile = `.env.${environment}`;

const envPath = path.join(__dirname, `../${envFile}`);

/*
|--------------------------------------------------------------------------
| Load Environment Variables
|--------------------------------------------------------------------------
*/

dotenv.config({
  path: envPath,
});

/*
|--------------------------------------------------------------------------
| Application Configuration
|--------------------------------------------------------------------------
*/

const config = {
  /*
  |--------------------------------------------------------------------------
  | Environment
  |--------------------------------------------------------------------------
  */

  nodeEnv: process.env.NODE_ENV || "dev",

  /*
  |--------------------------------------------------------------------------
  | Server
  |--------------------------------------------------------------------------
  */

  port: process.env.PORT || 3000,

  /*
  |--------------------------------------------------------------------------
  | Database
  |--------------------------------------------------------------------------
  */

  mongodbUri:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/taskflowdb?replicaSet=rs0",

  dbName: process.env.DB_NAME || "taskflowdb",

  /*
  |--------------------------------------------------------------------------
  | API
  |--------------------------------------------------------------------------
  */

  apiPrefix: process.env.API_PREFIX || "/api",

  apiVersion: process.env.API_VERSION || "v1",

  apiTimeout: Number(process.env.API_TIMEOUT) || 30000,

  /*
  |--------------------------------------------------------------------------
  | CORS
  |--------------------------------------------------------------------------
  */

  allowedOrigins: (
    process.env.ALLOWED_ORIGINS ||
    "http://127.0.0.1:5173"
  )
    .split(",")
    .map(origin => origin.trim()),

  /*
  |--------------------------------------------------------------------------
  | Logging
  |--------------------------------------------------------------------------
  */

  logLevel: process.env.LOG_LEVEL || "info",

  logFile: process.env.LOG_FILE || "logs/access.log",

  /*
  |--------------------------------------------------------------------------
  | Security
  |--------------------------------------------------------------------------
  */

  helmetEnabled:
    process.env.HELMET_ENABLED === "true",

  /*
  |--------------------------------------------------------------------------
  | Swagger
  |--------------------------------------------------------------------------
  */
  swaggerEnabled:
    process.env.SWAGGER_ENABLED === "true",

  /*
  |--------------------------------------------------------------------------
  | Swagger Environment URLs
  |--------------------------------------------------------------------------
  */

  swaggerDevUrl:
    process.env.SWAGGER_DEV_URL ||
    "http://localhost:3001/api",

  swaggerUatUrl:
    process.env.SWAGGER_UAT_URL ||
    "https://uat-api.example.com/api",

  swaggerProdUrl:
    process.env.SWAGGER_PROD_URL ||
    "https://api.example.com/api",
};

/*
|--------------------------------------------------------------------------
| Development Console Logs
|--------------------------------------------------------------------------
*/

if (config.nodeEnv !== "prod") {
  console.log("=================================");
  console.log(`✅ Environment Loaded : ${environment}`);
  console.log(`✅ Env File           : ${envFile}`);
  console.log(`✅ Server Port        : ${config.port}`);
  console.log(`✅ Database           : ${config.dbName}`);
  console.log("=================================");
}

module.exports = config;