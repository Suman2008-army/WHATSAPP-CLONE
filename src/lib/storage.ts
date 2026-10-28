import { Contact, Message, StatusItem, UserProfile } from '../types';
import { CURRENT_USER, INITIAL_CONTACTS, INITIAL_MESSAGES, INITIAL_STATUS_STORIES } from './mockData';

const USER_KEY = 'message_karo_user';
const CONTACTS_KEY = 'message_karo_contacts';
const MESSAGES_KEY = 'message_karo_messages';
const STATUS_KEY = 'message_karo_status';
const DARK_MODE_KEY = 'message_karo_darkmode';
const WALLPAPER_KEY = 'message_karo_wallpaper';

// Setup BroadcastChannel for real-time cross-tab synchronization
let realtimeChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  realtimeChannel = new BroadcastChannel('message_karo_realtime');
}

export function getCurrentUser(): UserProfile {
  const data = localStorage.getItem(USER_KEY);
  if (!data) {
    localStorage.setItem(USER_KEY, JSON.stringify(CURRENT_USER));
    return CURRENT_USER;
  }
  return JSON.parse(data);
}

export function saveCurrentUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  broadcastEvent('USER_UPDATED', user);
}

export function getContacts(): Contact[] {
  const data = localStorage.getItem(CONTACTS_KEY);
  if (!data) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(INITIAL_CONTACTS));
    return INITIAL_CONTACTS;
  }
  return JSON.parse(data);
}

export function saveContacts(contacts: Contact[]): void {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  broadcastEvent('CONTACTS_UPDATED', contacts);
}

export function getMessages(): Record<string, Message[]> {
  const data = localStorage.getItem(MESSAGES_KEY);
  if (!data) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(INITIAL_MESSAGES));
    return INITIAL_MESSAGES;
  }
  return JSON.parse(data);
}

export function saveMessages(messages: Record<string, Message[]>): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getStatusStories(): StatusItem[] {
  const data = localStorage.getItem(STATUS_KEY);
  if (!data) {
    localStorage.setItem(STATUS_KEY, JSON.stringify(INITIAL_STATUS_STORIES));
    return INITIAL_STATUS_STORIES;
  }
  return JSON.parse(data);
}

export function saveStatusStories(stories: StatusItem[]): void {
  localStorage.setItem(STATUS_KEY, JSON.stringify(stories));
  broadcastEvent('STATUS_UPDATED', stories);
}

export function getDarkMode(): boolean {
  const data = localStorage.getItem(DARK_MODE_KEY);
  if (data === null) {
    // Default to true (Dark Mode preferred for modern WhatsApp look)
    return true;
  }
  return JSON.parse(data);
}

export function saveDarkMode(isDark: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDark));
  broadcastEvent('THEME_CHANGED', isDark);
}

export function getWallpaper(): string {
  return localStorage.getItem(WALLPAPER_KEY) || 'default';
}

export function saveWallpaper(wallpaper: string): void {
  localStorage.setItem(WALLPAPER_KEY, wallpaper);
  broadcastEvent('WALLPAPER_CHANGED', wallpaper);
}

// Broadcast real-time events to other open tabs
export function broadcastEvent(type: string, payload: any): void {
  if (realtimeChannel) {
    realtimeChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

export function subscribeRealtimeEvents(callback: (event: { type: string; payload: any }) => void) {
  if (!realtimeChannel) return () => {};

  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      callback(e.data);
    }
  };

  realtimeChannel.addEventListener('message', handleMessage);
  return () => {
    realtimeChannel?.removeEventListener('message', handleMessage);
  };
}

