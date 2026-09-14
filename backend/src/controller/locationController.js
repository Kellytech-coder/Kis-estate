const { db, admin } = require("../config/firebase");

const locations = db.collection("locations");

const getLocations = async (req, res, next) => {
  try {
    const snapshot = await locations.get();

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

const getLocation = async (req, res, next) => {
  try {
    const snapshot = await locations.doc(req.params.id).get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
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

const createLocation = async (req, res, next) => {
  try {
    const {
      address,
      city,
      state = null,
      postalCode = null,
      country,
      latitude = null,
      longitude = null,
    } = req.body;

    if (!address || !city || !country) {
      return res.status(400).json({
        success: false,
        message: "Address, city and country are required",
      });
    }

    const ref = locations.doc();

    await ref.set({
      address,
      city,
      state,
      postalCode,
      country,
      latitude:
        latitude !== null ? Number(latitude) : null,
      longitude:
        longitude !== null ? Number(longitude) : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const snapshot = await ref.get();

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: {
        id: snapshot.id,
        ...snapshot.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const ref = locations.doc(req.params.id);

    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    await ref.update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await ref.get();

    res.json({
      success: true,
      message: "Location updated successfully",
      data: {
        id: updated.id,
        ...updated.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const ref = locations.doc(req.params.id);

    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    await ref.delete();

    res.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
};