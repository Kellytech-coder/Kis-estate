const { db, auth, admin } = require("../config/firebase");

// ========================================
// GET ADMIN LIVE STATISTICS
// ========================================
const getStats = async (req, res, next) => {
  try {
    // 1. Fetch properties
    const propertiesSnapshot = await db.collection("properties").get();
    const properties = propertiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalProperties = properties.length;
    const activeListings = properties.filter(
      (p) => (p.status || "available").toLowerCase() === "available"
    ).length;
    const pendingListings = properties.filter(
      (p) => (p.status || "").toLowerCase() === "pending"
    ).length;
    const soldListings = properties.filter(
      (p) => (p.status || "").toLowerCase() === "sold"
    ).length;
    const rentedListings = properties.filter(
      (p) => (p.status || "").toLowerCase() === "rented"
    ).length;

    const buyProperties = properties.filter(
      (p) => (p.type || p.listingType || "buy").toLowerCase() === "buy"
    );
    const rentProperties = properties.filter(
      (p) => (p.type || p.listingType || "").toLowerCase() === "rent"
    );

    const totalValueBuy = buyProperties.reduce(
      (sum, p) => sum + (Number(p.price) || 0),
      0
    );
    const totalValueRent = rentProperties.reduce(
      (sum, p) => sum + (Number(p.price) || 0),
      0
    );

    // 2. Fetch users
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    const totalUsers = users.length;
    const totalSellers = users.filter((u) => {
      const role = (u.role || "").toUpperCase();
      return role === "SELLER_PROPERTY_OWNER" || role === "SELLER";
    }).length;
    const totalBuyers = users.filter((u) => {
      const role = (u.role || "").toUpperCase();
      return role === "BUYER_RENTER" || role === "USER" || !u.role;
    }).length;
    const totalAdmins = users.filter(
      (u) => (u.role || "").toUpperCase() === "ADMIN"
    ).length;

    // 3. Fetch inquiries
    const inquiriesSnapshot = await db.collection("inquiries").get();
    const inquiries = inquiriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalInquiries = inquiries.length;
    const pendingInquiries = inquiries.filter(
      (i) => (i.status || "pending").toLowerCase() === "pending"
    ).length;
    const completedInquiries = inquiries.filter(
      (i) => (i.status || "").toLowerCase() === "completed"
    ).length;

    // 4. Fetch contact messages count
    let totalContactMessages = 0;
    try {
      const contactSnapshot = await db.collection("contact_messages").get();
      totalContactMessages = contactSnapshot.size;
    } catch {
      totalContactMessages = 0;
    }

    // 5. Recent items (sorted newest first)
    const recentProperties = [...properties]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title || "Untitled Property",
        price: p.price || 0,
        type: p.type || p.listingType || "buy",
        city: p.location?.city || p.city || "Lagos",
        status: p.status || "available",
        images: p.images || [],
        createdAt: p.createdAt?.toDate?.()?.toISOString?.() || p.createdAt || new Date().toISOString(),
      }));

    const recentInquiries = [...inquiries]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        propertyTitle: i.propertyTitle || "Property Inquiry",
        userName: i.userName || i.name || "Client",
        userEmail: i.userEmail || i.email || "",
        message: i.message || "",
        status: i.status || "pending",
        createdAt: i.createdAt?.toDate?.()?.toISOString?.() || i.createdAt || new Date().toISOString(),
      }));

    const recentUsers = [...users]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((u) => ({
        uid: u.uid,
        name: u.name || "User",
        email: u.email || "",
        role: (u.role || "BUYER_RENTER").toUpperCase(),
        phone: u.phone || "",
        agencyName: u.agencyName || "",
        createdAt: u.createdAt?.toDate?.()?.toISOString?.() || u.createdAt || new Date().toISOString(),
      }));

    return res.status(200).json({
      success: true,
      data: {
        totalProperties,
        activeListings,
        pendingListings,
        soldListings,
        rentedListings,
        buyListings: buyProperties.length,
        rentListings: rentProperties.length,
        totalValueBuy,
        totalValueRent,
        totalUsers,
        totalSellers,
        totalBuyers,
        totalAdmins,
        totalInquiries,
        pendingInquiries,
        completedInquiries,
        totalContactMessages,
        recentProperties,
        recentInquiries,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET ALL USERS (Admin Only)
// ========================================
const getAllUsers = async (req, res, next) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt =
        data.createdAt?.toDate?.()?.toISOString?.() ||
        data.createdAt ||
        new Date().toISOString();
      const updatedAt =
        data.updatedAt?.toDate?.()?.toISOString?.() ||
        data.updatedAt ||
        null;

      return {
        uid: doc.id,
        name: data.name || "User",
        email: data.email || "",
        role: (data.role || "BUYER_RENTER").toUpperCase(),
        phone: data.phone || "",
        agencyName: data.agencyName || "",
        preferredCity: data.preferredCity || "",
        isActive: data.isActive !== false,
        createdAt,
        updatedAt,
      };
    });

    users.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// UPDATE USER (Admin Only)
// ========================================
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, role, name, phone, agencyName } = req.body;

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const updates = {};
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (role !== undefined) {
      const validRoles = ["BUYER_RENTER", "SELLER_PROPERTY_OWNER", "ADMIN"];
      if (validRoles.includes(role.toUpperCase())) {
        updates.role = role.toUpperCase();
      }
    }
    if (name !== undefined) updates.name = String(name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (agencyName !== undefined) updates.agencyName = String(agencyName).trim();

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await userRef.update(updates);

    const updated = await userRef.get();
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        uid: id,
        ...updated.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// DELETE USER (Admin Only)
// ========================================
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting own account
    if (req.user?.uid === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own administrator account",
      });
    }

    // Delete from Firestore
    await db.collection("users").doc(id).delete();

    // Delete from Firebase Auth if possible
    try {
      await auth.deleteUser(id);
    } catch (authErr) {
      console.warn(`Could not delete user ${id} from Firebase Auth:`, authErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
};

