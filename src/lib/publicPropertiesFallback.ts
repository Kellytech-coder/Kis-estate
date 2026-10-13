import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FilterState, Property } from "@/store/propertyStore";

const PUBLIC_STATUSES = ["available", "active", "pending", "sold", "rented"];

function asIsoDate(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

function formatProperty(id: string, raw: Record<string, unknown>): Property {
  const rawLocation = (raw.location && typeof raw.location === "object" ? raw.location : {}) as Record<string, unknown>;
  const rawAgent = (raw.agent && typeof raw.agent === "object" ? raw.agent : {}) as Record<string, unknown>;
  const status = String(raw.status || "available").toLowerCase();

  return {
    id,
    title: String(raw.title || ""),
    description: String(raw.description || ""),
    price: Number(raw.price) || 0,
    type: String(raw.type || raw.listingType || "buy").toLowerCase() as Property["type"],
    propertyType: String(raw.propertyType || "duplex").toLowerCase() as Property["propertyType"],
    location: {
      address: String(rawLocation.address || raw.address || ""),
      city: String(rawLocation.city || raw.city || "Lagos"),
      state: String(rawLocation.state || raw.state || "Lagos"),
      lga: String(rawLocation.lga || raw.lga || ""),
      zipCode: String(rawLocation.zipCode || raw.zipCode || raw.postalCode || ""),
      country: String(rawLocation.country || raw.country || "Nigeria"),
    },
    bedrooms: Number(raw.bedrooms) || 0,
    bathrooms: Number(raw.bathrooms) || 0,
    parking: Number(raw.parking) || 0,
    areaSqFt: Number(raw.areaSqFt) || 0,
    yearBuilt: Number(raw.yearBuilt) || new Date().getFullYear(),
    images: Array.isArray(raw.images) ? raw.images.filter((image): image is string => typeof image === "string") : [],
    featured: Boolean(raw.featured),
    amenities: Array.isArray(raw.amenities) ? raw.amenities.filter((amenity): amenity is string => typeof amenity === "string") : [],
    status: status === "active" ? "available" : status as Property["status"],
    agent: {
      name: String(rawAgent.name || raw.sellerName || "KIS-Estate Advisor"),
      email: String(rawAgent.email || raw.sellerEmail || ""),
      phone: String(rawAgent.phone || raw.sellerPhone || ""),
      avatar: typeof rawAgent.avatar === "string" ? rawAgent.avatar : undefined,
      agency: typeof rawAgent.agency === "string" ? rawAgent.agency : undefined,
    },
    createdById: typeof raw.createdById === "string" ? raw.createdById : undefined,
    createdAt: asIsoDate(raw.createdAt),
    updatedAt: asIsoDate(raw.updatedAt),
  };
}

export async function fetchPublicPropertiesFromFirestore(
  filters?: Partial<FilterState>
): Promise<{ success: true; data: Property[]; count: number }> {
  try {
    // The status constraint is required by firestore.rules for a public query.
    const result = await getDocs(
      query(collection(db, "properties"), where("status", "in", PUBLIC_STATUSES))
    );
    let properties = result.docs.map((snapshot) =>
      formatProperty(snapshot.id, snapshot.data() as Record<string, unknown>)
    );

    if (filters?.type && filters.type !== "all") {
      properties = properties.filter((property) => property.type === filters.type);
    }
    if (filters?.propertyType && filters.propertyType !== "all") {
      properties = properties.filter((property) => property.propertyType === filters.propertyType?.toLowerCase());
    }
    if (filters?.city && filters.city !== "all") {
      const city = filters.city.toLowerCase().trim();
      properties = properties.filter((property) =>
        property.location.city.toLowerCase() === city ||
        property.location.state.toLowerCase() === city ||
        property.location.address.toLowerCase().includes(city)
      );
    }
    if (filters?.minPrice != null) properties = properties.filter((property) => property.price >= filters.minPrice!);
    if (filters?.maxPrice != null) properties = properties.filter((property) => property.price <= filters.maxPrice!);
    if (filters?.search) {
      const search = filters.search.toLowerCase().trim();
      properties = properties.filter((property) =>
        `${property.title} ${property.description} ${property.location.city} ${property.location.state} ${property.location.address} ${property.amenities.join(" ")}`
          .toLowerCase().includes(search)
      );
    }

    properties.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return { success: true, data: properties, count: properties.length };
  } catch (error) {
    if ((error as { code?: string })?.code === "permission-denied") {
      throw new Error("Firestore is denying public property reads. Publish this repository's firestore.rules to Firebase project property-listing-5df59.");
    }
    throw error;
  }
}
