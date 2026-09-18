const express = require("express");

const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controller/propertyController");

const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

// GET /api/properties (Public)
router.get("/", getProperties);

// GET /api/properties/:id (Public)
router.get("/:id", getProperty);

// POST /api/properties (Admin only)
router.post("/", authenticate, requireAdmin, createProperty);

// PUT /api/properties/:id (Admin only)
router.put("/:id", authenticate, requireAdmin, updateProperty);

// DELETE /api/properties/:id (Admin only)
router.delete("/:id", authenticate, requireAdmin, deleteProperty);

module.exports = router;
