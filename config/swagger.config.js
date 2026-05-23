const swaggerJsdoc = require("swagger-jsdoc");

const config = require("./env.config");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Ticket Management REST API",
      version: "1.0.0",
      description:
        "Professional REST API for Ticket Management using Express.js and MongoDB",

      contact: {
        name: "API Support",
        email: "support@example.com",
      },

      license: {
        name: "MIT",
      },
    },

    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Development Server",
      },

      {
        url: "https://uat.example.com/api",
        description: "UAT Server",
      },

      {
        url: "https://api.example.com/api",
        description: "Production Server",
      },
    ],

    components: {
      schemas: {
        Ticket: {
          type: "object",

          required: ["subject", "description"],

          properties: {
            _id: {
              type: "string",
              description: "MongoDB ObjectId",
              example: "689ad54cb72e4c0012d91f11",
            },

            subject: {
              type: "string",
              description: "Ticket subject",

              minLength: 5,
              maxLength: 100,

              example: "Unable to login",
            },

            description: {
              type: "string",
              description: "Detailed ticket description",

              minLength: 10,
              maxLength: 1000,

              example:
                "User is unable to login using valid username and password.",
            },

            createdAt: {
              type: "string",
              format: "date-time",
              description: "Ticket creation timestamp",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Ticket last update timestamp",
            },
          },
        },

        TicketCreateRequest: {
          type: "object",

          required: ["subject", "description"],

          properties: {
            subject: {
              type: "string",

              minLength: 5,
              maxLength: 100,

              example: "Server not responding",
            },

            description: {
              type: "string",

              minLength: 10,
              maxLength: 1000,

              example:
                "The production server is not responding since morning.",
            },
          },
        },

        TicketUpdateRequest: {
          type: "object",

          properties: {
            subject: {
              type: "string",

              minLength: 5,
              maxLength: 100,

              example: "Updated ticket subject",
            },

            description: {
              type: "string",

              minLength: 10,
              maxLength: 1000,

              example: "Updated detailed ticket description.",
            },
          },
        },

        SuccessResponse: {
          type: "object",

          properties: {
            status: {
              type: "string",
              example: "success",
            },

            message: {
              type: "string",
              example: "Operation successful",
            },

            data: {
              type: "object",
            },
          },
        },

        ErrorResponse: {
          type: "object",

          properties: {
            status: {
              type: "string",
              example: "error",
            },

            message: {
              type: "string",
              example: "Something went wrong",
            },

            data: {
              type: "object",
              nullable: true,
            },
          },
        },

        ValidationErrorResponse: {
          type: "object",

          properties: {
            status: {
              type: "string",
              example: "error",
            },

            message: {
              type: "string",
              example: "Validation failed",
            },

            errors: {
              type: "array",

              items: {
                type: "string",
              },

              example: [
                "Subject is required",
                "Description must be at least 10 characters long",
              ],
            },
          },
        },
      },
    },

    tags: [
      {
        name: "Tickets",
        description: "Ticket Management APIs",
      },
    ],
  },

  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;