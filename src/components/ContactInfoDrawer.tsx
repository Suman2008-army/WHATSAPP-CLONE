import React from 'react';
import { Contact, Message } from '../types';
import {
  X,
  Phone,
  Video,
  Search,
  Bell,
  Star,
  Lock,
  VolumeX,
  Volume2,
  Image as ImageIcon,
  FileText,
  ShieldAlert,
  Trash2,
  Users
} from 'lucide-react';

interface ContactInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  messages: Message[];
  onOpenCallModal: (type: 'audio' | 'video') => void;
  onToggleMute: (contactId: string) => void;
  onClearChat: (contactId: string) => void;
}

export const ContactInfoDrawer: React.FC<ContactInfoDrawerProps> = ({
  isOpen,
  onClose,
  contact,
  messages,
  onOpenCallModal,
  onToggleMute,
  onClearChat,
}) => {
  if (!isOpen || !contact) return null;

  const mediaMessages = messages.filter((m) => m.type === 'image' || m.type === 'document');
  const starredMessages = messages.filter((m) => m.isStarred);

  return (
    <div className="w-full sm:w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col z-20 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-16 px-4 bg-zinc-800 flex items-center justify-between border-b border-zinc-700 shrink-0">
        <h2 className="font-bold text-sm text-zinc-100">
          {contact.isGroup ? 'Group Info' : 'Contact Info'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-zinc-700 rounded-full">
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Main Details */}
      <div className="p-6 text-center border-b border-zinc-800">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-28 h-28 rounded-full object-cover mx-auto mb-3 shadow-md border-2 border-emerald-500"
        />
        <h3 className="font-bold text-lg text-zinc-100">{contact.name}</h3>
        <p className="text-xs text-zinc-400 mb-4">{contact.phone}</p>

        {/* Call Action Shortcuts */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onOpenCallModal('audio')}
            className="flex flex-col items-center gap-1 text-xs text-emerald-400 p-2 hover:bg-zinc-800 rounded-xl transition"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            Audio
          </button>
          <button
            onClick={() => onOpenCallModal('video')}
            className="flex flex-col items-center gap-1 text-xs text-emerald-400 p-2 hover:bg-zinc-800 rounded-xl transition"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            Video
          </button>
        </div>
      </div>

      {/* About & Status */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-1">
        <h4 className="text-[11px] font-semibold uppercase text-gray-400">About</h4>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {contact.about || contact.status}
        </p>
      </div>

      {/* Shared Media, Docs and Links */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#00a884]" /> Media, Docs ({mediaMessages.length})
          </h4>
        </div>

        {mediaMessages.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No media shared yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {mediaMessages.slice(0, 6).map((m) => (
              <div key={m.id} className="aspect-square bg-gray-100 dark:bg-[#202c33] rounded-lg overflow-hidden">
                {m.type === 'image' && m.mediaUrl ? (
                  <img src={m.mediaUrl} alt="media" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 text-[10px] text-gray-400">
                    <FileText className="w-6 h-6 text-[#00a884]" />
                    <span className="truncate w-full text-center">{m.fileName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings & Options */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => onToggleMute(contact.id)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 transition"
        >
          <span className="flex items-center gap-3">
            {contact.isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Bell className="w-4 h-4 text-[#00a884]" />}
            Mute Notifications
          </span>
          <span className="text-xs font-bold text-gray-400">{contact.isMuted ? 'Muted' : 'On'}</span>
        </button>

        <button
          onClick={() => onClearChat(contact.id)}
          className="w-full flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 rounded-xl text-sm font-medium transition"
        >
          <Trash2 className="w-4 h-4" /> Clear Messages
        </button>
      </div>

      {/* Encryption Note */}
      <div className="mt-auto p-4 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-[#00a884]" /> End-to-end encrypted
      </div>
    </div>
  );
};
