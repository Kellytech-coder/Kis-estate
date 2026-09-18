require("dotenv").config();

const { auth, db, admin } = require("../src/config/firebase");

const createAdmin = async () => {
  try {
    const name = process.env.INITIAL_ADMIN_NAME || process.argv[2];
    const email = (process.env.INITIAL_ADMIN_EMAIL || process.argv[3])?.trim()?.toLowerCase();
    const password = process.env.INITIAL_ADMIN_PASSWORD || process.argv[4];

    if (!name || !email || !password) {
      throw new Error(
        "Admin credentials required. Set INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD in .env or pass as arguments: node createAdmin.js <name> <email> <password>"
      );
    }

    let user;

    try {
      user = await auth.getUserByEmail(email);
      console.log(`Found existing Firebase Auth user for ${email} (UID: ${user.uid})`);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        console.log(`Creating new Firebase Auth user for ${email}...`);
        user = await auth.createUser({
          email,
          password,
          displayName: name,
        });
        console.log(`Created Firebase Auth user (UID: ${user.uid})`);
      } else {
        throw error;
      }
    }

    // Assign custom claims if supported and set Firestore document in 'users' collection
    await db.collection("users").doc(user.uid).set(
      {
        uid: user.uid,
        name,
        email,
        role: "ADMIN",
        isActive: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("====================================");
    console.log("ADMIN ACCOUNT CONFIGURED SUCCESSFULLY");
    console.log("====================================");
    console.log(`UID:   ${user.uid}`);
    console.log(`Name:  ${name}`);
    console.log(`Email: ${email}`);
    console.log("Role:  ADMIN");
    console.log("====================================");

    process.exit(0);
  } catch (error) {
    console.error("Failed to configure admin:", error);
    process.exit(1);
  }
};

createAdmin();