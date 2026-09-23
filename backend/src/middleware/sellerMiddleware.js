const { db } = require("../config/firebase");

const requireSellerOrAdmin = async (req, res, next) => {
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
    const role = (user.role || "").toUpperCase();

    const isAuthorized =
      role === "SELLER_PROPERTY_OWNER" ||
      role === "SELLER" ||
      role === "ADMIN";

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Seller or Administrator access required. Please upgrade or register as a Property Owner / Seller.",
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
    console.error("Seller/Admin authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify seller privileges",
    });
  }
};

module.exports = {
  requireSellerOrAdmin,
};

