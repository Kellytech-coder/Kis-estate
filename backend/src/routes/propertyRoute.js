const express = require("express");

const {
  getProperties,
  getProperty,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controller/propertyController");

const { authenticate } = require("../middleware/authMiddleware");
const { requireSellerOrAdmin } = require("../middleware/sellerMiddleware");

const router = express.Router();

// GET /api/properties (Public)
router.get("/", getProperties);

// GET /api/properties/seller/my-properties (Seller/Admin only)
router.get("/seller/my-properties", authenticate, requireSellerOrAdmin, getMyProperties);

// GET /api/properties/:id (Public)
router.get("/:id", getProperty);

// POST /api/properties (Seller or Admin)
router.post("/", authenticate, requireSellerOrAdmin, createProperty);

// PUT /api/properties/:id (Owner or Admin)
router.put("/:id", authenticate, requireSellerOrAdmin, updateProperty);

// DELETE /api/properties/:id (Owner or Admin)
router.delete("/:id", authenticate, requireSellerOrAdmin, deleteProperty);

module.exports = router;
