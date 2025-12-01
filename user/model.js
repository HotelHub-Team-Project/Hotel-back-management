import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "user",
    },
    isBlocked: { type: Boolean, default: false },
    // 사업자 관련 정보 (새로운 필드)
    businessInfo: {
      businessName: { type: String },
      businessNumber: { type: String },
      bankAccount: { type: String },
    },
    businessStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    address: { type: String },
    dateOfBirth: { type: Date },
    avatarUrl: { type: String },
    coverUrl: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 비밀번호 해시
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.userId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  },
});

export const User = mongoose.model("User", userSchema);
export default User;