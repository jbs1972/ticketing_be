const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const http = require("http");
const { initSocket } = require("./utils/socket");

const authRoutes = require("./routes/Auth.routes");
const userRoutes = require("./routes/User.routes");
const loginDetailsRoutes = require("./routes/LoginDetails.routes");
const passwordRecoveryRoutes = require("./routes/PasswordRecovery.routes");
const config = require("./config/env.config");
const { failureBasedLimiter } = require("./middleware/RateLimit.middleware");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

const ticketRoutes = require("./routes/Ticket.routes");

const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const ticketService = require("./services/Ticket.service");
const seedAdmin = require("./utils/seedAdmin");

const ticketStatusRoutes = require("./routes/TicketStatus.routes");
const ticketStatusService = require("./services/TicketStatus.service");

const app = express();
const server = http.createServer(app);
initSocket(server);

// Logging Configuration
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
  },
);
// HTTP Request Logger
app.use(
  morgan("combined", {
    stream: accessLogStream,
  }),
);
// Console logging in development
if (config.nodeEnv === "dev") {
  app.use(morgan("dev"));
}

// Database Connection
mongoose
  .connect(config.mongodbUri)
  .then(async () => {
    console.log("=================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`✅ Database : ${config.dbName}`);
    console.log("=================================");

    await seedAdmin();
    await ticketService.ensureTicketCodes();
    await ticketStatusService.ensureDefaultStatuses();
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);

    process.exit(1);
  });

// Security Middleware
if (config.helmetEnabled) {
  app.use(helmet());
}

// CORS Configuration
app.use(
  cors({
    origin: config.allowedOrigins,
  }),
);

// Body Parser
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Apply failure-based rate limiter globally to all API routes
app.use(config.apiPrefix, failureBasedLimiter);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Ticket Management API Running Successfully",
    environment: config.nodeEnv,
  });
});

// API Routes
app.use(`${config.apiPrefix}/tickets`, ticketRoutes);
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/users`, userRoutes);
app.use(`${config.apiPrefix}/login-details`, loginDetailsRoutes);
app.use(`${config.apiPrefix}/password-recovery`, passwordRecoveryRoutes);
app.use(`${config.apiPrefix}/ticket-statuses`, ticketStatusRoutes);

// Swagger Documentation
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
  }),
);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route Not Found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// Start Server

server.listen(config.port, () => {
  console.log("=================================");
  console.log(`✅ Server Running On Port ${config.port}`);
  console.log(`✅ Environment : ${config.nodeEnv}`);
  console.log(
    `✅ API URL : http://localhost:${config.port}${config.apiPrefix}/tickets`,
  );

  if (config.swaggerEnabled) {
    console.log(`✅ Swagger Docs : http://localhost:${config.port}/api-docs`);
  }

  console.log("=================================");
});

module.exports = app;
