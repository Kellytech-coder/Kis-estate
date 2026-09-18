"use client";

import { useEffect } from "react";
import { usePropertyStore } from "@/store/propertyStore";

export default function AppInitializer() {
  const { initializeAuthListener, fetchProperties } = usePropertyStore();

  useEffect(() => {
    // 1. Listen to Firebase Auth state changes
    const unsubscribe = initializeAuthListener();

    // 2. Fetch properties from real API
    void fetchProperties();

    return () => {
      unsubscribe();
    };
  }, [initializeAuthListener, fetchProperties]);

  return null;
}

