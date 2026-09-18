import { auth } from "./firebase";
import { Property, Inquiry, User, FilterState } from "@/store/propertyStore";

/**
 * Production API Base URL
 * Defaults to http://localhost:4000 in development,
 * and uses NEXT_PUBLIC_API_URL when deployed to Vercel/Production.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

/**
 * Get current user's Firebase ID token
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch (error) {
    console.error("Failed to retrieve Firebase ID token:", error);
    return null;
  }
}

/**
 * Generic API request wrapper with auth header injection
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Attach token if user is signed in and Authorization is not explicitly set
  if (!headers["Authorization"]) {
    const token = await getFirebaseIdToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: Record<string, unknown> = {};
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        data = (await response.json()) as Record<string, unknown>;
      } catch {
        data = {};
      }
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data?.message === "string" ? data.message : null) ||
        (typeof (data?.error as { message?: string })?.message === "string"
          ? (data.error as { message: string }).message
          : null) ||
        `Request failed with status ${response.status} (${response.statusText})`;
      const error = new Error(errorMessage) as Error & { status?: number; data?: unknown };
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
      const networkError = new Error(
        `Unable to reach API server at ${API_BASE_URL}. Please check your connection.`
      ) as Error & { status?: number };
      networkError.status = 0;
      throw networkError;
    }
    throw err;
  }
}

/**
 * Properties API Endpoints
 */
export const propertiesApi = {
  async getAll(params?: Partial<FilterState>): Promise<{ success: boolean; data: Property[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.search) searchParams.append("search", params.search);
      if (params.type && params.type !== "all") searchParams.append("type", params.type);
      if (params.propertyType && params.propertyType !== "all") searchParams.append("propertyType", params.propertyType);
      if (params.city && params.city !== "all") searchParams.append("city", params.city);
      if (params.minPrice !== null && params.minPrice !== undefined) searchParams.append("minPrice", String(params.minPrice));
      if (params.maxPrice !== null && params.maxPrice !== undefined) searchParams.append("maxPrice", String(params.maxPrice));
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiRequest<{ success: boolean; data: Property[]; count: number }>(`/api/properties${query}`);
  },

  async getById(id: string): Promise<{ success: boolean; data: Property }> {
    return apiRequest<{ success: boolean; data: Property }>(`/api/properties/${id}`);
  },

  async create(propertyData: Partial<Property>): Promise<{ success: boolean; data: Property; message: string }> {
    return apiRequest<{ success: boolean; data: Property; message: string }>("/api/properties", {
      method: "POST",
      body: JSON.stringify(propertyData),
    });
  },

  async update(id: string, propertyData: Partial<Property>): Promise<{ success: boolean; data: Property; message: string }> {
    return apiRequest<{ success: boolean; data: Property; message: string }>(`/api/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(propertyData),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/api/properties/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Inquiries API Endpoints
 */
export const inquiriesApi = {
  async getAll(): Promise<{ success: boolean; data: Inquiry[]; count: number }> {
    return apiRequest<{ success: boolean; data: Inquiry[]; count: number }>("/api/inquiries");
  },

  async create(inquiryData: Omit<Inquiry, "id" | "createdAt" | "status">): Promise<{ success: boolean; data: Inquiry; message: string }> {
    return apiRequest<{ success: boolean; data: Inquiry; message: string }>("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(inquiryData),
    });
  },

  async updateStatus(id: string, status: Inquiry["status"]): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/api/inquiries/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/api/inquiries/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Authentication API Endpoints
 */
export const authApi = {
  async loginAdmin(idToken: string): Promise<{ success: boolean; user: User; message: string }> {
    return apiRequest<{ success: boolean; user: User; message: string }>("/api/auth/login", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ idToken }),
    });
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return apiRequest<{ success: boolean; user: User }>("/api/auth/me");
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>("/api/auth/logout", {
      method: "POST",
    });
  },
};

