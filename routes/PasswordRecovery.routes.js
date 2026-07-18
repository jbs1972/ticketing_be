const express = require("express");
const router = express.Router();
const passwordRecoveryController = require("../controllers/PasswordRecovery.controller");
const {
  validateSendOtp,
  validateVerifyOtp,
  validateResetPassword,
} = require("../middleware/PasswordRecovery.middleware");

/**
 * @swagger
 * tags:
 *   name: Password Recovery
 *   description: OTP-based password recovery endpoints
 */

/**
 * @swagger
 * /password-recovery/send-otp:
 *   post:
 *     summary: Send password recovery OTP to user email
 *     tags: [Password Recovery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request or user not found
 */
router.post("/send-otp", validateSendOtp, passwordRecoveryController.sendOtp);

/**
 * @swagger
 * /password-recovery/verify-otp:
 *   post:
 *     summary: Verify OTP sent to user email
 *     tags: [Password Recovery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", validateVerifyOtp, passwordRecoveryController.verifyOtp);

/**
 * @swagger
 * /password-recovery/reset-password:
 *   post:
 *     summary: Reset password using a verified OTP
 *     tags: [Password Recovery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123#
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP or password reset failed
 */
router.post("/reset-password", validateResetPassword, passwordRecoveryController.resetPassword);

module.exports = router;
