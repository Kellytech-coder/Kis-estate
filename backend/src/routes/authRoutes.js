const express = require("express");

const router = express.Router();

const {
  login,
  logout,
  getMe,
} = require("../controller/authController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

// ===============================
// ADMIN LOGIN
// ===============================
router.post("/login", login);

// ===============================
// LOGOUT
// ===============================
router.post("/logout", authenticate, logout);

// ===============================
// CURRENT AUTHENTICATED USER
// ===============================
router.get("/me", authenticate, getMe);

module.exports = router;