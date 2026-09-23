const { db, admin } = require("../config/firebase");

const propertiesCollection = db.collection("properties");

// Helper to normalize property document output
const formatPropertyDoc = (doc) => {
  const data = doc.data();
  const id = doc.id;

  const createdAt =
    data.createdAt?.toDate?.()?.toISOString?.() ||
    data.createdAt ||
    new Date().toISOString();

  const updatedAt =
    data.updatedAt?.toDate?.()?.toISOString?.() ||
    data.updatedAt ||
    new Date().toISOString();

  return {
    id,
    title: data.title || "",
    description: data.description || "",
    price: Number(data.price) || 0,
    type: data.type || data.listingType || "buy",
    propertyType: data.propertyType || "duplex",
    location: data.location || {
      address: data.address || "",
      city: data.city || "Lagos",
      state: data.state || "Lagos",
      lga: data.lga || "",
      zipCode: data.zipCode || data.postalCode || "",
      country: data.country || "Nigeria",
    },
    bedrooms: Number(data.bedrooms) || 0,
    bathrooms: Number(data.bathrooms) || 0,
    parking: Number(data.parking) || 0,
    areaSqFt: Number(data.areaSqFt) || 0,
    yearBuilt: Number(data.yearBuilt) || new Date().getFullYear(),
    images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [],
    featured: Boolean(data.featured),
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    status: (data.status || "available").toLowerCase(),
    agent: data.agent || {
      name: data.sellerName || "KIS-Estate Advisor",
      email: data.sellerEmail || "kelechiawa11@gmail.com",
      phone: data.sellerPhone || "+234 800 000 0000",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: data.agencyName || "KIS-Estate Properties Nigeria",
    },
    createdById: data.createdById || null,
    createdAt,
    updatedAt,
  };
};

// ========================================
// GET ALL PROPERTIES (Public)
// ========================================
const getProperties = async (req, res, next) => {
  try {
    const {
      type,
      listingType,
      propertyType,
      featured,
      city,
      state,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const snapshot = await propertiesCollection.get();

    let properties = snapshot.docs.map(formatPropertyDoc);

    const filterType = type || listingType;
    if (filterType && filterType !== "all") {
      properties = properties.filter(
        (p) => p.type.toLowerCase() === filterType.toLowerCase()
      );
    }

    if (propertyType && propertyType !== "all") {
      properties = properties.filter(
        (p) => p.propertyType.toLowerCase() === propertyType.toLowerCase()
      );
    }

    if (featured !== undefined) {
      const isFeatured = featured === "true" || featured === true;
      properties = properties.filter((p) => p.featured === isFeatured);
    }

    if (city && city !== "all") {
      const normalizedCity = city.toLowerCase().trim();
      properties = properties.filter(
        (p) =>
          p.location?.city?.toLowerCase()?.trim() === normalizedCity ||
          p.location?.state?.toLowerCase()?.trim() === normalizedCity ||
          p.location?.address?.toLowerCase()?.includes(normalizedCity)
      );
    }

    if (state && state !== "all") {
      const normalizedState = state.toLowerCase().trim();
      properties = properties.filter(
        (p) => p.location?.state?.toLowerCase()?.trim() === normalizedState
      );
    }

    if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        properties = properties.filter((p) => p.price >= min);
      }
    }

    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        properties = properties.filter((p) => p.price <= max);
      }
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      properties = properties.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const cityMatch = p.location?.city?.toLowerCase().includes(q);
        const stateMatch = p.location?.state?.toLowerCase().includes(q);
        const addrMatch = p.location?.address?.toLowerCase().includes(q);
        const amenityMatch = p.amenities.some((a) => a.toLowerCase().includes(q));
        return titleMatch || descMatch || cityMatch || stateMatch || addrMatch || amenityMatch;
      });
    }

    // Sort newest first
    properties.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      return dateB - dateA;
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

