
import pool from "../config/database";

function isValidId(id: string): boolean {
    return /^[1-9]\d*$/.test(id) &&
        BigInt(id) <= 9223372036854775807n;
}

export async function createOrGetChat(
    userAId: string,
    userBId: string
): Promise<string> {

    if (
        !isValidId(userAId) ||
        !isValidId(userBId) ||
        userAId === userBId
    ) {
        throw new Error("Invalid user IDs");
    }

    const [firstId, secondId] = [
        userAId,
        userBId
    ].sort((a, b) => {
        const first = BigInt(a);
        const second = BigInt(b);

        return first < second ? -1 : first > second ? 1 : 0;
    });

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const users = await client.query(
            `SELECT id
             FROM users
             WHERE id = ANY($1::bigint[])`,
            [[firstId, secondId]]
        );

        if (users.rows.length !== 2) {
            throw new Error("One or both users do not exist");
        }

        const chatResult = await client.query(
            `INSERT INTO chats (user_a, user_b)
             VALUES ($1, $2)
             ON CONFLICT (user_a, user_b)
             DO UPDATE SET user_a = EXCLUDED.user_a
             RETURNING id`,
            [firstId, secondId]
        );

        const chatId: string = chatResult.rows[0].id;

        await client.query(
            `INSERT INTO chat_members (chat_id, user_id)
             VALUES ($1, $2), ($1, $3)
             ON CONFLICT (chat_id, user_id) DO NOTHING`,
            [chatId, firstId, secondId]
        );

        await client.query("COMMIT");

        return chatId;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}


export const createGroupChat = async (
  groupName: string,
  createdBy: string,
  members: string[]
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const allMembers = [...new Set([...members, createdBy])];

    const usersResult = await client.query(
      `SELECT id FROM users WHERE id = ANY($1::bigint[])`,
      [allMembers]
    );

    if (usersResult.rows.length !== allMembers.length) {
      throw new Error("One or more users do not exist");
    }

    const groupResult = await client.query(
      `INSERT INTO chats (chat_type, group_name, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, chat_type, group_name, created_by, created_at`,
      ["group", groupName, createdBy]
    );

    const chat = groupResult.rows[0];

    for (const userId of allMembers) {
      await client.query(
        `INSERT INTO chat_members (chat_id, user_id)
         VALUES ($1, $2)`,
        [chat.id, userId]
      );
    }

    await client.query("COMMIT");

    return {
      chatId: String(chat.id),
      groupName: chat.group_name,
      members: allMembers
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
