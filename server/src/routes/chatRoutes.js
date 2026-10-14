import express from "express";

import {
  createChat,
  deleteChat,
  getChatById,
  getChats,
  sendMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();
const messageRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 25,
  namespace: "chat:message",
  message: "Too many messages sent in a short time. Please wait and try again.",
});

router.use(protect);

router.route("/").get(getChats).post(createChat);
router.route("/:chatId").get(getChatById).delete(deleteChat);
router.post("/:chatId/messages", messageRateLimiter, sendMessage);

export default router;
