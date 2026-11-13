
import pool from "../config/database";

interface ChatRow {
    chat_id: string;
    member_id: string;
    created_at: Date;
}

export async function getUserChats(userId: string) {

    const result = await pool.query<ChatRow>(
        `SELECT
            c.id AS chat_id,
            cm.user_id AS member_id,
            c.created_at
         FROM chats c
         INNER JOIN chat_members cm
            ON c.id = cm.chat_id
         WHERE c.id IN (
            SELECT chat_id
            FROM chat_members
            WHERE user_id = $1
         )
         ORDER BY c.created_at DESC`,
        [userId]
    );

    const chatMap = new Map<string, {
        chatId: string;
        members: string[];
        createdAt: Date;
    }>();

    for (const row of result.rows) {

        if (!chatMap.has(row.chat_id)) {
            chatMap.set(row.chat_id, {
                chatId: row.chat_id,
                members: [],
                createdAt: row.created_at
            });
        }

        chatMap.get(row.chat_id)!.members.push(
            row.member_id
        );
    }

    return Array.from(chatMap.values());
}
