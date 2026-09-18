require("dotenv").config();

const { db, admin } = require("../src/config/firebase");

const INITIAL_PROPERTIES = [
  {
    title: "The Glass Horizon Villa",
    slug: "the-glass-horizon-villa",
    description:
      "An architectural masterpiece perched in the prestigious Beverly Hills hills. Features floor-to-ceiling glass walls that disappear seamlessly to create effortless indoor-outdoor flow, an infinity edge pool overlooking the Los Angeles skyline, a custom temperature-controlled wine cellar, and state-of-the-art smart home automation throughout.",
    price: 4850000,
    type: "buy",
    listingType: "buy",
    propertyType: "villa",
    location: {
      address: "1420 Loma Vista Dr",
      city: "Beverly Hills",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 6200,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Infinity Pool",
      "Smart Home Automation",
      "Wine Cellar",
      "Home Theater",
      "City View",
      "Spa & Sauna",
      "Outdoor Kitchen",
      "3-Car Garage",
    ],
    yearBuilt: 2023,
    status: "available",
    agent: {
      name: "Marcus Vance",
      email: "marcus.vance@havenestate.com",
      phone: "+1 (310) 555-0192",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Luxury Estates Beverly Hills",
    },
  },
  {
    title: "Skyline Penthouse at Hudson Yards",
    slug: "skyline-penthouse-at-hudson-yards",
    description:
      "Perched on the 64th floor, this modern duplex penthouse captures 360-degree panoramic views of Manhattan and the Hudson River. Boasting 14-foot ceilings, custom Italian Boffi kitchen with Gaggenau appliances, private elevator landing, and a sweeping 1,200 sqft wraparound landscaped terrace.",
    price: 3650000,
    type: "buy",
    listingType: "buy",
    propertyType: "penthouse",
    location: {
      address: "35 Hudson Yards #64A",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    bedrooms: 3,
    bathrooms: 4,
    areaSqFt: 3400,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Private Wraparound Terrace",
      "24/7 Doorman & Concierge",
      "Private Elevator Access",
      "Fitness Center & Pool",
      "River Views",
      "Valet Parking",
    ],
    yearBuilt: 2022,
    status: "available",
    agent: {
      name: "Sophia Sterling",
      email: "sophia.s@havenestate.com",
      phone: "+1 (212) 555-0841",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Manhattan Premier Group",
    },
  },
  {
    title: "Modernist Waterfront Haven",
    slug: "modernist-waterfront-haven",
    description:
      "Exclusive waterfront rental on Miami's Venetian Islands with direct bay access and private 60ft boat dock. Modern organic architecture featuring limestone floors, open-concept living pavilion, heated saltwater pool, lush tropical landscaping, and bespoke sunset vistas.",
    price: 8500,
    type: "rent",
    listingType: "rent",
    propertyType: "villa",
    location: {
      address: "320 San Marino Dr",
      city: "Miami",
      state: "FL",
      zipCode: "33139",
      country: "USA",
    },
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 4100,
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Private Boat Dock",
      "Heated Saltwater Pool",
      "Direct Bay Access",
      "Gated Security",
      "Outdoor Summer Kitchen",
      "High-speed EV Charger",
    ],
    yearBuilt: 2021,
    status: "available",
    agent: {
      name: "Carlos Delgado",
      email: "carlos.d@havenestate.com",
      phone: "+1 (305) 555-0319",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Coastal & Islands",
    },
  },
  {
    title: "Cobble Hill Historic Brownstone",
    slug: "cobble-hill-historic-brownstone",
    description:
      "A meticulously renovated 4-story landmark brownstone in Cobble Hill. Blends historic charm like original restored plaster moldings and pocket doors with modern comforts including radiant heated oak floors, chef's eat-in kitchen, and a peaceful private garden patio shaded by a mature magnolia tree.",
    price: 2450000,
    type: "buy",
    listingType: "buy",
    propertyType: "townhouse",
    location: {
      address: "218 Amity Street",
      city: "New York",
      state: "NY",
      zipCode: "11201",
      country: "USA",
    },
    bedrooms: 4,
    bathrooms: 3,
    areaSqFt: 3100,
    images: [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Private English Garden",
      "Wood Burning Fireplace",
      "Radiant Heated Floors",
      "Walk-in Pantry",
      "Original Restored Details",
      "Full Basement Storage",
    ],
    yearBuilt: 1910,
    status: "available",
    agent: {
      name: "Sophia Sterling",
      email: "sophia.s@havenestate.com",
      phone: "+1 (212) 555-0841",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Manhattan Premier Group",
    },
  },
  {
    title: "SoMa High-Rise Designer Loft",
    slug: "soma-high-rise-designer-loft",
    description:
      "Contemporary luxury rental in San Francisco's technology epicenter. Walls of glass overlook the Transbay park and skyline. Features open-plan industrial chic design with concrete pillars, Italian quartz countertops, motorized blackout shades, and an oversized private balcony.",
    price: 4200,
    type: "rent",
    listingType: "rent",
    propertyType: "apartment",
    location: {
      address: "480 Mission St #18B",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA",
    },
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1450,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Private Balcony",
      "Fitness Center & Yoga Studio",
      "Rooftop Sky Lounge",
      "Bicycle Storage",
      "Pet Friendly with Dog Run",
      "Package Concierge",
    ],
    yearBuilt: 2020,
    status: "available",
    agent: {
      name: "David Kim",
      email: "david.kim@havenestate.com",
      phone: "+1 (415) 555-0723",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Bay Area Properties",
    },
  },
  {
    title: "Hill Country Contemporary Retreat",
    slug: "hill-country-contemporary-retreat",
    description:
      "Sprawling modern estate nestled on 1.2 secluded acres in Westlake Hills. Designed by an award-winning architect to blend Texas limestone with clean modern steel. Complete with zero-edge infinity pool, outdoor living cabana with pizza oven, solar microgrid, and guest casita.",
    price: 1750000,
    type: "buy",
    listingType: "buy",
    propertyType: "house",
    location: {
      address: "3412 Westlake Ridge Rd",
      city: "Austin",
      state: "TX",
      zipCode: "78746",
      country: "USA",
    },
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 3800,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Infinity Edge Pool",
      "1.2 Acre Private Lot",
      "Detached Guest House",
      "Solar & Battery Backup",
      "Outdoor Kitchen with Grill",
      "Hill Country Views",
    ],
    yearBuilt: 2022,
    status: "available",
    agent: {
      name: "Rachel Morgan",
      email: "rachel.m@havenestate.com",
      phone: "+1 (512) 555-0982",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Texas Capital Realty",
    },
  },
  {
    title: "Lake Union Floating Residence",
    slug: "lake-union-floating-residence",
    description:
      "A romantic floating home with private boat mooring on Seattle's Lake Union. Featuring unobstructed views of the Space Needle and Gas Works Park. Light-filled open interiors with cedar finishes, custom nautical cabinetry, radiant heating, and an extraordinary rooftop observation deck.",
    price: 5500,
    type: "rent",
    listingType: "rent",
    propertyType: "house",
    location: {
      address: "2400 Fairview Ave E #Dock 4",
      city: "Seattle",
      state: "WA",
      zipCode: "98102",
      country: "USA",
    },
    bedrooms: 3,
    bathrooms: 2,
    areaSqFt: 2200,
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Rooftop Observation Deck",
      "Boat Mooring Slip",
      "Space Needle View",
      "Kayak Launch",
      "Gas Fireplace",
      "Washer/Dryer in Unit",
    ],
    yearBuilt: 2019,
    status: "available",
    agent: {
      name: "Liam O'Connor",
      email: "liam.o@havenestate.com",
      phone: "+1 (206) 555-0451",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Northwest Realty",
    },
  },
  {
    title: "Gold Coast Luxury Residence",
    slug: "gold-coast-luxury-residence",
    description:
      "Classic full-floor residence in one of Chicago's premier pre-war cooperatives. Stunning Lake Michigan views, elegant formal dining room, herringbone hardwood floors, three fireplaces, and direct elevator entry into private foyer. Includes 2 deeded garage parking spaces.",
    price: 1250000,
    type: "buy",
    listingType: "buy",
    propertyType: "condo",
    location: {
      address: "1500 N Lake Shore Dr #12",
      city: "Chicago",
      state: "IL",
      zipCode: "60610",
      country: "USA",
    },
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2850,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472556-9d8c00bb9f8b?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Lake Michigan Views",
      "Full Floor Privacy",
      "2 Deeded Heated Garage Spaces",
      "24/7 Doorman",
      "Original Fireplaces",
      "Custom Library",
    ],
    yearBuilt: 1928,
    status: "available",
    agent: {
      name: "Rachel Morgan",
      email: "rachel.m@havenestate.com",
      phone: "+1 (512) 555-0982",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Midwest Group",
    },
  },
  {
    title: "Venice Beach Bohemian Sanctuary",
    slug: "venice-beach-bohemian-sanctuary",
    description:
      "Steps from Abbot Kinney and Venice Beach Boardwalk. An inspiring coastal compound designed with warm reclaimed timber, vaulted ceilings, and lush green courtyards. Features an outdoor shower, gas fire lounge, custom surfboard racks, and detached creative studio.",
    price: 6200,
    type: "rent",
    listingType: "rent",
    propertyType: "house",
    location: {
      address: "614 Cabrillo Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90291",
      country: "USA",
    },
    bedrooms: 3,
    bathrooms: 2,
    areaSqFt: 2100,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Walk to Abbot Kinney",
      "Outdoor Fire Pit Lounge",
      "Creative Work Studio",
      "Outdoor Heated Shower",
      "Gated Entry",
      "Pet Friendly",
    ],
    yearBuilt: 2018,
    status: "available",
    agent: {
      name: "Marcus Vance",
      email: "marcus.vance@havenestate.com",
      phone: "+1 (310) 555-0192",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Luxury Estates Beverly Hills",
    },
  },
  {
    title: "Brickell Financial District Suite",
    slug: "brickell-financial-district-suite",
    description:
      "Sleek and sophisticated condo on the 32nd floor of an iconic Brickell tower. Breathtaking Biscayne Bay views from deep glass balcony. Walking distance to Mary Brickell Village, top financial institutions, and Michelin-starred dining.",
    price: 3400,
    type: "rent",
    listingType: "rent",
    propertyType: "apartment",
    location: {
      address: "1100 Brickell Bay Dr #3204",
      city: "Miami",
      state: "FL",
      zipCode: "33131",
      country: "USA",
    },
    bedrooms: 1,
    bathrooms: 2,
    areaSqFt: 980,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Rooftop Infinity Pool",
      "Full Service Spa & Sauna",
      "Valet Parking Included",
      "Bay Views",
      "24/7 Security",
      "Business Center & Meeting Rooms",
    ],
    yearBuilt: 2021,
    status: "available",
    agent: {
      name: "Carlos Delgado",
      email: "carlos.d@havenestate.com",
      phone: "+1 (305) 555-0319",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Coastal & Islands",
    },
  },
  {
    title: "Pacific Heights Grand Victorian",
    slug: "pacific-heights-grand-victorian",
    description:
      "A majestic, freestanding Victorian mansion in San Francisco's most coveted neighborhood. Extensively modernized with preserved crown molding, grand staircase, gourmet chef's kitchen, wine cellar, and sweeping Golden Gate and Alcatraz views from the top-floor primary suite.",
    price: 5200000,
    type: "buy",
    listingType: "buy",
    propertyType: "house",
    location: {
      address: "2640 Broadway",
      city: "San Francisco",
      state: "CA",
      zipCode: "94115",
      country: "USA",
    },
    bedrooms: 5,
    bathrooms: 5,
    areaSqFt: 5400,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
    amenities: [
      "Golden Gate & Bay Views",
      "Wine Tasting Room",
      "Elevator to All 4 Levels",
      "Landscaped Rear Garden",
      "Attached 2-Car Garage",
      "Sub-Zero & Wolf Kitchen",
    ],
    yearBuilt: 1898,
    status: "available",
    agent: {
      name: "David Kim",
      email: "david.kim@havenestate.com",
      phone: "+1 (415) 555-0723",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Bay Area Properties",
    },
  },
  {
    title: "Tribeca Cast Iron Designer Loft",
    slug: "tribeca-cast-iron-designer-loft",
    description:
      "A quintessential full-floor loft situated in an 1890s landmark cast-iron building. Authentic architectural elements include fluted Corinthian columns, 13-foot timber beamed ceilings, oversized southern facing windows, a wood burning fireplace, and key-in-elevator security.",
    price: 9800,
    type: "rent",
    listingType: "rent",
    propertyType: "apartment",
    location: {
      address: "68 Franklin St #4",
      city: "New York",
      state: "NY",
      zipCode: "10013",
      country: "USA",
    },
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2900,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: false,
    amenities: [
      "Keyed Direct Elevator",
      "Cast Iron Architecture",
      "13-Foot Ceilings",
      "Custom Italian Kitchen",
      "Primary Suite with Sauna",
      "Private Storage Room",
    ],
    yearBuilt: 1895,
    status: "available",
    agent: {
      name: "Sophia Sterling",
      email: "sophia.s@havenestate.com",
      phone: "+1 (212) 555-0841",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
      agency: "Haven Manhattan Premier Group",
    },
  },
];

async function seed() {
  try {
    console.log("Seeding Firestore properties...");

    const propertiesCol = db.collection("properties");
    const existing = await propertiesCol.limit(1).get();

    if (!existing.empty) {
      console.log(`Found existing properties in database. Checking count...`);
      const all = await propertiesCol.get();
      console.log(`Database already has ${all.size} properties.`);
      if (process.argv.includes("--force")) {
        console.log("Force flag detected. Deleting existing properties...");
        const batch = db.batch();
        all.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log("Deleted old properties.");
      } else {
        console.log("To overwrite, pass --force. Exiting without changing.");
        process.exit(0);
      }
    }

    const batch = db.batch();

    for (const prop of INITIAL_PROPERTIES) {
      const docRef = propertiesCol.doc();
      batch.set(docRef, {
        ...prop,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log(`Successfully seeded ${INITIAL_PROPERTIES.length} properties to Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed Firestore:", error);
    process.exit(1);
  }
}

seed();

