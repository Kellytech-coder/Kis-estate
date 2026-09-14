require("dotenv").config();

const { auth, db } = require("../src/config/firebase");

const createAdmin = async () => {
  try {
    const name = process.env.INITIAL_ADMIN_NAME;
    const email = process.env.INITIAL_ADMIN_EMAIL;
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are required"
      );
    }

    let user;

    try {
      user = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        user = await auth.createUser({
          email,
          password,
          displayName: name,
        });
      } else {
        throw error;
      }
    }

    await db.collection("users").doc(user.uid).set(
      {
        name,
        email,
        role: "ADMIN",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        merge: true,
      }
    );

    console.log("====================================");
    console.log("ADMIN ACCOUNT READY");
    console.log("====================================");
    console.log(`UID: ${user.uid}`);
    console.log(`Email: ${email}`);
    console.log("Role: ADMIN");
    console.log("====================================");

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();