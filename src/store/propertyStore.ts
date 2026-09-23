"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { propertiesApi, inquiriesApi, authApi } from "@/lib/api";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  lga?: string;
  zipCode?: string;
  country: string;
}

export interface PropertyAgent {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  agency?: string;
}

export type PropertyType =
  | "duplex"
  | "flat"
  | "bungalow"
  | "house"
  | "apartment"
  | "land"
  | "office"
  | "shop"
  | "commercial"
  | "terrace"
  | "mansion"
  | "penthouse"
  | "villa"
  | "condo"
  | "townhouse";

export type ListingType = "buy" | "rent";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ListingType;
  propertyType: PropertyType;
  location: PropertyLocation;
  bedrooms: number;
  bathrooms: number;
  parking?: number;
  areaSqFt: number;
  images: string[];
  featured: boolean;
  amenities: string[];
  yearBuilt: number;
  status: "available" | "pending" | "sold" | "rented";
  agent: PropertyAgent;
  createdById?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FilterState {
  search: string;
  type: "all" | ListingType;
  propertyType: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: string;
  bathrooms: string;
  city: string;
  sortBy: "featured" | "price-asc" | "price-desc" | "newest";
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
  tourType?: "in-person" | "video";
  tourDate?: string;
  tourTime?: string;
  createdAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  userId?: string | null;
}

export interface User {
  id?: string;
  uid?: string;
  name: string;
  email: string;
  role: "BUYER_RENTER" | "SELLER_PROPERTY_OWNER" | "ADMIN" | "USER" | "user" | "admin";
  phone?: string;
  agencyName?: string;
  preferredCity?: string;
  avatar?: string;
  photoURL?: string;
}

export interface PropertyStore {
  properties: Property[];
  isLoadingProperties: boolean;
  propertiesError: string | null;

  favorites: string[];

  inquiries: Inquiry[];
  isLoadingInquiries: boolean;
  inquiriesError: string | null;

  currentUser: User | null;
  isLoadingUser: boolean;

  filters: FilterState;

  // Filter actions
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Favorites
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Real Backend Data Actions
  fetchProperties: (params?: Partial<FilterState>) => Promise<Property[]>;
  fetchInquiries: () => Promise<Inquiry[]>;

  addProperty: (property: Partial<Property>) => Promise<Property>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;

  addInquiry: (inquiry: Omit<Inquiry, "id" | "createdAt" | "status">) => Promise<Inquiry>;
  updateInquiryStatus: (id: string, status: Inquiry["status"]) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  // Auth actions
  setCurrentUser: (user: User | null) => void;
  login: (email: string, role?: "user" | "admin" | "USER" | "ADMIN", name?: string) => void;
  logout: () => Promise<void>;
  initializeAuthListener: () => () => void;
}

