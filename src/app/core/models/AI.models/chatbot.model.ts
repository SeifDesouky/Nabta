export interface ChatMessage {
    _id?: string;
    user?: string;
    userMsg: string;
    botReply: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SendMessageRequest {
    text: string;
    top_k?: number;
}

export interface SendMessageResponse {
    userMessage: string;
    botReply: string;
}

// Used locally in the UI for rendering
export interface ChatBubble {
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isLoading?: boolean;
}

export interface Section {
    title: string;
    items: { key: string; value: string }[];
}