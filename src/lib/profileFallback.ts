import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, type DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/store/propertyStore";

function restrictedBuyerProfile(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || "User",
    role: "BUYER_RENTER",
  };
}

/** Read the user's own profile, falling back to buyer-only access if Firestore denies it. */
export async function getOwnProfileOrRestrictedUser(firebaseUser: FirebaseUser): Promise<User> {
  let profileSnapshot: DocumentSnapshot | null = null;
  try {
    profileSnapshot = await getDoc(doc(db, "users", firebaseUser.uid));
    if (!profileSnapshot.exists()) {
      profileSnapshot = await getDoc(doc(db, "user", firebaseUser.uid));
    }
  } catch (error) {
    if ((error as { code?: string })?.code === "permission-denied") {
      console.warn("Firestore denied the profile read; continuing with restricted buyer access until the profile service is restored.");
      return restrictedBuyerProfile(firebaseUser);
    }
    throw error;
  }

  if (!profileSnapshot.exists()) {
    console.warn("No Firestore profile was found; continuing with restricted buyer access until the profile service is restored.");
    return restrictedBuyerProfile(firebaseUser);
  }

  const profile = profileSnapshot.data();
  if (profile.isActive === false) {
    throw new Error("Your account is inactive. Contact support for assistance.");
  }

  const role = String(profile.role || "BUYER_RENTER").toUpperCase();
  return {
    uid: firebaseUser.uid,
    email: profile.email || firebaseUser.email || "",
    name: profile.name || firebaseUser.displayName || "User",
    role: role === "ADMIN" ? "ADMIN" : role === "SELLER" || role === "SELLER_PROPERTY_OWNER"
      ? "SELLER_PROPERTY_OWNER"
      : "BUYER_RENTER",
    phone: profile.phone || "",
    agencyName: profile.agencyName || "",
    preferredCity: profile.preferredCity || "",
    photoURL: profile.photoURL || firebaseUser.photoURL || undefined,
  };
}
