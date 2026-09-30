const bcrypt = require("bcrypt");
const User = require("../models/userModel.cjs");

const users = [
  {
    userId: "U001",
    username: "janderson",
    password: "YogiTest123!",
    role: "Instructor",
    sourceKey: "I001"
  },
  {
    userId: "U002",
    username: "dbrown",
    password: "DanielTest123!",
    role: "Instructor",
    sourceKey: "I002"
  },
  {
    userId: "U003",
    username: "awilson",
    password: "YogiTest123!",
    role: "Instructor",
    sourceKey: "I003"
  },
  {
    userId: "U004",
    username: "rthompson",
    password: "!thomPsonTest222",
    role: "Manager",
    sourceKey: "M001"
  },
  {
    userId: "U005",
    username: "mdavis",
    password: "YogiTest123!",
    role: "Manager",
    sourceKey: "M002"
  }
];

async function testUsers() {
  try {
    for (const user of users) {

      const passwordHash = await bcrypt.hash(user.password, 10);

      const newUser = new User({
        userId: user.userId,
        username: user.username,
        passwordHash,
        role: user.role,
        sourceKey: user.sourceKey
      });

      await newUser.save();

      console.log(`Created user ${user.username}`);
    }

    console.log("User seed complete.");
    process.exit(0);

  } catch (err) {
    console.error("Error seeding users:", err.message);
    process.exit(1);
  }
}

testUsers();