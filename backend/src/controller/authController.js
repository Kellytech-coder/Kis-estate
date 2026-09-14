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

    console.log("========================================");
    console.log("Firebase UID:", uid);
    console.log("========================================");

    // Get Firebase Authentication user
    const userRecord = await auth.getUser(uid);

    // Find Firestore user profile
    const userRef = db.collection("user").doc(uid);
    const userSnapshot = await userRef.get();

    const allUsers = await db.collection("user").limit(20).get();

console.log("========================================");
console.log("ALL DOCUMENTS IN user COLLECTION");
console.log("Number of documents:", allUsers.size);

allUsers.forEach((doc) => {
  console.log("Document ID:", doc.id);
  console.log("Document data:", doc.data());
});

console.log("========================================");

    console.log("========================================");
    console.log("Firestore lookup");
    console.log("Collection: user");
    console.log("Document ID:", uid);
    console.log("Document path:", userRef.path);
    console.log("Document exists:", userSnapshot.exists);
    console.log("========================================");

    // Profile does not exist
    if (!userSnapshot.exists) {
      console.log(`No Firestore profile found for UID: ${uid}`);

      return res.status(403).json({
        success: false,
        message:
          "User profile not found. Please create the user profile in Firestore.",
      });
    }

    // Read Firestore profile
    const profile = userSnapshot.data() || {};

    console.log("Firestore profile:", profile);

    const role = profile.role || "USER";

    console.log("User role:", role);

    // Only ADMIN can access admin login
    if (role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Successful admin login
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: {
        uid: userRecord.uid,
        email: profile.email || userRecord.email || null,
        name:
          profile.name ||
          userRecord.displayName ||
          "Administrator",
        role: "ADMIN",
        photoURL:
          profile.photoURL ||
          userRecord.photoURL ||
          null,
      },
    });
  } catch (error) {
    console.error("========================================");
    console.error("LOGIN ERROR");
    console.error(error);
    console.error("========================================");

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ========================================
// LOGOUT
// ========================================
const logout = async (req, res) => {
  try {
    res.clearCookie("token");

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
// GET CURRENT USER
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

    const userSnapshot = await db
      .collection("user")
      .doc(uid)
      .get();

    if (!userSnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const profile = userSnapshot.data() || {};

    return res.status(200).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: profile.email || userRecord.email || null,
        name:
          profile.name ||
          userRecord.displayName ||
          "User",
        role: profile.role || "USER",
        photoURL:
          profile.photoURL ||
          userRecord.photoURL ||
          null,
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

// ========================================
// EXPORT CONTROLLERS
// ========================================
module.exports = {
  login,
  logout,
  getMe,
};