// ========================================
// GET ONE PROPERTY (Public)
// ========================================
const getProperty = async (req, res, next) => {
  try {
    const doc = await propertiesCollection.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      data: formatPropertyDoc(doc),
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET SELLER'S OWN PROPERTIES
// ========================================
const getMyProperties = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const snapshot = await propertiesCollection.where("createdById", "==", userId).get();

    const properties = snapshot.docs.map(formatPropertyDoc);
    properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// CREATE PROPERTY (Seller or Admin)
// ========================================
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      type,
      listingType,
      propertyType,
      location,
      address,
      city,
      state,
      lga,
      zipCode,
      country,
      bedrooms = 0,
      bathrooms = 0,
      parking = 0,
      areaSqFt = 0,
      yearBuilt = new Date().getFullYear(),
      featured = false,
      status = "available",
      images = [],
      amenities = [],
      agent,
    } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title and price are required",
      });
    }

    const resolvedType = type || listingType || "buy";
    const resolvedPropertyType = propertyType || "duplex";

    const resolvedLocation = location || {
      address: address || "",
      city: city || "Lagos",
      state: state || "Lagos",
      lga: lga || "",
      zipCode: zipCode || "",
      country: country || "Nigeria",
    };

    const userProfile = req.userProfile || {};

    const resolvedAgent = agent || {
      name: userProfile.name || req.user.name || "Property Owner",
      email: userProfile.email || req.user.email || "kelechiawa11@gmail.com",
      phone: userProfile.phone || "+234 800 000 0000",
      avatar:
        userProfile.photoURL ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: userProfile.agencyName || "KIS-Estate Nigeria",
    };

    const propertyRef = propertiesCollection.doc();

    const newProperty = {
      title: title.trim(),
      description: description ? description.trim() : "",
      price: Number(price),
      type: resolvedType,
      listingType: resolvedType,
      propertyType: resolvedPropertyType,
      location: resolvedLocation,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      parking: Number(parking) || 0,
      areaSqFt: Number(areaSqFt) || 0,
      yearBuilt: Number(yearBuilt) || new Date().getFullYear(),
      featured: Boolean(featured),
      status: status.toLowerCase(),
      images: Array.isArray(images) && images.length > 0 ? images : [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: Array.isArray(amenities) ? amenities : [],
      agent: resolvedAgent,
      createdById: req.user.uid,
      sellerEmail: userProfile.email || req.user.email || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await propertyRef.set(newProperty);

    const createdSnapshot = await propertyRef.get();

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: formatPropertyDoc(createdSnapshot),
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// UPDATE PROPERTY (Owner or Admin)
// ========================================
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

    const currentData = snapshot.data();
    const isAdmin = (req.userProfile?.role || "").toUpperCase() === "ADMIN";
    const isOwner = currentData.createdById === req.user.uid;

    // Strict Ownership Enforcement: Non-admins can only modify their own listings
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to modify this property listing.",
      });
    }

    const updates = { ...req.body };

    // Format numbers if provided
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.bedrooms !== undefined) updates.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms !== undefined) updates.bathrooms = Number(updates.bathrooms);
    if (updates.parking !== undefined) updates.parking = Number(updates.parking);
    if (updates.areaSqFt !== undefined) updates.areaSqFt = Number(updates.areaSqFt);
    if (updates.yearBuilt !== undefined) updates.yearBuilt = Number(updates.yearBuilt);
    if (updates.featured !== undefined) updates.featured = Boolean(updates.featured);

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await propertyRef.update(updates);

    const updatedSnapshot = await propertyRef.get();

    res.json({
      success: true,
      message: "Property updated successfully",
      data: formatPropertyDoc(updatedSnapshot),
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// DELETE PROPERTY (Owner or Admin)
// ========================================
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

    const currentData = snapshot.data();
    const isAdmin = (req.userProfile?.role || "").toUpperCase() === "ADMIN";
    const isOwner = currentData.createdById === req.user.uid;

    // Strict Ownership Enforcement: Non-admins can only delete their own listings
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this property listing.",
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
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
};