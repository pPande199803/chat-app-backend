
import type { Request, Response } from "express";
import { getUserChats } from "../services/user.service";

export async function listUserChats(
    req: Request,
    res: Response
): Promise<void> {

    try {
        const userId = req.params.userId;

        if (typeof userId !== "string" || !/^[1-9]\d*$/.test(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
            return;
        }

        const chats = await getUserChats(userId);

        res.status(200).json({
            success: true,
            count: chats.length,
            data: chats
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve user chats"
        });
    }
}
