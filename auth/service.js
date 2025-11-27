import jwt from "jsonwebtoken";
import { User } from "../user/model.js";

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("USER_NOT_FOUND");
    error.status = 404;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error("INVALID_PASSWORD");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );

  return { user, token };
};

export const register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error("USER_ALREADY_EXISTS");
    error.status = 409;
    throw error;
  }

  const user = await User.create(userData);
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );

  return { user, token };
};
