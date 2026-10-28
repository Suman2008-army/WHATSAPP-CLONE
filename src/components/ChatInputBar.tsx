import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import {
  Smile,
  Paperclip,
  Send,
  Mic,
  X,
  Image as ImageIcon,
  FileText,
  MapPin,
  Camera,
  Trash2,
  Check
} from 'lucide-react';

interface ChatInputBarProps {
  onSendMessage: (content: string, type?: Message['type'], extra?: Partial<Message>) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  onTypingStatus: (isTyping: boolean) => void;
}

const CATEGORIZED_EMOJIS = {
  'Popular': ['😊', '😂', '🔥', '❤️', '👍', '🙏', '😍', '✨', '🎉', '🚀', '💯', '😎'],
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😭', '😉', '😗', '😋', '🥳'],
  'Gestures': ['👍', '👎', '👏', '🙌', '🙏', '🤝', '💪', '✌️', '🤟', '🤛', '👋', '🤞'],
  'Hearts & Symbols': ['❤️', '💖', '💙', '💚', '💛', '🧡', '💜', '💥', '⭐', '✨', '⚡', '🎉'],
};

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  replyingTo,
  onCancelReply,
  onTypingStatus,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecordingTimer, setAudioRecordingTimer] = useState(0);
  const [emojiSearch, setEmojiSearch] = useState('');

  const timerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio Recording Timer effect
  useEffect(() => {
    if (isRecordingAudio) {
      setAudioRecordingTimer(0);
      timerRef.current = setInterval(() => {
        setAudioRecordingTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecordingAudio]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTypingStatus(e.target.value.trim().length > 0);
  };

  const handleSend = () => {
    if (!text.trim()) return;

    const extra = replyingTo
      ? {
          replyToId: replyingTo.id,
          replyToContent: replyingTo.content,
          replyToSenderName: replyingTo.senderId === 'user_me' ? 'You' : 'Contact',
        }
      : {};

    onSendMessage(text.trim(), 'text', extra);
    setText('');
    onCancelReply();
    setShowEmojiPicker(false);
    onTypingStatus(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingAudio(false);
    const duration = audioRecordingTimer || 3;
    onSendMessage('Voice Note', 'audio', { audioDuration: duration });
    setAudioRecordingTimer(0);
  };

  const handleCancelVoiceNote = () => {
    setIsRecordingAudio(false);
    setAudioRecordingTimer(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'image') {
        onSendMessage('Image Attachment', 'image', { mediaUrl: dataUrl });
      } else {
        onSendMessage(`File: ${file.name}`, 'document', {
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        });
      }
    };
    reader.readAsDataURL(file);
    setShowAttachmentMenu(false);
  };

  const handleShareLocation = () => {
    onSendMessage('📍 Shared Current Location: Goa Beach Resort, India', 'text');
    setShowAttachmentMenu(false);
  };

  return (
    <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col gap-2 z-10 shrink-0">
      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="p-2 bg-zinc-800 rounded-lg border-l-4 border-emerald-500 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="min-w-0 pr-2">
            <span className="text-xs font-bold text-emerald-500 block">
              Replying to {replyingTo.senderId === 'user_me' ? 'Yourself' : 'Message'}
            </span>
            <p className="text-xs text-zinc-300 truncate">{replyingTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-zinc-700 rounded-full text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Keyboard Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-700 p-3 w-80 max-h-72 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-zinc-700">
            <span className="text-xs font-bold text-emerald-500">Emojis & Stickers</span>
            <button onClick={() => setShowEmojiPicker(false)}>
              <X className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(CATEGORIZED_EMOJIS).map(([category, list]) => (
              <div key={category}>
                <h4 className="text-[10px] font-semibold uppercase text-zinc-400 mb-1">{category}</h4>
                <div className="grid grid-cols-6 gap-1">
                  {list.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddEmoji(emoji)}
                      className="text-xl p-1.5 hover:bg-zinc-700 rounded-lg transition hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Menu Popup */}
      {showAttachmentMenu && (
        <div className="absolute bottom-16 left-12 bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-700 p-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
          <label className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 rounded-xl cursor-pointer">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>Photos & Videos</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'image')}
            />
          </label>

          <label className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 rounded-xl cursor-pointer">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Document File</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'document')}
            />
          </label>

          <button
            onClick={handleShareLocation}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 rounded-xl text-left"
          >
            <MapPin className="w-4 h-4 text-red-400" />
            <span>Share Location</span>
          </button>
        </div>
      )}

      {/* Input / Voice Recording Bar Controls */}
      {isRecordingAudio ? (
        <div className="flex items-center justify-between gap-3 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/30">
          <div className="flex items-center gap-3 text-red-400">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="text-sm font-semibold font-mono">
              Recording: 0:{audioRecordingTimer < 10 ? '0' : ''}
              {audioRecordingTimer}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelVoiceNote}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded-full"
              title="Cancel"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendVoiceNote}
              className="p-2.5 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-500"
              title="Send Voice Note"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* Action icons left */}
          <div className="flex gap-3 text-zinc-400 shrink-0">
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachmentMenu(false);
              }}
              className="p-1 hover:text-zinc-200 transition"
              title="Emojis"
            >
              <Smile className="w-6 h-6" />
            </button>

            <button
              onClick={() => {
                setShowAttachmentMenu(!showAttachmentMenu);
                setShowEmojiPicker(false);
              }}
              className="p-1 hover:text-zinc-200 transition"
              title="Attach File"
            >
              <Paperclip className="w-6 h-6" />
            </button>
          </div>

          {/* Main Text Input */}
          <div className="flex-1 bg-zinc-800 rounded-xl px-4 py-2.5 border border-zinc-700">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none text-zinc-100 placeholder-zinc-500"
            />
          </div>

          {/* Voice Record / Send Button */}
          {text.trim().length > 0 ? (
            <button
              onClick={handleSend}
              className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition-colors shadow-md shrink-0 cursor-pointer"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecordingAudio(true)}
              className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition-colors shadow-md shrink-0 cursor-pointer"
              title="Hold to Record Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
