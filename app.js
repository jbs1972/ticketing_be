const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const config = require("./config/env.config");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

const ticketRoutes = require("./routes/Ticket.routes");

const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const app = express();

/*
|--------------------------------------------------------------------------
| Logging Configuration
|--------------------------------------------------------------------------
*/
// Create logs directory if not exists
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
// Create write stream
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, config.logFile),
  {
    flags: "a",
  }
);
// HTTP Request Logger
app.use(
  morgan("combined", {
    stream: accessLogStream,
  })
);
// Console logging in development
if (config.nodeEnv === "dev") {
  app.use(morgan("dev"));
}

/*
|--------------------------------------------------------------------------
| Database Connection
|--------------------------------------------------------------------------
*/
mongoose
  .connect(config.mongodbUri)
  .then(() => {
    console.log("=================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`✅ Database : ${config.dbName}`);
    console.log("=================================");
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);

    process.exit(1);
  });

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/
if (config.helmetEnabled) {
  app.use(helmet());
}

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/
app.use(
  cors({
    origin: config.allowedOrigins,
  })
);

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Ticket Management API Running Successfully",
    environment: config.nodeEnv,
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
app.use(
  `${config.apiPrefix}/tickets`,
  ticketRoutes
);

/*
|--------------------------------------------------------------------------
| Swagger Documentation
|--------------------------------------------------------------------------
*/
app.use(
  "/api-docs",

  swaggerUi.serve,

  swaggerUi.setup(swaggerSpec, {
    explorer: true,

    customSiteTitle: "Ticket API Documentation",

    swaggerOptions: {
      docExpansion: "none",
      persistAuthorization: true,
      displayRequestDuration: true,
    },

    customCss: `
      .swagger-ui .topbar {
        display: none;
      }

      .swagger-ui .info {
        margin-bottom: 30px;
      }
    `,
  })
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route Not Found",
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(config.port, () => {
  console.log("=================================");
  console.log(
    `✅ Server Running On Port ${config.port}`
  );
  console.log(
    `✅ Environment : ${config.nodeEnv}`
  );
  console.log(
    `✅ API URL : http://localhost:${config.port}${config.apiPrefix}/tickets`
  );

  if (config.swaggerEnabled) {
    console.log(
      `✅ Swagger Docs : http://localhost:${config.port}/api-docs`
    );
  }

  console.log("=================================");
});

module.exports = app;
