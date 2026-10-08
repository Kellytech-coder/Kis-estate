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

    // Find Firestore user profile in 'users' collection (with fallback to 'user')
    let userRef = db.collection("users").doc(uid);
    let userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      const legacyRef = db.collection("user").doc(uid);
      const legacySnapshot = await legacyRef.get();
      if (legacySnapshot.exists) {
        userRef = legacyRef;
        userSnapshot = legacySnapshot;
      }
    }

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
    let userSnapshot = await db.collection("users").doc(uid).get();

    if (!userSnapshot.exists) {
      userSnapshot = await db.collection("user").doc(uid).get();
    }

    if (!userSnapshot.exists) {
      // Auto-create base profile in Firestore to ensure consistency across web and mobile
      const defaultProfile = {
        uid: userRecord.uid,
        email: userRecord.email || null,
        name: userRecord.displayName || "User",
        role: "BUYER_RENTER",
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection("users").doc(uid).set(defaultProfile, { merge: true });

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
// REGISTER / CREATE USER PROFILE (/api/auth/register-profile)
// ========================================
const registerProfile = async (req, res) => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name, phone, agencyName, preferredCity, role } = req.body;
    const email = req.user.email || req.body.email || null;

    // Restrict role selection for security: client cannot register as ADMIN
    const allowedRole = role === "SELLER_PROPERTY_OWNER" ? "SELLER_PROPERTY_OWNER" : "BUYER_RENTER";
    const cleanName = name ? String(name).trim() : (req.user.name || "User");
    const cleanPhone = phone ? String(phone).trim() : null;
    const cleanAgency = allowedRole === "SELLER_PROPERTY_OWNER"
      ? (agencyName ? String(agencyName).trim() : "Independent Owner")
      : null;
    const cleanCity = preferredCity ? String(preferredCity).trim() : "";

    const userRef = db.collection("users").doc(uid);
    const existingDoc = await userRef.get();

    const userProfile = {
      uid,
      name: cleanName,
      email: email ? String(email).trim().toLowerCase() : null,
      phone: cleanPhone,
      agencyName: cleanAgency,
      preferredCity: cleanCity,
      role: allowedRole,
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!existingDoc.exists) {
      userProfile.createdAt = admin.firestore.FieldValue.serverTimestamp();
      await userRef.set(userProfile);
    } else {
      const existingData = existingDoc.data() || {};
      // Never downgrade an existing ADMIN role
      if (existingData.role === "ADMIN") {
        delete userProfile.role;
      }
      await userRef.set(userProfile, { merge: true });
    }

    const finalDoc = await userRef.get();
    const finalData = finalDoc.data() || {};

    return res.status(200).json({
      success: true,
      message: "User profile created successfully",
      user: {
        uid,
        email: finalData.email || userProfile.email,
        name: finalData.name || userProfile.name,
        role: finalData.role || allowedRole,
        phone: finalData.phone || "",
        agencyName: finalData.agencyName || "",
        preferredCity: finalData.preferredCity || "",
      },
    });
  } catch (error) {
    console.error("Register profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
  registerProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
};