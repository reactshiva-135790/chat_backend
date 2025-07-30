import { User } from "../models/userModel.js";

// Create user
export const createUser = async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const newUser = await User.create({ name, role });
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user list
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to get users", error: error.message });
  }
};
