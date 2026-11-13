import {
    firestore
} from "../config/firebase";

import {
    FieldValue
} from "firebase-admin/firestore";

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
