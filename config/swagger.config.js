const swaggerJsdoc = require("swagger-jsdoc");

const config = require("./env.config");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Ticket Management REST API",
      version: "1.0.0",
      description:
        "Professional REST API for Ticket Management using Express.js and MongoDB with JWT Authentication",

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
      securitySchemes: {
        TokenAuth: {
          type: "apiKey",
          in: "header",
          name: "x-auth-token",
          description: "JWT token for authentication. Send the token in the 'x-auth-token' header. Example: x-auth-token: {token}",
        },
      },

      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            _id: {
              type: "string",
              description: "MongoDB ObjectId",
              example: "689ad54cb72e4c0012d91f11",
            },
            name: {
              type: "string",
              description: "User full name",
              minLength: 5,
              maxLength: 50,
              example: "John Doe",
            },
            email: {
              type: "string",
              description: "User email address",
              format: "email",
              minLength: 5,
              maxLength: 255,
              example: "john@example.com",
            },
            password: {
              type: "string",
              description: "User password (min 6 chars, must contain uppercase, lowercase, number, and special char #$@)",
              minLength: 6,
              maxLength: 20,
              example: "Password123#",
            },
            isAdmin: {
              type: "boolean",
              description: "Admin status",
              default: false,
              example: false,
            },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              example: "Password123#",
            },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Login successful",
            },
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description: "JWT token for authentication",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },

        UserRegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              minLength: 5,
              maxLength: 50,
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              description: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (#, @, or $)",
              minLength: 6,
              maxLength: 20,
              example: "Password123#",
            },
            isAdmin: {
              type: "boolean",
              description: "Admin status (only admins can create users with this flag)",
              default: false,
              example: false,
            },
          },
        },

        UserRegisterResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "User registered successfully",
            },
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "689ad54cb72e4c0012d91f11",
                },
                name: {
                  type: "string",
                  example: "John Doe",
                },
                email: {
                  type: "string",
                  example: "john@example.com",
                },
              },
            },
          },
        },

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

        TicketPatchRequest: {
          type: "object",
          properties: {
            subject: {
              type: "string",
              minLength: 5,
              maxLength: 100,
            },
            description: {
              type: "string",
              minLength: 10,
              maxLength: 1000,
            },
          },
          example: {
            subject: "Updated Subject",
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
        name: "Authentication",
        description: "User authentication and login APIs",
      },
      {
        name: "Users",
        description: "User Management APIs",
      },
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