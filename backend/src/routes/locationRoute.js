const express = require("express");

const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} = require("../controller/locationController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GET /api/locations
// Public
// ========================================
router.get("/", getLocations);

// ========================================
// GET /api/locations/:id
// Public
// ========================================
router.get("/:id", getLocation);

// ========================================
// POST /api/locations
// Authenticated users
// ========================================
router.post(
  "/",
  authenticate,
  createLocation
);

// ========================================
// PUT /api/locations/:id
// Authenticated users
// ========================================
router.put(
  "/:id",
  authenticate,
  updateLocation
);

// ========================================
// DELETE /api/locations/:id
// Authenticated users
// ========================================
router.delete(
  "/:id",
  authenticate,
  deleteLocation
);

module.exports = router;