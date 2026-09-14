const { db, admin } = require("../config/firebase");

const amenities = db.collection("amenities");

const getAmenities = async (req, res, next) => {
  try {
    const snapshot = await amenities.get();

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

const getAmenity = async (req, res, next) => {
  try {
    const snapshot = await amenities.doc(req.params.id).get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found",
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

const createAmenity = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Amenity name is required",
      });
    }

    const existing = await amenities
      .where("name", "==", name)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({
        success: false,
        message: "Amenity already exists",
      });
    }

    const ref = amenities.doc();

    await ref.set({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      message: "Amenity created successfully",
      data: {
        id: ref.id,
        name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAmenity = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Amenity name is required",
      });
    }

    const ref = amenities.doc(req.params.id);

    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
    }

    await ref.update({
      name,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: "Amenity updated successfully",
      data: {
        id: ref.id,
        name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAmenity = async (req, res, next) => {
  try {
    const ref = amenities.doc(req.params.id);

    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
    }

    await ref.delete();

    res.json({
      success: true,
      message: "Amenity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAmenities,
  getAmenity,
  createAmenity,
  updateAmenity,
  deleteAmenity,
};