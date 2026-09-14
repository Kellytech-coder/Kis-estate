const { db, admin } = require("../config/firebase");

const propertiesCollection = db.collection("properties");

const getProperties = async (req, res, next) => {
  try {
    const {
      listingType,
      status,
      propertyType,
      featured,
      locationId,
      city,
    } = req.query;

    let query = propertiesCollection;

    if (listingType) {
      query = query.where("listingType", "==", listingType);
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    if (propertyType) {
      query = query.where("propertyType", "==", propertyType);
    }

    if (featured !== undefined) {
      query = query.where("featured", "==", featured === "true");
    }

    if (locationId) {
      query = query.where("locationId", "==", locationId);
    }

    const snapshot = await query.get();

    let properties = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (city) {
      const normalizedCity = city.toLowerCase();

      properties = properties.filter(
        (property) =>
          property.location?.city?.toLowerCase() === normalizedCity
      );
    }

    properties.sort((a, b) => {
      const aDate = a.createdAt?.toMillis?.() || 0;
      const bDate = b.createdAt?.toMillis?.() || 0;

      return bDate - aDate;
    });

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

const getProperty = async (req, res, next) => {
  try {
    const snapshot = await propertiesCollection.doc(req.params.id).get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
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

const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      price,
      currency = "USD",
      listingType,
      propertyType,
      status = "AVAILABLE",
      bedrooms = null,
      bathrooms = null,
      areaSqFt = null,
      yearBuilt = null,
      featured = false,
      publishedAt = null,
      locationId,
      images = [],
      amenities = [],
    } = req.body;

    if (
      !title ||
      !slug ||
      !description ||
      price === undefined ||
      !listingType ||
      !propertyType ||
      !locationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "title, slug, description, price, listingType, propertyType and locationId are required",
      });
    }

    const existingSlug = await propertiesCollection
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!existingSlug.empty) {
      return res.status(409).json({
        success: false,
        message: "A property with this slug already exists",
      });
    }

    const propertyRef = propertiesCollection.doc();

    const property = {
      title,
      slug,
      description,
      price: Number(price),
      currency,
      listingType,
      propertyType,
      status,
      bedrooms: bedrooms !== null ? Number(bedrooms) : null,
      bathrooms: bathrooms !== null ? Number(bathrooms) : null,
      areaSqFt: areaSqFt !== null ? Number(areaSqFt) : null,
      yearBuilt: yearBuilt !== null ? Number(yearBuilt) : null,
      featured: Boolean(featured),
      publishedAt: publishedAt
        ? new Date(publishedAt)
        : null,
      locationId,
      createdById: req.user.uid,
      images,
      amenities,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await propertyRef.set(property);

    const createdSnapshot = await propertyRef.get();

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: {
        id: createdSnapshot.id,
        ...createdSnapshot.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const propertyRef = propertiesCollection.doc(req.params.id);
    const snapshot = await propertyRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const existingProperty = snapshot.data();

    const isOwner =
      existingProperty.createdById === req.user.uid;

    const isAdmin =
      req.userProfile?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this property",
      });
    }

    const allowedFields = [
      "title",
      "slug",
      "description",
      "price",
      "currency",
      "listingType",
      "propertyType",
      "status",
      "bedrooms",
      "bathrooms",
      "areaSqFt",
      "yearBuilt",
      "featured",
      "publishedAt",
      "locationId",
      "images",
      "amenities",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    updates.updatedAt =
      admin.firestore.FieldValue.serverTimestamp();

    await propertyRef.update(updates);

    const updatedSnapshot = await propertyRef.get();

    res.json({
      success: true,
      message: "Property updated successfully",
      data: {
        id: updatedSnapshot.id,
        ...updatedSnapshot.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const propertyRef = propertiesCollection.doc(req.params.id);
    const snapshot = await propertyRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const property = snapshot.data();

    const isOwner = property.createdById === req.user.uid;
    const isAdmin = req.userProfile?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this property",
      });
    }

    await propertyRef.delete();

    res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
};