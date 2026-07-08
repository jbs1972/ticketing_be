const express = require("express");
const { loginUser } = require("../controllers/Auth.controller");
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

module.exports = router;