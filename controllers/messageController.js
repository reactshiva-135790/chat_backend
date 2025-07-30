import { Message } from "../models/messageModel.js";

// ✅ Send a text message
export const sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    const newMsg = await Message.create({
      senderId,
      receiverId,
      content,
      messageType: "text", // helps differentiate in frontend
      timestamp: new Date()
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: newMsg
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ Send a file message
export const sendFile = async (req, res) => {
  const { senderId, receiverId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const newMsg = await Message.create({
      senderId,
      receiverId,
      messageType: "file", // distinguish file type
      fileName: file.originalname,
      filePath: file.filename, // you can also save full URL if needed
      timestamp: new Date()
    });

    res.status(201).json({
      message: "File message sent",
      data: newMsg
    });
  } catch (err) {
    console.error("Error sending file:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ Get all messages between two users
export const getMessages = async (req, res) => {
  const { id: receiverId } = req.params;
  const senderId = req.user._id; // assumes isAuthenticated middleware sets req.user

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json({
      message: "Messages fetched successfully",
      data: messages
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
