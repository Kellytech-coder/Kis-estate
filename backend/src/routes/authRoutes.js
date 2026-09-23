const express = require("express");

const router = express.Router();

const {
  login,
  logout,
  getMe,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
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

// ===============================
// UPDATE PROFILE
// ===============================
router.put("/profile", authenticate, updateProfile);

// ===============================
// FAVORITES (SAVED PROPERTIES)
// ===============================
router.get("/favorites", authenticate, getFavorites);
router.post("/favorites/:propertyId", authenticate, addFavorite);
router.delete("/favorites/:propertyId", authenticate, removeFavorite);

module.exports = router;