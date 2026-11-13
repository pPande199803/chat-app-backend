import type { Request, Response } from "express";
import pool from "../config/database";
import { sendMessage } from "../services/message.service";
import { getMessages } from "../services/message.service";
import { markMessageRead } from "../services/message.service";
import { updateLastSeen } from "../services/message.service";

export async function sendChatMessage(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const chatId = req.params.chatId;
        const { senderId, text } = req.body;

        if (
            typeof chatId !== "string" ||
            !/^[1-9]\d*$/.test(chatId) ||
            !/^[1-9]\d*$/.test(senderId) ||
            typeof text !== "string" ||
            !text.trim() ||
            text.length > 5000
        ) {
            res.status(400).json({
                success: false,
                message: "Invalid message details"
            });
            return;
        }

        const membership = await pool.query(
            `SELECT id FROM chat_members
             WHERE chat_id = $1 AND user_id = $2`,
            [chatId, senderId]
        );

        if (membership.rows.length === 0) {
            res.status(403).json({
                success: false,
                message: "You are not a member of this chat"
            });
            return;
        }

        const message = await sendMessage(
            chatId,
            senderId,
            text.trim()
        );

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
}


export async function getChatMessages(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const chatId = req.params.chatId;
        const userId = req.query.userId;

        const limit = Number(req.query.limit ?? 50);

        if (
            Array.isArray(chatId) ||
            typeof chatId !== "string" ||
            !/^[1-9]\d*$/.test(chatId) ||
            Array.isArray(userId) ||
            typeof userId !== "string" ||
            !/^[1-9]\d*$/.test(userId) ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            res.status(400).json({
                success: false,
                message: "Invalid parameters"
            });
            return;
        }

        const membership = await pool.query(
            `SELECT id FROM chat_members
             WHERE chat_id = $1 AND user_id = $2`,
            [chatId, userId]
        );

        if (membership.rows.length === 0) {
            res.status(403).json({
                success: false,
                message: "You are not a member of this chat"
            });
            return;
        }

        const messages = await getMessages(chatId, limit);

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve messages"
        });
    }
}



export async function readMessage(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const chatId = req.params.chatId;
        const messageId = req.params.messageId;
        const { userId } = req.body;

        if (
            typeof chatId !== "string" ||
            !/^[1-9]\d*$/.test(chatId) ||
            typeof messageId !== "string" ||
            !messageId.trim() ||
            typeof userId !== "string" ||
            !/^[1-9]\d*$/.test(userId)
        ) {
            res.status(400).json({
                success: false,
                message: "Invalid request"
            });
            return;
        }

        const membership = await pool.query(
            `SELECT id FROM chat_members
             WHERE chat_id = $1 AND user_id = $2`,
            [chatId, userId]
        );

        if (membership.rows.length === 0) {
            res.status(403).json({
                success: false,
                message: "You are not a chat member"
            });
            return;
        }

        const result = await markMessageRead(
            chatId,
            messageId,
            userId
        );

        res.status(200).json({
            success: true,
            message: "Message marked as read",
            data: result
        });

    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Internal server error";

        res.status(message === "Message not found" ? 404 : 500)
            .json({
                success: false,
                message
            });
    }
}





export async function lastSeen(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const chatId = req.params.chatId;
        const { userId, messageId } = req.body;

        if (
            typeof chatId !== "string" ||
            !/^[1-9]\d*$/.test(chatId) ||
            typeof userId !== "string" ||
            !/^[1-9]\d*$/.test(userId) ||
            typeof messageId !== "string" ||
            !messageId.trim()
        ) {
            res.status(400).json({
                success: false,
                message: "Invalid request"
            });
            return;
        }

        const membership = await pool.query(
            `SELECT id FROM chat_members
             WHERE chat_id = $1 AND user_id = $2`,
            [chatId, userId]
        );

        if (membership.rows.length === 0) {
            res.status(403).json({
                success: false,
                message: "You are not a chat member"
            });
            return;
        }

        const result = await updateLastSeen(
            chatId,
            userId,
            messageId
        );

        res.status(200).json({
            success: true,
            message: "Last seen updated successfully",
            data: result
        });

    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Internal server error";

        const status = message === "Message not found"
            ? 404
            : message === "Last seen cannot move backwards"
                ? 400
                : 500;

        res.status(status).json({
            success: false,
            message
        });
    }
}
