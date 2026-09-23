const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoute");
const locationRoutes = require("./routes/locationRoute");
const amenityRoutes = require("./routes/amenityRoute");
const inquiryRoutes = require("./routes/inquiryRoute");
const contactRoutes = require("./routes/contactRoute");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check if origin is in the allowed list or is a vercel app deployment
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production";

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// GET /api/health
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "Property Listing API is running",
    timestamp: new Date().toISOString(),
    database: "Firebase Firestore",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS origin forbidden",
    });
  }

  console.error("API Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;