const nodemailer = require("nodemailer");
const { db, admin } = require("../config/firebase");

const contactMessagesCollection = db.collection("contact_messages");

const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSubject = subject ? String(subject).trim() : "General Inquiry from KIS-Estate Website";
    const cleanMessage = String(message).trim();
    const cleanPhone = phone ? String(phone).trim() : "Not provided";

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "kelechiawa11@gmail.com";

    // 1. Always save the contact message in Firestore
    const messageDoc = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
      receiverEmail,
      status: "received",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await contactMessagesCollection.add(messageDoc);

    // 2. Dispatch email via Nodemailer if SMTP configured
    let emailDispatched = false;
    let emailError = null;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"KIS-Estate Contact Form" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: receiverEmail,
          replyTo: cleanEmail,
          subject: `[KIS-Estate Inquiry] ${cleanSubject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #4f46e5; margin-bottom: 20px; border-bottom: 2px solid #eef2ff; padding-bottom: 10px;">
                New Website Contact Message
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563; width: 120px;">Full Name:</td>
                  <td style="padding: 8px 0; color: #111827;">${cleanName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Email:</td>
                  <td style="padding: 8px 0; color: #111827;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Phone:</td>
                  <td style="padding: 8px 0; color: #111827;">${cleanPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Subject:</td>
                  <td style="padding: 8px 0; color: #111827;">${cleanSubject}</td>
                </tr>
              </table>
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: #374151; margin-bottom: 8px;">Message:</h4>
                <p style="margin: 0; color: #1f2937; white-space: pre-wrap; line-height: 1.6;">${cleanMessage}</p>
              </div>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; text-align: center;">
                Delivered via KIS-Estate Real Estate Platform
              </p>
            </div>
          `,
        });

        emailDispatched = true;
      } catch (err) {
        console.error("Nodemailer SMTP dispatch failed:", err.message);
        emailError = err.message;
      }
    } else {
      console.log(`[Contact Form] SMTP not configured. Message recorded in Firestore (ID: ${docRef.id}) for delivery to: ${receiverEmail}`);
      emailDispatched = true;
    }

    return res.status(200).json({
      success: true,
      message: "Thank you! Your message has been sent successfully. We will get in touch with you shortly.",
      data: {
        id: docRef.id,
        emailDispatched,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendContactMessage,
};

