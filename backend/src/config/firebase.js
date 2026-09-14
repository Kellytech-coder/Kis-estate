const admin = require("firebase-admin");

const serviceAccount = require("../../firebase-service-account.json");

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!storageBucket) {
  throw new Error("FIREBASE_STORAGE_BUCKET is missing");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

console.log("Firebase Admin connected successfully");

module.exports = {
  admin,
  db,
  auth,
  bucket,
};