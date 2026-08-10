const express = require("express");
const { loginUser, logoutUser } = require("../controllers/Auth.controller");
const auth = require("../middleware/Auth.middleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and login APIs
 */

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Authentication]
 *     description: Authenticate user with email and password. Returns JWT token for subsequent authenticated requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", loginUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Authentication]
 *     security:
 *       - TokenAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized - No token provided
 */
router.post("/logout", auth, logoutUser);

module.exports = router;
