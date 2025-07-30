import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guest'], // or customize as needed
    required: true,
  },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
