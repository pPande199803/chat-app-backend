import { Router } from "express";

import {
    sendChatMessage, getChatMessages,
    readMessage,
    lastSeen
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

export default router;