export const INITIAL_FILTERS: FilterState = {
  search: "",
  type: "all",
  propertyType: "all",
  minPrice: null,
  maxPrice: null,
  bedrooms: "any",
  bathrooms: "any",
  city: "all",
  sortBy: "featured",
};

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      properties: [],
      isLoadingProperties: false,
      propertiesError: null,

      favorites: [],

      inquiries: [],
      isLoadingInquiries: false,
      inquiriesError: null,

      currentUser: null,
      isLoadingUser: true,

      filters: INITIAL_FILTERS,

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () =>
        set(() => ({
          filters: INITIAL_FILTERS,
        })),

      toggleFavorite: (id) => {
        const state = get();
        const exists = state.favorites.includes(id);
        const newFavorites = exists
          ? state.favorites.filter((favId) => favId !== id)
          : [...state.favorites, id];

        set({ favorites: newFavorites });

        // Persist to backend / Firestore if user is authenticated
        if (state.currentUser?.uid) {
          if (exists) {
            authApi.removeFavorite(id).catch((e) => console.warn("Failed to sync removed favorite:", e));
          } else {
            authApi.addFavorite(id).catch((e) => console.warn("Failed to sync added favorite:", e));
          }
        }
      },

      isFavorite: (id) => get().favorites.includes(id),

      fetchProperties: async (params) => {
        set({ isLoadingProperties: true, propertiesError: null });
        try {
          const res = await propertiesApi.getAll(params);
          set({ properties: res.data || [], isLoadingProperties: false });
          return res.data || [];
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : "Failed to load properties";
          console.error("Failed to fetch properties from backend:", error);
          set({
            propertiesError: errMsg,
            isLoadingProperties: false,
          });
          return [];
        }
      },

      fetchInquiries: async () => {
        set({ isLoadingInquiries: true, inquiriesError: null });
        try {
          const res = await inquiriesApi.getAll();
          set({ inquiries: res.data || [], isLoadingInquiries: false });
          return res.data || [];
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : "Failed to load inquiries";
          console.error("Failed to fetch inquiries:", error);
          set({
            inquiriesError: errMsg,
            isLoadingInquiries: false,
          });
          return [];
        }
      },

      addProperty: async (propertyData) => {
        const res = await propertiesApi.create(propertyData);
        if (res.data) {
          set((state) => ({
            properties: [res.data, ...state.properties],
          }));
          return res.data;
        }
        throw new Error(res.message || "Failed to create property");
      },

      updateProperty: async (id, propertyData) => {
        const res = await propertiesApi.update(id, propertyData);
        if (res.data) {
          set((state) => ({
            properties: state.properties.map((p) => (p.id === id ? res.data : p)),
          }));
          return res.data;
        }
        throw new Error(res.message || "Failed to update property");
      },

      deleteProperty: async (id) => {
        await propertiesApi.delete(id);
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
          favorites: state.favorites.filter((favId) => favId !== id),
        }));
      },

      addInquiry: async (inquiryData) => {
        const res = await inquiriesApi.create(inquiryData);
        if (res.data) {
          set((state) => ({
            inquiries: [res.data, ...state.inquiries],
          }));
          return res.data;
        }
        throw new Error(res.message || "Failed to submit inquiry");
      },

      updateInquiryStatus: async (id, status) => {
        await inquiriesApi.updateStatus(id, status);
        set((state) => ({
          inquiries: state.inquiries.map((inq) =>
            inq.id === id ? { ...inq, status } : inq
          ),
        }));
      },

      deleteInquiry: async (id) => {
        await inquiriesApi.delete(id);
        set((state) => ({
          inquiries: state.inquiries.filter((inq) => inq.id !== id),
        }));
      },

      setCurrentUser: (user) => set({ currentUser: user, isLoadingUser: false }),

      login: (email, role = "user", name = "User") =>
        set((state) => ({
          currentUser: {
            id: state.currentUser?.id || `usr-${Date.now()}`,
            uid: state.currentUser?.uid,
            name,
            email,
            role: role.toLowerCase() as "user" | "admin",
            avatar:
              role.toLowerCase() === "admin"
                ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
          },
          isLoadingUser: false,
        })),

      logout: async () => {
        try {
          await signOut(auth);
        } catch (e) {
          console.warn("Firebase signOut failed:", e);
        }
        try {
          await authApi.logout();
        } catch {
          // Ignore logout api network error
        }
        set({ currentUser: null, isLoadingUser: false });
      },

      initializeAuthListener: () => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
          if (!fbUser) {
            set({ currentUser: null, isLoadingUser: false });
            return;
          }

          try {
            // Read user role and details from Firestore users/{uid}
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            let role: User["role"] = "BUYER_RENTER";
            let name = fbUser.displayName || "User";
            let phone = "";
            let agencyName = "";
            let preferredCity = "";

            if (userDoc.exists()) {
              const data = userDoc.data();
              const dbRole = (data.role || "BUYER_RENTER").toUpperCase();
              if (dbRole === "ADMIN") {
                role = "ADMIN";
              } else if (dbRole === "SELLER_PROPERTY_OWNER" || dbRole === "SELLER") {
                role = "SELLER_PROPERTY_OWNER";
              } else {
                role = "BUYER_RENTER";
              }
              if (data.name) name = data.name;
              if (data.phone) phone = data.phone;
              if (data.agencyName) agencyName = data.agencyName;
              if (data.preferredCity) preferredCity = data.preferredCity;

              if (Array.isArray(data.savedProperties)) {
                // Merge remote saved properties with local favorites
                set((s) => ({
                  favorites: Array.from(new Set([...s.favorites, ...data.savedProperties])),
                }));
              }
            }

            set({
              currentUser: {
                id: fbUser.uid,
                uid: fbUser.uid,
                email: fbUser.email || "",
                name,
                role,
                phone,
                agencyName,
                preferredCity,
                avatar:
                  fbUser.photoURL ||
                  (role === "ADMIN"
                    ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"),
              },
              isLoadingUser: false,
            });
          } catch (err) {
            console.error("Error retrieving user profile from Firestore:", err);
            set({
              currentUser: {
                id: fbUser.uid,
                uid: fbUser.uid,
                email: fbUser.email || "",
                name: fbUser.displayName || "User",
                role: "BUYER_RENTER",
              },
              isLoadingUser: false,
            });
          }
        });

        return unsubscribe;
      },
    }),
    {
      name: "haven-estate-storage",
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
