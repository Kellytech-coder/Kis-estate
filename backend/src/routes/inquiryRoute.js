const express = require("express");

const {
  getInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  deleteInquiry,
} = require("../controller/inquiryController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/inquiries (Authenticated users / Admins)
router.get("/", authenticate, getInquiries);

// GET /api/inquiries/:id (Authenticated users / Admins)
router.get("/:id", authenticate, getInquiry);

// POST /api/inquiries (Public or Authenticated)
router.post("/", createInquiry);

// PUT /api/inquiries/:id (Authenticated)
router.put("/:id", authenticate, updateInquiry);

// DELETE /api/inquiries/:id (Authenticated)
router.delete("/:id", authenticate, deleteInquiry);

module.exports = router;