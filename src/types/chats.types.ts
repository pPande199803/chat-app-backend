
export interface CreateChatRequest {
    userAId: string;
    userBId: string;
}

export interface SendMessageRequest {
    senderId: string;
    text: string;
}

export interface MarkReadRequest {
    userId: string;
}

export interface LastSeenRequest {
    userId: string;
    messageId: string;
}

export interface ChatMessage {
    messageId: string;
    senderId: string;
    text: string;
    timestamp: FirebaseFirestore.Timestamp;
}
