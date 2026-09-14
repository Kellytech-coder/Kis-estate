const { auth, db } = require("../config/firebase");

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const idToken = authorization.substring(7);

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Attach Firebase user information to request
    req.user = decodedToken;

    // Try to load the user's Firestore profile
    try {
      const userSnapshot = await db
        .collection("users")
        .doc(decodedToken.uid)
        .get();

      if (userSnapshot.exists) {
        req.userProfile = userSnapshot.data();
      } else {
        req.userProfile = null;
      }
    } catch (firestoreError) {
      console.error(
        "Could not load user profile:",
        firestoreError.message
      );

      req.userProfile = null;
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = {
  authenticate,
};