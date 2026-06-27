const express = require("express");
const auth = require("../middleware/Auth.middleware");
const admin = require("../middleware/Admin.middleware");
const { registerUser, getCurrentUser } = require("../controllers/User.controller");
const { validate } = require("../models/User.model");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management APIs
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user details
 *     description: Retrieve the profile information of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - TokenAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User fetched successfully"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - No token provided
 *       400:
 *         description: Invalid token
 */
router.get("/me", auth, getCurrentUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user (Admin only)
 *     description: Register a new user in the system. Only authenticated admin users can create new users.
 *     tags: [Users]
 *     security:
 *       - TokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         headers:
 *           x-auth-token:
 *             description: JWT authentication token for the newly created user
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegisterResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post("/", auth, admin, (req, res, next) => {
  const { error } = validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({
        message: error.details[0].message,
        data: null,
        status: "error",
      });
  }
  next();
}, registerUser);

module.exports = router;