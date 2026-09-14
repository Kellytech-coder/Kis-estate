const express = require("express");

const {
  getInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  deleteInquiry,
} = require("../controller/inquiryController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GET /api/inquiries
// Authenticated users
// ========================================
router.get(
  "/",
  authenticate,
  getInquiries
);

// ========================================
// GET /api/inquiries/:id
// Authenticated users
// ========================================
router.get(
  "/:id",
  authenticate,
  getInquiry
);

// ========================================
// POST /api/inquiries
// Public
// ========================================
router.post(
  "/",
  createInquiry
);

// ========================================
// PUT /api/inquiries/:id
// Authenticated users
// ========================================
router.put(
  "/:id",
  authenticate,
  updateInquiry
);

// ========================================
// DELETE /api/inquiries/:id
// Authenticated users
// ========================================
router.delete(
  "/:id",
  authenticate,
  deleteInquiry
);

module.exports = router;