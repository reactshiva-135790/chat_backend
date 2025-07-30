import express from "express";
import { sendMessage, getMessages, sendFile } from "../controllers/messageController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/send", sendMessage);
router.post("/file", upload.single("file"), sendFile);
router.get("/", getMessages);

export default router;
