import {
    firestore
} from "../config/firebase";

import {
    FieldValue
} from "firebase-admin/firestore";

import pool from "../config/database";

export async function sendMessage(
    chatId: string,
    senderId: string,
    text: string
) {
    const messageRef = firestore
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .doc();

    await messageRef.set({
        senderId,
        text,
        timestamp: FieldValue.serverTimestamp()
    });

    const savedMessage = await messageRef.get();

    return {
        messageId: messageRef.id,
        ...savedMessage.data()
    };
}


export async function getMessages(
    chatId: string,
    limit: number
) {
    const snapshot = await firestore
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

    const messages = snapshot.docs.map(doc => ({
        messageId: doc.id,
        ...doc.data()
    }));

    // Show messages from oldest to newest
    return messages.reverse();
}



export async function markMessageRead(
    chatId: string,
    messageId: string,
    userId: string
) {
    const messageRef = firestore
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .doc(messageId);

    const messageSnapshot = await messageRef.get();

    if (!messageSnapshot.exists) {
        throw new Error("Message not found");
    }

    const receiptRef = messageRef
        .collection("readReceipts")
        .doc(userId);

    await receiptRef.set({
        userId,
        readAt: FieldValue.serverTimestamp()
    });

    return {
        messageId,
        userId,
        read: true
    };
}



export async function updateLastSeen(
    chatId: string,
    userId: string,
    messageId: string
) {
    const chatRef = firestore
        .collection("chats")
        .doc(chatId);

    const messageRef = chatRef
        .collection("messages")
        .doc(messageId);

    const lastSeenRef = chatRef
        .collection("lastSeen")
        .doc(userId);

    await firestore.runTransaction(async (transaction) => {

        const messageSnapshot = await transaction.get(messageRef);

        if (!messageSnapshot.exists) {
            throw new Error("Message not found");
        }

        const messageData = messageSnapshot.data();

        if (messageData?.timestamp == null) {
            throw new Error("Message timestamp not available");
        }

        const previous = await transaction.get(lastSeenRef);

        if (previous.exists) {
            const previousMessageId = previous.data()?.messageId;

            if (previousMessageId) {
                const previousMessageRef = chatRef
                    .collection("messages")
                    .doc(previousMessageId);

                const previousMessage = await transaction.get(
                    previousMessageRef
                );

                if (
                    previousMessage.exists &&
                    previousMessage.data()?.timestamp?.toMillis() >
                    messageData.timestamp.toMillis()
                ) {
                    throw new Error(
                        "Last seen cannot move backwards"
                    );
                }
            }
        }

        transaction.set(lastSeenRef, {
            userId,
            messageId,
            timestamp: FieldValue.serverTimestamp()
        });
    });

    return {
        userId,
        messageId,
        updated: true
    };
}


export const editMessage = async (
    chatId: string,
    messageId: string,
    senderId: string,
    text: string
) => {

    const membership = await pool.query(
        `SELECT id
     FROM chat_members
     WHERE chat_id = $1 AND user_id = $2`,
        [chatId, senderId]
    );

    if (membership.rows.length === 0) {
        throw new Error("You are not member of this chat");
    }

    const messageRef = firestore
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .doc(messageId);

    // Check message exists
    const messageSnapshot = await messageRef.get();

    if (!messageSnapshot.exists) {
        throw new Error("Message not found");
    }

    const message = messageSnapshot.data();

    // Only mess sender can edit
    if (String(message?.senderId) !== senderId) {
        throw new Error("You can only edit your own messages");
    }

    // Upda message
    await messageRef.update({
        text: text,
        edited: true,
        editedAt: FieldValue.serverTimestamp()
    });

    return {
        messageId,
        text,
        edited: true
    };
};


export const deleteMessage = async (
  chatId: string,
  messageId: string,
  senderId: string
) => {
  // Check user belongs to this chat
  const membership = await pool.query(
    `SELECT id
     FROM chat_members
     WHERE chat_id = $1 AND user_id = $2`,
    [chatId, senderId]
  );

  if (membership.rows.length === 0) {
    throw new Error("You are not a member of this chat");
  }

  const messageRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .doc(messageId);

  // Check whether message exists
  const messageSnapshot = await messageRef.get();

  if (!messageSnapshot.exists) {
    throw new Error("Message not found");
  }

  const message = messageSnapshot.data();

  // Only message sender can delete
  if (String(message?.senderId) !== senderId) {
    throw new Error("You can only delete your own messages");
  }

  // Get all read receipts
  const receiptsSnapshot = await messageRef
    .collection("readReceipts")
    .get();

  // Delete read receipts in batches
  const receiptDocs = receiptsSnapshot.docs;

  for (let i = 0; i < receiptDocs.length; i += 500) {
    const batch = firestore.batch();

    receiptDocs.slice(i, i + 500).forEach((receipt) => {
      batch.delete(receipt.ref);
    });

    await batch.commit();
  }

  // Delete message
  await messageRef.delete();

  return {
    chatId,
    messageId,
    deleted: true
  };
};