// Helper to add message & update contacts last preview + unread count
export async function sendMessageToContact(
  contactId: string,
  messageData: Partial<Message>,
  onAiResponseTrigger?: (responseMessage: Message) => void
): Promise<Message> {
  const currentUser = getCurrentUser();
  const allMessages = getMessages();
  const contactMessages = allMessages[contactId] || [];

  const newMessage: Message = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    senderId: currentUser.id,
    receiverId: contactId,
    content: messageData.content || '',
    type: messageData.type || 'text',
    timestamp: new Date().toISOString(),
    status: 'sent',
    mediaUrl: messageData.mediaUrl,
    fileName: messageData.fileName,
    fileSize: messageData.fileSize,
    audioDuration: messageData.audioDuration,
    replyToId: messageData.replyToId,
    replyToContent: messageData.replyToContent,
    replyToSenderName: messageData.replyToSenderName,
    reactions: [],
  };

  const updatedContactMsgs = [...contactMessages, newMessage];
  allMessages[contactId] = updatedContactMsgs;
  saveMessages(allMessages);

  // Update contact list last message preview & timestamp
  const contacts = getContacts();
  const targetContact = contacts.find((c) => c.id === contactId);

  if (targetContact) {
    saveContacts(contacts);
  }

  broadcastEvent('NEW_MESSAGE', { contactId, message: newMessage });

  // Update message status to 'delivered' shortly after
  setTimeout(() => {
    newMessage.status = 'delivered';
    saveMessages(allMessages);
    broadcastEvent('MESSAGE_STATUS_UPDATE', { contactId, messageId: newMessage.id, status: 'delivered' });
  }, 1000);

  // Auto-reply logic for AI Bot or Contact Auto-reply simulation
  if (targetContact && (targetContact.isAiBot || contactId === 'contact_aarav' || contactId === 'contact_priya')) {
    triggerContactAutoReply(contactId, targetContact, messageData.content || '', updatedContactMsgs, onAiResponseTrigger);
  }

  return newMessage;
}

// Simulated real-time response or Gemini AI Bot
async function triggerContactAutoReply(
  contactId: string,
  contact: Contact,
  userMessageContent: string,
  conversationHistory: Message[],
  onTrigger?: (msg: Message) => void
) {
  // 1. Show "typing..." indicator
  broadcastEvent('TYPING_STATUS', { contactId, isTyping: true });

  const delayMs = contact.isAiBot ? 1200 : 2500;

  setTimeout(async () => {
    let replyText = '';

    if (contact.isAiBot) {
      try {
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactName: contact.name,
            contactBio: contact.about,
            lastMessages: conversationHistory.slice(-5).map((m) => ({
              senderName: m.senderId === 'user_me' ? 'Suman' : contact.name,
              content: m.content,
            })),
            prompt: userMessageContent,
          }),
        });
        const data = await res.json();
        replyText = data.reply || 'Hey! How can I assist you with Message Karo today? 😊';
      } catch {
        replyText = `Hey there! Received: "${userMessageContent}". Message Karo AI is working smoothly! 🚀`;
      }
    } else if (contactId === 'contact_aarav') {
      const aaravReplies = [
        'Awesome! Thanks for sharing. Let me check it out right now! 👍',
        'Got it! That looks really smooth. Great job on the Message Karo implementation!',
        'Sounds good! Let us meet on voice call in a bit.',
        'Super cool! 🚀',
      ];
      replyText = aaravReplies[Math.floor(Math.random() * aaravReplies.length)];
    } else if (contactId === 'contact_priya') {
      const priyaReplies = [
        'Love this! Perfect design touch. ✨',
        'I am reviewing the new UI components. Message Karo is looking super clean!',
        'Awesome! Send over any more designs whenever ready. 🎨',
      ];
      replyText = priyaReplies[Math.floor(Math.random() * priyaReplies.length)];
    }

    broadcastEvent('TYPING_STATUS', { contactId, isTyping: false });

    const allMessages = getMessages();
    const currentMsgs = allMessages[contactId] || [];

    const replyMsg: Message = {
      id: 'msg_reply_' + Date.now(),
      senderId: contactId,
      receiverId: 'user_me',
      content: replyText,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };

    allMessages[contactId] = [...currentMsgs, replyMsg];
    saveMessages(allMessages);

    // Update unread count if contact isn't currently active
    const contacts = getContacts();
    const updatedContact = contacts.find((c) => c.id === contactId);
    if (updatedContact) {
      updatedContact.unreadCount += 1;
      saveContacts(contacts);
    }

    broadcastEvent('NEW_MESSAGE', { contactId, message: replyMsg });
    if (onTrigger) onTrigger(replyMsg);
  }, delayMs);
}
