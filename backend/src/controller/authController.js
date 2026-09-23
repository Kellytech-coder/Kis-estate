const { auth, db, admin } = require("../config/firebase");

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
          role: "BUYER_RENTER",
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
        role: (profile.role || "BUYER_RENTER").toUpperCase(),
        phone: profile.phone || "",
        agencyName: profile.agencyName || "",
        preferredCity: profile.preferredCity || "",
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

// ========================================
// UPDATE USER PROFILE (/api/auth/profile)
// ========================================
const updateProfile = async (req, res) => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name, phone, agencyName, preferredCity, photoURL } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = String(name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (agencyName !== undefined) updates.agencyName = String(agencyName).trim();
    if (preferredCity !== undefined) updates.preferredCity = String(preferredCity).trim();
    if (photoURL !== undefined) updates.photoURL = String(photoURL).trim();

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const userRef = db.collection("users").doc(uid);
    await userRef.set(updates, { merge: true });

    const updatedDoc = await userRef.get();
    const profile = updatedDoc.data() || {};

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        uid,
        email: profile.email || req.user.email || null,
        name: profile.name || "User",
        role: (profile.role || "BUYER_RENTER").toUpperCase(),
        phone: profile.phone || "",
        agencyName: profile.agencyName || "",
        preferredCity: profile.preferredCity || "",
        photoURL: profile.photoURL || null,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ========================================
// GET USER SAVED FAVORITES
// ========================================
const getFavorites = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const doc = await db.collection("users").doc(uid).get();
    const data = doc.exists ? doc.data() : {};
    const savedProperties = Array.isArray(data.savedProperties) ? data.savedProperties : [];

    return res.status(200).json({
      success: true,
      favorites: savedProperties,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// ADD / TOGGLE FAVORITE
// ========================================
const addFavorite = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    const { propertyId } = req.params;

    if (!uid) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!propertyId) {
      return res.status(400).json({ success: false, message: "Property ID is required" });
    }

    const userRef = db.collection("users").doc(uid);
    await userRef.set(
      {
        savedProperties: admin.firestore.FieldValue.arrayUnion(propertyId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updated = await userRef.get();
    const favorites = updated.data()?.savedProperties || [];

    return res.status(200).json({
      success: true,
      message: "Property added to favorites",
      favorites,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// REMOVE FAVORITE
// ========================================
const removeFavorite = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    const { propertyId } = req.params;

    if (!uid) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userRef = db.collection("users").doc(uid);
    await userRef.update({
      savedProperties: admin.firestore.FieldValue.arrayRemove(propertyId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await userRef.get();
    const favorites = updated.data()?.savedProperties || [];

    return res.status(200).json({
      success: true,
      message: "Property removed from favorites",
      favorites,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
};