export interface Message {
  from: 'me' | 'expert';
  text?: string;
  image?: string;
  time: string;
  read: boolean;
}

export interface Expert {
  id: number;
  name: string;
  specialty: string;
  avatar: string | null;
  initials?: string;
  status: 'online' | 'offline' | 'away';
  verified: boolean;
  messages: Message[];
}