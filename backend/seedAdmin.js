import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "./models/admin.model.js";
import { configDotenv } from "dotenv";
configDotenv();
mongoose.connect(process.env.MONGODB_URI);

const createAdmin = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("ziaralebanon123", salt);

  await Admin.create({
    email: "ziaralebanon@gmail.com",
    password: hashedPassword,
  });

  console.log("Admin account created!");
  mongoose.disconnect();
};

createAdmin();
