const { db } = require("../config/firebase");

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userSnapshot = await db
      .collection("users")
      .doc(req.user.uid)
      .get();

    if (!userSnapshot.exists) {
      return res.status(403).json({
        success: false,
        message: "User profile not found",
      });
    }

    const user = userSnapshot.data();

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Administrator access required",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    req.userProfile = user;

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify administrator privileges",
    });
  }
};

module.exports = {
  requireAdmin,
};