const _ = require('lodash');
const { User } = require('../models/User.model');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');

const SALT_ROUNDS = 12;

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
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message, data: null, status: 'error' });

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: 'Invalid email or password.', data: null, status: 'error' });

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.', data: null, status: 'error' });

  // const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
  const token = user.getAuthToken();

  res.json({ message: 'Login successful', data: { token }, status: 'success' });
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
  });

  return schema.validate(req.body);
}

module.exports = router;