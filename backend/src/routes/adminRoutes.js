const express = require("express");
const router = express.Router();

const {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controller/adminController");

const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Admin dashboard statistics
router.get("/stats", getStats);

// Admin user management
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;

