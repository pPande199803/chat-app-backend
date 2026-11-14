import { Router } from "express";

import {
    sendChatMessage, getChatMessages,
    readMessage,
    lastSeen,
    editMessageController,
    deleteMessageController
} from "../controllers/message.controller";


const router = Router();

router.post(
    "/:chatId/message/send",
    sendChatMessage
);

router.get("/:chatId/messages", getChatMessages);

router.post(
    "/:chatId/message/:messageId/read",
    readMessage
);

router.post("/:chatId/lastseen", lastSeen);

router.put(
  "/:chatId/message/:messageId/edit",
  editMessageController
);

router.delete(
  "/:chatId/message/:messageId/delete",
  deleteMessageController
);

export default router;