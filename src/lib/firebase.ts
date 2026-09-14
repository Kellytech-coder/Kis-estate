import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIMkDjlRfd3FBEIt0UrOJl1cuvWInAhV4",
  authDomain: "property-listing-5df59.firebaseapp.com",
  projectId: "property-listing-5df59",
  storageBucket: "property-listing-5df59.firebasestorage.app",
  messagingSenderId: "984298922815",
  appId: "1:984298922815:web:7bb2e717e51cf3fa89a98a",
};

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;