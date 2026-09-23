require("dotenv").config();

const { db, admin } = require("../src/config/firebase");

const INITIAL_PROPERTIES = [
  {
    title: "The Eko Pearl Waterfront Duplex",
    slug: "the-eko-pearl-waterfront-duplex",
    description:
      "A stunning 5-bedroom contemporary waterfront duplex located in the elite enclave of Banana Island, Ikoyi, Lagos. Features floor-to-ceiling panoramic glass windows overlooking the Lagos lagoon, a private jetty, infinity pool, elevator, automated home system, cinema room, 2-room BQ, and industrial water treatment plant.",
    price: 850000000,
    type: "buy",
    listingType: "buy",
    propertyType: "duplex",
    location: {
      address: "14 Zone E, Banana Island Road",
      city: "Ikoyi",
      state: "Lagos",
      lga: "Eti-Osa",
      zipCode: "101233",
      country: "Nigeria",
    },
    bedrooms: 5,
    bathrooms: 6,
    parking: 4,
    areaSqFt: 6800,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Waterfront & Lagoon View",
      "Private Jetty",
      "Infinity Swimming Pool",
      "Smart Home Automation",
      "Private Cinema",
      "2-Room Boys Quarters",
      "24/7 Security & CCTV",
      "Industrial Water Treatment",
    ],
    yearBuilt: 2024,
    status: "available",
    agent: {
      name: "Chukwudi Okafor",
      email: "c.okafor@kisestate.ng",
      phone: "+234 803 456 7890",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Premier Lagos",
    },
  },
  {
    title: "Maitama Heights Presidential Villa",
    slug: "maitama-heights-presidential-villa",
    description:
      "A grand 6-bedroom fully detached ambassadorial mansion situated on an expansive 1,800 sqm plot in Maitama, Abuja. Boasts Italian marble finishes, bullet-resistant security doors, an Olympic-sized swimming pool, rooftop lounge with Aso Rock views, soundproof diesel generator house, and landscaped gardens.",
    price: 950000000,
    type: "buy",
    listingType: "buy",
    propertyType: "mansion",
    location: {
      address: "22 Rhine Street, Off IBB Way, Maitama",
      city: "Maitama",
      state: "Abuja",
      lga: "Municipal",
      zipCode: "900271",
      country: "Nigeria",
    },
    bedrooms: 6,
    bathrooms: 7,
    parking: 8,
    areaSqFt: 9200,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Aso Rock Panoramic View",
      "Olympic Swimming Pool",
      "Rooftop Terrace Lounge",
      "Italian Marble Finishing",
      "Bullet-Resistant Doors",
      "Soundproof Generator House",
      "Ample 8-Car Parking",
      "Dedicated Security Gatehouse",
    ],
    yearBuilt: 2023,
    status: "available",
    agent: {
      name: "Amina Bello",
      email: "amina.bello@kisestate.ng",
      phone: "+234 802 345 6789",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Capital Properties Abuja",
    },
  },
  {
    title: "Lekki Phase 1 Contemporary 4-Bed Terrace",
    slug: "lekki-phase-1-contemporary-4-bed-terrace",
    description:
      "Modern 4-bedroom serviced terrace duplex with BQ in a secure gated estate in Lekki Phase 1, Lagos. Features a fully fitted kitchen with Bosch appliances, stamped concrete compound, central generator, uniform security, and children playground.",
    price: 180000000,
    type: "buy",
    listingType: "buy",
    propertyType: "terrace",
    location: {
      address: "8 Admiralty Road, Lekki Phase 1",
      city: "Lekki",
      state: "Lagos",
      lga: "Eti-Osa",
      zipCode: "105102",
      country: "Nigeria",
    },
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    areaSqFt: 3800,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "24-Hour Central Power",
      "Fitted Modern Kitchen",
      "Serviced Gated Community",
      "CCTV Surveillance",
      "Children Playground",
      "Ensuite Bedrooms",
    ],
    yearBuilt: 2023,
    status: "available",
    agent: {
      name: "Tunde Bakare",
      email: "tunde.b@kisestate.ng",
      phone: "+234 814 123 4567",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Lekki Corridor",
    },
  },
  {
    title: "Victoria Island Luxury 3-Bed Penthouse",
    slug: "victoria-island-luxury-3-bed-penthouse",
    description:
      "Prestigious 3-bedroom luxury penthouse apartment for rent in Victoria Island, Lagos. High-speed elevators, fully furnished with designer Italian furniture, gym, swimming pool, 24/7 power, and stunning views of the Atlantic Ocean and Eko Atlantic City.",
    price: 35000000,
    type: "rent",
    listingType: "rent",
    propertyType: "penthouse",
    location: {
      address: "12 Ozumba Mbadiwe Avenue, Victoria Island",
      city: "Victoria Island",
      state: "Lagos",
      lga: "Eti-Osa",
      zipCode: "101241",
      country: "Nigeria",
    },
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    areaSqFt: 3200,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Atlantic Ocean Views",
      "24/7 Guaranteed Power Supply",
      "Infinity Sky Pool",
      "State of the Art Gymnasium",
      "Concierge & Valet Service",
      "Fully Furnished Italian Interior",
    ],
    yearBuilt: 2023,
    status: "available",
    agent: {
      name: "Chukwudi Okafor",
      email: "c.okafor@kisestate.ng",
      phone: "+234 803 456 7890",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Premier Lagos",
    },
  },
  {
    title: "Guzape Luxury 5-Bed Fully Detached Duplex",
    slug: "guzape-luxury-5-bed-fully-detached-duplex",
    description:
      "Architectural spectacle in the serene hills of Guzape, Abuja. Features smart lighting, private swimming pool, basement lounge, fitted dry and wet kitchens, solar inverter backup, and panoramic city hill views.",
    price: 450000000,
    type: "buy",
    listingType: "buy",
    propertyType: "duplex",
    location: {
      address: "19 Asokoro Extension, Guzape Hills",
      city: "Guzape",
      state: "Abuja",
      lga: "Municipal",
      zipCode: "900104",
      country: "Nigeria",
    },
    bedrooms: 5,
    bathrooms: 6,
    parking: 5,
    areaSqFt: 5500,
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Hilltop Scenic Views",
      "Private Swimming Pool",
      "Dual (Wet & Dry) Kitchens",
      "Solar Power Backup",
      "Smart Access Doors",
      "Basement Family Lounge",
    ],
    yearBuilt: 2024,
    status: "available",
    agent: {
      name: "Amina Bello",
      email: "amina.bello@kisestate.ng",
      phone: "+234 802 345 6789",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Capital Properties Abuja",
    },
  },
  {
    title: "Ikeja GRA Executive 5-Bed Detached House",
    slug: "ikeja-gra-executive-5-bed-detached-house",
    description:
      "Prime residential mansion located on a peaceful tree-lined crescent in Ikeja GRA, Lagos. Built on 1,000 sqm with lush gardens, massive master suite, 2-bedroom guest chalet, automated gate, and industrial borehole.",
    price: 380000000,
    type: "buy",
    listingType: "buy",
    propertyType: "house",
    location: {
      address: "5 Oba Akinjobi Way, Ikeja GRA",
      city: "Ikeja",
      state: "Lagos",
      lga: "Ikeja",
      zipCode: "100271",
      country: "Nigeria",
    },
    bedrooms: 5,
    bathrooms: 5,
    parking: 6,
    areaSqFt: 6000,
    images: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Lush Landscaped Garden",
      "2-Bed Guest Chalet",
      "Automated Gate Entry",
      "Industrial Borehole",
      "High Perimeter Fence & Electric Wire",
      "Dedicated Study / Home Office",
    ],
    yearBuilt: 2022,
    status: "available",
    agent: {
      name: "Tunde Bakare",
      email: "tunde.b@kisestate.ng",
      phone: "+234 814 123 4567",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Lekki Corridor",
    },
  },
  {
    title: "Old GRA Port Harcourt 5-Bed Luxury Residence",
    slug: "old-gra-port-harcourt-5-bed-luxury-residence",
    description:
      "Magnificent detached residence in Old GRA, Port Harcourt, Rivers State. Features expansive green lawns, swimming pool, soundproof generator house, modern security surveillance, and top-grade marble tiling throughout.",
    price: 270000000,
    type: "buy",
    listingType: "buy",
    propertyType: "house",
    location: {
      address: "18 Forces Avenue, Old GRA",
      city: "Port Harcourt",
      state: "Rivers",
      lga: "Port Harcourt",
      zipCode: "500101",
      country: "Nigeria",
    },
    bedrooms: 5,
    bathrooms: 6,
    parking: 6,
    areaSqFt: 5800,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Spacious Green Lawn",
      "Swimming Pool",
      "24/7 Security Patrol",
      "CCTV System",
      "Dual Inverter Backup",
    ],
    yearBuilt: 2023,
    status: "available",
    agent: {
      name: "Ngozi Briggs",
      email: "ngozi.briggs@kisestate.ng",
      phone: "+234 805 987 6543",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Niger Delta Properties",
    },
  },
  {
    title: "Chevron Lekki Serviced 3-Bed Apartment",
    slug: "chevron-lekki-serviced-3-bed-apartment",
    description:
      "Exquisite 3-bedroom serviced apartment for rent off Chevron Drive, Lekki, Lagos. Clean treated water, 24-hour electricity, elevator, gym, swimming pool, and round-the-clock estate mobile security.",
    price: 6500000,
    type: "rent",
    listingType: "rent",
    propertyType: "flat",
    location: {
      address: "15 Chevron Alternative Route, Lekki",
      city: "Lekki",
      state: "Lagos",
      lga: "Eti-Osa",
      zipCode: "105102",
      country: "Nigeria",
    },
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    areaSqFt: 2100,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee1b2da97ba4?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "24-Hour Electricity",
      "Elevator Access",
      "Communal Swimming Pool",
      "Fitness Center Gym",
      "Treated Water Supply",
    ],
    yearBuilt: 2024,
    status: "available",
    agent: {
      name: "Tunde Bakare",
      email: "tunde.b@kisestate.ng",
      phone: "+234 814 123 4567",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Lekki Corridor",
    },
  },
  {
    title: "Bodija Luxury 4-Bed Detached Bungalow",
    slug: "bodija-luxury-4-bed-detached-bungalow",
    description:
      "Spacious 4-bedroom bungalow situated on a 900 sqm corner plot in Old Bodija, Ibadan, Oyo State. High ceiling designs, expansive compound, solar inverter system, reliable water supply with deep borehole, and security gatehouse.",
    price: 95000000,
    type: "buy",
    listingType: "buy",
    propertyType: "bungalow",
    location: {
      address: "9 Francis Okediji Street, Old Bodija",
      city: "Ibadan",
      state: "Oyo",
      lga: "Ibadan North",
      zipCode: "200212",
      country: "Nigeria",
    },
    bedrooms: 4,
    bathrooms: 4,
    parking: 6,
    areaSqFt: 4200,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Corner Piece Plot",
      "Solar Power Inverter",
      "Deep Industrial Borehole",
      "Security Gatehouse",
      "Spacious Carport",
    ],
    yearBuilt: 2022,
    status: "available",
    agent: {
      name: "Kayode Adeleke",
      email: "kayode.adeleke@kisestate.ng",
      phone: "+234 803 111 2233",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Western Realty",
    },
  },
  {
    title: "Independence Layout 5-Bed Duplex",
    slug: "independence-layout-5-bed-duplex",
    description:
      "Pristine 5-bedroom contemporary duplex in Independence Layout, Enugu. Features an all-ensuite layout, POP ceiling designs with mood lighting, modern fitted kitchen, 2-bedroom guest flat, and electric fence wire.",
    price: 160000000,
    type: "buy",
    listingType: "buy",
    propertyType: "duplex",
    location: {
      address: "14 Rangers Avenue, Independence Layout",
      city: "Enugu",
      state: "Enugu",
      lga: "Enugu North",
      zipCode: "400102",
      country: "Nigeria",
    },
    bedrooms: 5,
    bathrooms: 5,
    parking: 4,
    areaSqFt: 4600,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "All Ensuite Bedrooms",
      "POP Ceiling & Ambient LED",
      "2-Bed Guest Chalet",
      "Electric Perimeter Wire",
      "Serene Neighborhood",
    ],
    yearBuilt: 2023,
    status: "available",
    agent: {
      name: "Chukwudi Okafor",
      email: "c.okafor@kisestate.ng",
      phone: "+234 803 456 7890",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Premier Lagos & South-East",
    },
  },
  {
    title: "Asokoro Executive 4-Bed Serviced Apartment",
    slug: "asokoro-executive-4-bed-serviced-apartment",
    description:
      "Exclusive 4-bedroom serviced apartment for rent in Asokoro, Abuja. Features 24/7 armed security patrol, high-capacity central generator, swimming pool, clubhouse, and lush green views.",
    price: 28000000,
    type: "rent",
    listingType: "rent",
    propertyType: "apartment",
    location: {
      address: "3 Kwame Nkrumah Crescent, Asokoro",
      city: "Asokoro",
      state: "Abuja",
      lga: "Municipal",
      zipCode: "900231",
      country: "Nigeria",
    },
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    areaSqFt: 3000,
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Diplomatic Zone Location",
      "24/7 Armed Security",
      "Central Generator Backup",
      "Clubhouse & Pool",
      "Modern Smart Elevators",
    ],
    yearBuilt: 2024,
    status: "available",
    agent: {
      name: "Amina Bello",
      email: "amina.bello@kisestate.ng",
      phone: "+234 802 345 6789",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Capital Properties Abuja",
    },
  },
  {
    title: "Sangotedo Ajah 4-Bed Contemporary Semi-Detached Duplex",
    slug: "sangotedo-ajah-4-bed-contemporary-semi-detached-duplex",
    description:
      "Affordable luxury 4-bedroom semi-detached duplex in a gated estate near Novare Mall, Sangotedo, Lagos. Features stamped concrete floor, fitted kitchen with extractor, heat extractor, water heater, and CCTV.",
    price: 85000000,
    type: "buy",
    listingType: "buy",
    propertyType: "duplex",
    location: {
      address: "12 Monastery Road, Sangotedo, Ajah",
      city: "Ajah",
      state: "Lagos",
      lga: "Eti-Osa",
      zipCode: "105101",
      country: "Nigeria",
    },
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    areaSqFt: 3100,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Gated Community with 24/7 Guard",
      "Fitted Kitchen with Heat Extractor",
      "Close Proximity to Novare Mall",
      "Treated Water System",
      "Stamped Concrete Compound",
    ],
    yearBuilt: 2024,
    status: "available",
    agent: {
      name: "Tunde Bakare",
      email: "tunde.b@kisestate.ng",
      phone: "+234 814 123 4567",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      agency: "KIS-Estate Lekki Corridor",
    },
  },
];

async function seed() {
  console.log("Seeding Nigerian properties into Firestore...");
  const propertiesCollection = db.collection("properties");

  const existing = await propertiesCollection.get();
  console.log(`Found ${existing.size} existing properties. Deleting old demo properties...`);

  const batchSize = 100;
  const docs = existing.docs;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + batchSize);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  console.log("Old properties deleted successfully.");

  console.log(`Inserting ${INITIAL_PROPERTIES.length} verified Nigerian properties...`);
  for (const prop of INITIAL_PROPERTIES) {
    const docRef = propertiesCollection.doc();
    const propertyData = {
      ...prop,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.set(propertyData);
    console.log(`✓ Inserted: ${prop.title} in ${prop.location.city}, ${prop.location.state} (₦${prop.price.toLocaleString()})`);
  }

  console.log(" Nigerian Property database seeding completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });