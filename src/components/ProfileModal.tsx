import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Phone, Info, Camera, Check, Moon, Sun, Image as ImageIcon, X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  darkMode: boolean;
  wallpaper: string;
  onSaveUser: (user: UserProfile) => void;
  onToggleDarkMode: () => void;
  onChangeWallpaper: (wallpaper: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  darkMode,
  wallpaper,
  onSaveUser,
  onToggleDarkMode,
  onChangeWallpaper,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [status, setStatus] = useState(currentUser.status);
  const [about, setAbout] = useState(currentUser.about || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      status: status.trim(),
      about: about.trim(),
      avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
        <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5" /> Profile Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-md"
              />
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setAvatar(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Tap photo to upload new avatar
            </p>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* About / Bio Status */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              About Bio
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Theme & Wallpaper Preferences */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-emerald-400" />}
                Theme Mode ({darkMode ? 'Dark' : 'Light'})
              </span>
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-bold text-emerald-400"
              >
                Toggle
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" /> Chat Background Wallpaper
              </span>
              <button
                type="button"
                onClick={() => onChangeWallpaper(wallpaper === 'default' ? 'solid' : 'default')}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-bold text-sky-400"
              >
                {wallpaper === 'default' ? 'Pattern' : 'Solid Color'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
};
