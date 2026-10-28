import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera, Check, MessageSquare, Phone, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveUser: (user: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [status, setStatus] = useState(currentUser.status);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveUser({
      ...currentUser,
      name: name.trim(),
      phone: phone.trim() || '+91 98765 43210',
      avatar,
      status: status.trim() || 'Hey there! I am using Message Karo 🚀',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
        {/* Header Banner */}
        <div className="bg-emerald-600 p-6 text-white text-center relative">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to Message Karo</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Setup your profile to start chatting in real-time
          </p>
        </div>

        {/* Profile Setup Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Selector */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <img
                src={avatar}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-md"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Quick Avatar Pickers */}
            <p className="text-xs text-zinc-400 mt-2 mb-1">
              Choose an avatar preset:
            </p>
            <div className="flex gap-2">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition ${
                    avatar === url ? 'border-emerald-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-400" /> Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suman Ghosh"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* About / Status */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              About / Bio Status
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Hey there! I am using Message Karo 🚀"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Save Profile & Start Messaging
          </button>
        </form>
      </div>
    </div>
  );
};
