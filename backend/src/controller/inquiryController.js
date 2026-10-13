const { db, admin } = require("../config/firebase");

const inquiries = db.collection("inquiries");

const isInquiryOwnerOrAdmin = (data, req) => {
  const isAdmin = (req.userProfile?.role || "").toUpperCase() === "ADMIN";
  const isOwner = data.userId === req.user?.uid ||
    (req.user?.email && String(data.userEmail || data.email || "").toLowerCase() === req.user.email.toLowerCase());
  return isAdmin || isOwner;
};

const formatInquiryDoc = (doc) => {
  const data = doc.data();
  const createdAt =
    data.createdAt?.toDate?.()?.toISOString?.() ||
    data.createdAt ||
    new Date().toISOString();

  return {
    id: doc.id,
    propertyId: data.propertyId || "",
    propertyTitle: data.propertyTitle || "Property Inquiry",
    propertyImage: data.propertyImage || "",
    userName: data.userName || data.name || "Client",
    userEmail: data.userEmail || data.email || "",
    userPhone: data.userPhone || data.phone || "",
    message: data.message || "",
    tourType: data.tourType || "in-person",
    tourDate: data.tourDate || null,
    tourTime: data.tourTime || null,
    status: (data.status || "pending").toLowerCase(),
    userId: data.userId || data.customerId || null,
    createdAt,
  };
};

// ========================================
// GET INQUIRIES
// ========================================
const getInquiries = async (req, res, next) => {
  try {
    const isAdmin = (req.userProfile?.role || "").toUpperCase() === "ADMIN";
    const userId = req.user?.uid;

    const snapshot = await inquiries.get();
    let data = snapshot.docs.map(formatInquiryDoc);

    // If not admin, filter by user's own inquiries or email
    if (!isAdmin && userId) {
      const userEmail = req.user?.email?.toLowerCase();
      data = data.filter(
        (inq) =>
          inq.userId === userId ||
          (userEmail && inq.userEmail.toLowerCase() === userEmail)
      );
    }

    data.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      return dateB - dateA;
    });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET SINGLE INQUIRY
// ========================================
const getInquiry = async (req, res, next) => {
  try {
    const doc = await inquiries.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    if (!isInquiryOwnerOrAdmin(doc.data(), req)) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this inquiry" });
    }

    res.json({
      success: true,
      data: formatInquiryDoc(doc),
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// CREATE INQUIRY (Public or Authenticated)
// ========================================
const createInquiry = async (req, res, next) => {
  try {
    const {
      propertyId,
      propertyTitle,
      propertyImage,
      userName,
      name,
      userEmail,
      email,
      userPhone,
      phone,
      message,
      tourType,
      tourDate,
      tourTime,
    } = req.body;

    const resolvedName = userName || name;
    const resolvedEmail = userEmail || email;
    const resolvedPhone = userPhone || phone || "";

    if (!propertyId || !resolvedName || !resolvedEmail || !message) {
      return res.status(400).json({
        success: false,
        message: "propertyId, name, email and message are required",
      });
    }

    let finalPropertyTitle = propertyTitle || "";
    let finalPropertyImage = propertyImage || "";

    // If title or image not provided, fetch from property
    if (!finalPropertyTitle || !finalPropertyImage) {
      try {
        const propDoc = await db.collection("properties").doc(propertyId).get();
        if (propDoc.exists) {
          const propData = propDoc.data();
          if (!finalPropertyTitle) finalPropertyTitle = propData.title || "";
          if (!finalPropertyImage && Array.isArray(propData.images) && propData.images.length > 0) {
            finalPropertyImage = propData.images[0];
          }
        }
      } catch (e) {
        console.warn("Could not fetch property details for inquiry:", e.message);
      }
    }

    const ref = inquiries.doc();

    const newInquiry = {
      propertyId,
      propertyTitle: finalPropertyTitle,
      propertyImage: finalPropertyImage,
      userName: resolvedName.trim(),
      userEmail: resolvedEmail.trim().toLowerCase(),
      userPhone: resolvedPhone.trim(),
      message: message.trim(),
      tourType: tourType || "in-person",
      tourDate: tourDate || null,
      tourTime: tourTime || null,
      status: "pending",
      userId: req.user?.uid || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await ref.set(newInquiry);

    const snapshot = await ref.get();

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: formatInquiryDoc(snapshot),
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// UPDATE INQUIRY STATUS
// ========================================
const updateInquiry = async (req, res, next) => {
  try {
    const ref = inquiries.doc(req.params.id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    const isAdmin = (req.userProfile?.role || "").toUpperCase() === "ADMIN";
    if (!isInquiryOwnerOrAdmin(snapshot.data(), req)) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this inquiry" });
    }

    const updates = {};
    if (req.body.status && isAdmin) {
      const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
      const status = String(req.body.status).toLowerCase();
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid inquiry status" });
      }
      updates.status = status;
    }
    if (req.body.message !== undefined && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only administrators can edit inquiry messages" });
    }
    if (req.body.message !== undefined) {
      updates.message = String(req.body.message).trim();
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await ref.update(updates);

    const updated = await ref.get();

    res.json({
      success: true,
      message: "Inquiry updated successfully",
      data: formatInquiryDoc(updated),
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// DELETE INQUIRY
// ========================================
const deleteInquiry = async (req, res, next) => {
  try {
    const ref = inquiries.doc(req.params.id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    if (!isInquiryOwnerOrAdmin(snapshot.data(), req)) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this inquiry" });
    }

    await ref.delete();

    res.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  deleteInquiry,
};
