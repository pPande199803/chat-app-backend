import type { Request, Response } from "express";
import { createOrGetChat } from "../services/chat.service";
import * as chatService from "../services/chat.service";

export async function createChat(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { userAId, userBId } = req.body;

        if (
            typeof userAId !== "string" ||
            typeof userBId !== "string"
        ) {
            res.status(400).json({
                success: false,
                message: "User IDs must be strings"
            });
            return;
        }

        const chatId = await createOrGetChat(
            userAId,
            userBId
        );

        res.status(200).json({
            success: true,
            chatId,
            message: "Chat created or retrieved successfully"
        });

    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Internal server error";

        const status = message.includes("do not exist") ||
            message.includes("Invalid")
            ? 400 : 500;

        res.status(status).json({
            success: false,
            message
        });
    }
}


export const createGroupChatController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { groupName, createdBy, members } = req.body;

    if (
      typeof groupName !== "string" ||
      !groupName.trim() ||
      typeof createdBy !== "string" ||
      !Array.isArray(members) ||
      !members.every((id: unknown) => typeof id === "string")
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid request data"
      });
      return;
    }

    const result = await chatService.createGroupChat(
      groupName.trim(),
      createdBy,
      members
    );

    res.status(201).json({
      success: true,
      message: "Group chat created successfully",
      data: result
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    res.status(400).json({
      success: false,
      message
    });
  }
};