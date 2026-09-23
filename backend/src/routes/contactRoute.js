const express = require("express");
const { sendContactMessage } = require("../controller/contactController");

const router = express.Router();

// POST /api/contact
router.post("/", sendContactMessage);

module.exports = router;

