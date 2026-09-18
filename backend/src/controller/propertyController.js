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
    propertyType: data.propertyType || "house",
    location: data.location || {
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      zipCode: data.zipCode || data.postalCode || "",
      country: data.country || "USA",
    },
    bedrooms: Number(data.bedrooms) || 0,
    bathrooms: Number(data.bathrooms) || 0,
    areaSqFt: Number(data.areaSqFt) || 0,
    yearBuilt: Number(data.yearBuilt) || new Date().getFullYear(),
    images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [],
    featured: Boolean(data.featured),
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    status: (data.status || "available").toLowerCase(),
    agent: data.agent || {
      name: "Marcus Vance",
      email: "marcus.vance@havenestate.com",
      phone: "+1 (310) 555-0192",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Luxury Real Estate",
    },
    createdAt,
    updatedAt,
  };
};

// ========================================
// GET ALL PROPERTIES
// ========================================
const getProperties = async (req, res, next) => {
  try {
    const {
      type,
      listingType,
      propertyType,
      featured,
      city,
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
        (p) => p.location?.city?.toLowerCase()?.trim() === normalizedCity
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
        const addrMatch = p.location?.address?.toLowerCase().includes(q);
        const amenityMatch = p.amenities.some((a) => a.toLowerCase().includes(q));
        return titleMatch || descMatch || cityMatch || addrMatch || amenityMatch;
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
// GET ONE PROPERTY
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
// CREATE PROPERTY
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
      zipCode,
      country,
      bedrooms = 0,
      bathrooms = 0,
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
    const resolvedPropertyType = propertyType || "house";

    const resolvedLocation = location || {
      address: address || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      country: country || "USA",
    };

    const resolvedAgent = agent || {
      name: req.userProfile?.name || "Marcus Vance",
      email: req.userProfile?.email || "marcus.vance@havenestate.com",
      phone: "+1 (310) 555-0192",
      avatar:
        req.userProfile?.photoURL ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Luxury Real Estate",
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
// UPDATE PROPERTY
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

    const updates = { ...req.body };

    // Format numbers if provided
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.bedrooms !== undefined) updates.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms !== undefined) updates.bathrooms = Number(updates.bathrooms);
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
// DELETE PROPERTY
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