const express = require("express");
const auth = require("../middleware/Auth.middleware");
const admin = require("../middleware/Admin.middleware");
const {
  getAllLoginDetails,
  getMyLoginDetails,
} = require("../controllers/LoginDetails.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: LoginDetails
 *   description: Login detail audit APIs
 */

/**
 * @swagger
 * /login-details:
 *   get:
 *     summary: Get all login details (Admin only)
 *     tags: [LoginDetails]
 *     security:
 *       - TokenAuth: []
 *     responses:
 *       200:
 *         description: Login details fetched successfully
 */
router.get("/", auth, admin, getAllLoginDetails);

/**
 * @swagger
 * /login-details/me:
 *   get:
 *     summary: Get current user's login details
 *     tags: [LoginDetails]
 *     security:
 *       - TokenAuth: []
 *     responses:
 *       200:
 *         description: User login details fetched successfully
 */
router.get("/me", auth, getMyLoginDetails);

module.exports = router;
