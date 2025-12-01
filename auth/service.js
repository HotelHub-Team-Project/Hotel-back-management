import jwt from "jsonwebtoken";
import { User } from "../user/model.js";

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "dev-secret";

export const login = async (email, password) => {
  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("INVALID_CREDENTIALS");
    error.status = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error("INVALID_CREDENTIALS");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

export const register = async (userData) => {
  if (!userData.email || !userData.password || !userData.name) {
    const error = new Error("Name, email, and password are required.");
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error("USER_ALREADY_EXISTS");
    error.status = 409;
    throw error;
  }

  // Password hashing is handled by the pre('save') hook in user/model.js
  const user = await User.create(userData);

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};