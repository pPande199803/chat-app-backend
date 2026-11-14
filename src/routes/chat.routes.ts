import { Router } from "express";
import { createChat, createGroupChatController } from "../controllers/chat.controller";

const router = Router();

router.post("/create", createChat);

router.post("/group/create", createGroupChatController);

export default router;