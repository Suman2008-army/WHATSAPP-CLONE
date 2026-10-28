import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message, UserProfile } from '../types';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Smile,
  Reply,
  Star,
  Copy,
  Trash2,
  Play,
  Pause,
  FileText,
  Download,
  Info,
  MapPin,
  Bot,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ChatAreaProps {
  contact: Contact | null;
  currentUser: UserProfile;
  messages: Message[];
  wallpaper: string;
  onSendMessage: (content: string, type?: Message['type'], extra?: Partial<Message>) => void;
  onBackToSidebar: () => void;
  onOpenCallModal: (type: 'audio' | 'video') => void;
  onOpenContactInfo: () => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onStarMessage: (messageId: string) => void;
  onReplyToMessage: (message: Message) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const ChatArea: React.FC<ChatAreaProps> = ({
  contact,
  currentUser,
  messages,
  wallpaper,
  onSendMessage,
  onBackToSidebar,
  onOpenCallModal,
  onOpenContactInfo,
  onReactMessage,
  onDeleteMessage,
  onStarMessage,
  onReplyToMessage,
  replyingTo,
  onCancelReply,
}) => {
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, contact?.typing]);

  // Fetch AI smart reply suggestions when last message is from receiver
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId !== currentUser.id) {
      fetchSmartReplies(lastMsg.content);
    } else {
      setSmartReplies([]);
    }
  }, [messages, currentUser.id]);

  const fetchSmartReplies = async (text: string) => {
    try {
      const res = await fetch('/api/smart-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessage: text }),
      });
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSmartReplies(data.suggestions);
      }
    } catch {
      setSmartReplies(['Sounds good! 👍', 'Thanks! 😊', 'Talk soon!']);
    }
  };

  if (!contact) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-zinc-950 border-l border-zinc-800 p-8 text-center select-none chat-bg">
        <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mb-6">
          <Bot className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">
          Message Karo
        </h2>
        <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-6">
          Send and receive messages in real-time, view status stories, record voice notes, and chat with AI assistants seamlessly.
        </p>
        <div className="px-4 py-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded-full text-xs font-semibold">
          🔒 End-to-end Encrypted Messaging Workspace
        </div>
      </div>
    );
  }

  const togglePlayAudio = (msgId: string) => {
    if (activeAudioId === msgId) {
      setIsPlayingAudio(!isPlayingAudio);
    } else {
      setActiveAudioId(msgId);
      setIsPlayingAudio(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatMsgTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden chat-bg">
      {/* Active Chat Header */}
      <div className="h-16 px-6 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBackToSidebar}
            className="md:hidden p-1.5 hover:bg-zinc-700 rounded-full transition text-zinc-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={onOpenContactInfo}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {contact.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-800" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-zinc-100 truncate group-hover:text-emerald-400 transition">
                {contact.name}
              </h3>
              <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider truncate">
                {contact.typing ? (
                  <span className="text-emerald-400 animate-pulse">typing...</span>
                ) : contact.online ? (
                  'Online'
                ) : (
                  contact.lastSeen || 'Offline'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 text-zinc-400">
          <button
            onClick={() => onOpenCallModal('video')}
            className="p-2.5 rounded-full hover:bg-zinc-700 transition"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenCallModal('audio')}
            className="p-2.5 rounded-full hover:bg-zinc-700 transition"
            title="Voice Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenContactInfo}
            className="p-2.5 rounded-full hover:bg-zinc-700 transition"
            title="Contact Info"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 z-10 scrollbar-thin">
        {/* Encrypted Disclaimer / Today Divider */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <span className="bg-zinc-800 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full text-zinc-400 border border-zinc-700">
            Today
          </span>
          <span className="px-3 py-1 bg-zinc-900/80 text-zinc-400 text-[11px] rounded-lg border border-zinc-800 shadow-sm max-w-md text-center">
            🔒 Messages are end-to-end encrypted in this Message Karo workspace.
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isHovered = hoveredMsgId === msg.id;

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
            >
              <div
                className={`max-w-[75%] sm:max-w-[65%] p-3 rounded-2xl message-shadow text-sm leading-relaxed relative transition ${
                  isMe
                    ? 'bg-emerald-800 text-white rounded-tr-none'
                    : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50'
                }`}
              >
                {/* Message Context Hover Reactions Bar */}
                {isHovered && (
                  <div
                    className={`absolute -top-9 ${
                      isMe ? 'right-0' : 'left-0'
                    } bg-zinc-800 rounded-full shadow-xl border border-zinc-700 px-2 py-1 flex items-center gap-1 z-20 animate-in fade-in zoom-in duration-100`}
                  >
                    {EMOJI_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onReactMessage(msg.id, emoji)}
                        className="hover:scale-125 transition text-base"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="w-px h-4 bg-zinc-700 my-auto mx-1" />
                    <button
                      onClick={() => onReplyToMessage(msg)}
                      className="p-1 hover:text-emerald-400 text-zinc-400"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="p-1 hover:text-emerald-400 text-zinc-400"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onStarMessage(msg.id)}
                      className="p-1 hover:text-amber-400 text-zinc-400"
                      title="Star"
                    >
                      <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1 hover:text-red-400 text-zinc-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Reply Preview inside bubble */}
                {msg.replyToContent && (
                  <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-4 border-emerald-400 text-xs">
                    <span className="font-semibold text-emerald-400 block">
                      {msg.replyToSenderName || 'Reply'}
                    </span>
                    <span className="truncate block text-zinc-300">
                      {msg.replyToContent}
                    </span>
                  </div>
                )}

                {/* Image Media Message */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div className="mb-1.5 rounded-lg overflow-hidden cursor-pointer border border-black/20">
                    <img
                      src={msg.mediaUrl}
                      alt="attachment"
                      onClick={() => setLightboxImage(msg.mediaUrl || null)}
                      className="max-h-60 w-full object-cover hover:scale-105 transition"
                    />
                  </div>
                )}

                {/* Audio Voice Note Message */}
                {msg.type === 'audio' && (
                  <div className="flex items-center gap-3 py-1 pr-2 min-w-[200px]">
                    <button
                      onClick={() => togglePlayAudio(msg.id)}
                      className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow hover:bg-emerald-400 transition"
                    >
                      {activeAudioId === msg.id && isPlayingAudio ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full bg-emerald-400 transition-all duration-300 ${
                            activeAudioId === msg.id && isPlayingAudio ? 'w-2/3' : 'w-0'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-300 font-mono">
                        Voice Note ({msg.audioDuration || 3}s)
                      </span>
                    </div>
                  </div>
                )}

                {/* Document Attachment Message */}
                {msg.type === 'document' && (
                  <div className="flex items-center gap-3 p-2 bg-black/20 rounded-lg mb-1 border border-zinc-700/50">
                    <FileText className="w-8 h-8 text-emerald-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs truncate">{msg.fileName || 'Document.pdf'}</p>
                      <p className="text-[10px] text-zinc-400">{msg.fileSize || '1.2 MB'} • PDF Document</p>
                    </div>
                    <button className="p-1.5 hover:bg-white/10 rounded-full">
                      <Download className="w-4 h-4 text-zinc-300" />
                    </button>
                  </div>
                )}

                {/* Text Content */}
                {msg.content && <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>}

                {/* Reactions Badge */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2 right-2 bg-zinc-800 px-1.5 py-0.5 rounded-full text-xs shadow-md border border-zinc-700 flex items-center gap-0.5">
                    {msg.reactions.map((r, i) => (
                      <span key={i}>{r.emoji}</span>
                    ))}
                  </div>
                )}

                {/* Timestamp & Read Ticks Footer */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-400 mt-1 select-none">
                  {msg.isStarred && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                  <span>{formatMsgTime(msg.timestamp)}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Contact Typing Indicator */}
        {contact.typing && (
          <div className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-700 w-max shadow-sm animate-pulse">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1 text-zinc-400">{contact.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Smart Quick Reply Suggestions Bar */}
      {smartReplies.length > 0 && (
        <div className="px-4 py-2 bg-zinc-900/90 backdrop-blur z-20 flex items-center gap-2 overflow-x-auto border-t border-zinc-800">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3" /> Quick Reply:
          </span>
          {smartReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(reply)}
              className="px-3 py-1 bg-zinc-800 hover:bg-emerald-600 hover:text-white text-xs font-medium text-zinc-200 rounded-full shadow-sm border border-zinc-700 transition whitespace-nowrap"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Images */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Expanded view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
