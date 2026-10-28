export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: string; // e.g. "Available", "At work", etc.
  about?: string;
  online: boolean;
  lastSeen?: string;
  wallpaper?: string;
}

export type MessageType = 'text' | 'image' | 'audio' | 'document' | 'location' | 'call';

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  timestamp: string; // ISO string
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  audioDuration?: number; // seconds
  replyToId?: string;
  replyToContent?: string;
  replyToSenderName?: string;
  reactions?: Reaction[];
  isStarred?: boolean;
}

export interface Contact extends UserProfile {
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isFavorite?: boolean;
  isAiBot?: boolean;
  isGroup?: boolean;
  groupMembers?: string[];
  typing?: boolean;
}

export interface StatusItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'image' | 'text';
  content: string; // image URL or text
  caption?: string;
  bgColor?: string; // for text status
  timestamp: string;
  viewed: boolean;
}

export interface CallSession {
  id: string;
  contact: Contact;
  type: 'audio' | 'video';
  status: 'incoming' | 'outgoing' | 'connected' | 'ended';
  durationSeconds: number;
  isMuted: boolean;
  isVideoOff: boolean;
}

export type ChatFilter = 'all' | 'unread' | 'favorites' | 'groups';
