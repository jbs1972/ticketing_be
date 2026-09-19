const express = require("express");
const auth = require("../middleware/Auth.middleware");
const superadmin = require("../middleware/SuperAdmin.middleware");
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompanyName,
  updateCompanyStatus,
} = require("../controllers/Company.controller");
const { validate } = require("../models/Company.model");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company Management APIs (Super Admin only)
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies (Super Admin only)
 *     tags: [Companies]
 *     security:
 *       - TokenAuth: []
 *     responses:
 *       200:
 *         description: Companies fetched successfully
 *       403:
 *         description: Forbidden
 */
router.get("/", auth, superadmin, getAllCompanies);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get a company by id (Super Admin only)
 *     tags: [Companies]
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
 *         description: Company fetched successfully
 *       404:
 *         description: Not found
 */
router.get("/:id", auth, superadmin, getCompanyById);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company (Super Admin only)
 *     tags: [Companies]
 *     security:
 *       - TokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyCreateRequest'
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error or duplicate name
 */
router.post(
  "/",
  auth,
  superadmin,
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
  createCompany,
);

/**
 * @swagger
 * /companies/{id}:
 *   patch:
 *     summary: Update a company's name (Super Admin only)
 *     tags: [Companies]
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
 *             $ref: '#/components/schemas/CompanyCreateRequest'
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       404:
 *         description: Not found
 */
router.patch("/:id", auth, superadmin, updateCompanyName);

/**
 * @swagger
 * /companies/{id}/status:
 *   patch:
 *     summary: Activate/deactivate a company (Super Admin only)
 *     tags: [Companies]
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
 *         description: Company status updated successfully
 *       404:
 *         description: Not found
 */
router.patch("/:id/status", auth, superadmin, updateCompanyStatus);

module.exports = router;
