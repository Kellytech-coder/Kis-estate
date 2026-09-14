const express = require("express");

const {
  getAmenities,
  getAmenity,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} = require("../controller/amenityController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GET /api/amenities
// Public
// ========================================
router.get("/", getAmenities);

// ========================================
// GET /api/amenities/:id
// Public
// ========================================
router.get("/:id", getAmenity);

// ========================================
// POST /api/amenities
// Authenticated users
// ========================================
router.post(
  "/",
  authenticate,
  createAmenity
);

// ========================================
// PUT /api/amenities/:id
// Authenticated users
// ========================================
router.put(
  "/:id",
  authenticate,
  updateAmenity
);

// ========================================
// DELETE /api/amenities/:id
// Authenticated users
// ========================================
router.delete(
  "/:id",
  authenticate,
  deleteAmenity
);

module.exports = router;