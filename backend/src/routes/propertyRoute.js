const express = require("express");

const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controller/propertyController");

const router = express.Router();

// GET /api/properties
// Public - get all properties
router.get("/", getProperties);

// GET /api/properties/:id
// Public - get one property
router.get("/:id", getProperty);

// POST /api/properties
// Authentication/admin middleware should be added here
router.post("/", createProperty);

// PUT /api/properties/:id
// Authentication middleware should be added here
router.put("/:id", updateProperty);

// DELETE /api/properties/:id
// Authentication middleware should be added here
router.delete("/:id", deleteProperty);

module.exports = router;

