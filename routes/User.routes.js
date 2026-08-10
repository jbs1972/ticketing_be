const express = require("express");
const auth = require("../middleware/Auth.middleware");
const admin = require("../middleware/Admin.middleware");
const {
  registerUser,
  getCurrentUser,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserName,
  deleteUser,
} = require("../controllers/User.controller");
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
 *     tags: [Users]
 *     security:
 *       - TokenAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", auth, getCurrentUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin/Super Admin only)
 *     tags: [Users]
 *     security:
 *       - TokenAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       403:
 *         description: Forbidden
 */
router.get("/", auth, admin, getAllUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user (Admin/Super Admin). Only Super Admin can set role=admin.
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
 *       400:
 *         description: Validation error or user already exists
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  auth,
  admin,
  (req, res, next) => {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        data: null,
        status: "error",
      });
    }
    next();
  },
  registerUser,
);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Activate/deactivate a user
 *     tags: [Users]
 *     security:
 *       - TokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Validation error, self/Super Admin alteration, or not found
 */
router.patch("/:id/status", auth, admin, updateUserStatus);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update user role between admin and user
 *     tags: [Users]
 *     security:
 *       - TokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Validation error, self/Super Admin alteration, or not found
 */
router.patch("/:id/role", auth, admin, updateUserRole);

/**
 * @swagger
 * /users/{id}/name:
 *   patch:
 *     summary: Update a user's name
 *     tags: [Users]
 *     security:
 *       - TokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User name updated successfully
 *       400:
 *         description: Validation error, self/Super Admin alteration, or not found
 */
router.patch("/:id/name", auth, admin, updateUserName);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - TokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Self/Super Admin alteration attempt, or not found
 */
router.delete("/:id", auth, admin, deleteUser);

module.exports = router;
