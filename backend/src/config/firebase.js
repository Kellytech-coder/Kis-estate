const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let credential;

// 1. Check if local service account JSON file exists
const localServiceAccountPath = path.resolve(__dirname, "../../firebase-service-account.json");
if (fs.existsSync(localServiceAccountPath)) {
  try {
    const fileData = JSON.parse(fs.readFileSync(localServiceAccountPath, "utf8"));
    credential = admin.credential.cert(fileData);
  } catch (err) {
    console.warn("Could not load local service account file, checking env vars:", err.message);
  }
}

// 2. Check full JSON env variable
if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(parsed);
  } catch (err) {
    console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT env var:", err.message);
  }
}

// 3. Check individual env variables
if (
  !credential &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    });
  } catch (err) {
    console.warn("Could not initialize from individual env vars:", err.message);
  }
}

if (!credential) {
  throw new Error(
    "Firebase Admin credentials missing. Provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables, or a valid firebase-service-account.json."
  );
}

const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  `${process.env.FIREBASE_PROJECT_ID || "property-listing-5df59"}.firebasestorage.app`;

if (!admin.apps.length) {
  admin.initializeApp({
    credential,
    storageBucket,
  });
}

const db = admin.firestore();
const auth = admin.auth();
let bucket = null;
try {
  bucket = admin.storage().bucket();
} catch (e) {
  console.warn("Storage bucket not initialized:", e.message);
}

console.log("Firebase Admin connected successfully");

module.exports = {
  admin,
  db,
  auth,
  bucket,
};