export interface UserRef {
  _id: string;
  name: string;
  role: 'farmer' | 'expert';
}

export interface Conversation {
  _id: string;
  farmer: UserRef;
  expert: UserRef;
  updatedAt: string;
  lastMsg?: string; // هنضيفه لو عملنا populate
}

export interface Message {
  _id?: string;
  conversation: string;
  sender: string;       // userId
  text?: string;
  image?: string;
  createdAt?: Date;
  from?: 'me' | 'them'; // للعرض بس
}

// export interface Expert {
//   id: number;
//   name: string;
//   specialty: string;
//   avatar: string | null;
//   initials?: string;
//   status: 'online' | 'offline' | 'away';
//   verified: boolean;
//   messages: Message[];
// }