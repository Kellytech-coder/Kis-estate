const { db, admin } = require("../config/firebase");

const inquiries = db.collection("inquiries");

const getInquiries = async (req, res, next) => {
  try {
    const snapshot = await inquiries
      .orderBy("createdAt", "desc")
      .get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getInquiry = async (req, res, next) => {
  try {
    const snapshot = await inquiries.doc(req.params.id).get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: snapshot.id,
        ...snapshot.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const createInquiry = async (req, res, next) => {
  try {
    const {
      propertyId,
      name,
      email,
      phone = null,
      message,
    } = req.body;

    if (!propertyId || !name || !email || !message) {
      return res.status(400).json({
        success: false,
        message:
          "propertyId, name, email and message are required",
      });
    }

    const propertySnapshot = await db
      .collection("properties")
      .doc(propertyId)
      .get();

    if (!propertySnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const ref = inquiries.doc();

    await ref.set({
      propertyId,
      customerId: req.user?.uid || null,
      name,
      email,
      phone,
      message,
      status: "NEW",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: {
        id: ref.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

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

    const allowedStatuses = [
      "NEW",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ];

    if (
      req.body.status &&
      !allowedStatuses.includes(req.body.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status",
      });
    }

    await ref.update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

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