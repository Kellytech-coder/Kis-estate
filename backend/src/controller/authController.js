const { auth, db } = require("../config/firebase");

// ========================================
// ADMIN LOGIN
// ========================================
const login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get Firebase Authentication user
    const userRecord = await auth.getUser(uid);

    // Find Firestore user profile in 'users' collection
    const userRef = db.collection("users").doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(403).json({
        success: false,
        message: "User profile not found. Please ensure your account has administrator privileges.",
      });
    }

    const profile = userSnapshot.data() || {};
    const role = (profile.role || "USER").toUpperCase();

    // Only ADMIN can access admin login
    if (role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges are required.",
      });
    }

    if (profile.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Administrator account is inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: {
        uid: userRecord.uid,
        email: profile.email || userRecord.email || null,
        name: profile.name || userRecord.displayName || "Administrator",
        role: "ADMIN",
        photoURL: profile.photoURL || userRecord.photoURL || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ========================================
// LOGOUT
// ========================================
const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// ========================================
// GET CURRENT USER (/api/auth/me)
// ========================================
const getMe = async (req, res) => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRecord = await auth.getUser(uid);
    const userSnapshot = await db.collection("users").doc(uid).get();

    if (!userSnapshot.exists) {
      return res.status(200).json({
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email || null,
          name: userRecord.displayName || "User",
          role: "USER",
          photoURL: userRecord.photoURL || null,
        },
      });
    }

    const profile = userSnapshot.data() || {};

    return res.status(200).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: profile.email || userRecord.email || null,
        name: profile.name || userRecord.displayName || "User",
        role: (profile.role || "USER").toUpperCase(),
        photoURL: profile.photoURL || userRecord.photoURL || null,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get current user",
    });
  }
};

module.exports = {
  login,
  logout,
  getMe,
};