import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  CircleDashed,
  MessageSquarePlus,
  MoreVertical,
  Moon,
  Sun,
  User,
  Star,
  Settings,
  LogOut,
  Users
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  darkMode: boolean;
  hasUnseenStories: boolean;
  onToggleDarkMode: () => void;
  onOpenStatusModal: () => void;
  onOpenProfileModal: () => void;
  onOpenNewChatModal: () => void;
  onOpenMultiUserModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  darkMode,
  hasUnseenStories,
  onToggleDarkMode,
  onOpenStatusModal,
  onOpenProfileModal,
  onOpenNewChatModal,
  onOpenMultiUserModal,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="h-16 px-4 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between shrink-0">
      {/* Profile Avatar */}
      <button
        onClick={onOpenProfileModal}
        className="relative group p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500 transition"
        title="View Profile Settings"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-800" />
      </button>

      {/* Action Icons */}
      <div className="flex items-center gap-1 sm:gap-2 text-zinc-400">
        {/* Status / Stories Button */}
        <button
          onClick={onOpenStatusModal}
          className="relative p-2.5 rounded-full hover:bg-zinc-700 transition"
          title="Status Stories"
        >
          <CircleDashed className="w-5 h-5 text-zinc-300" />
          {hasUnseenStories && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-zinc-800" />
          )}
        </button>

        {/* New Chat Button */}
        <button
          onClick={onOpenNewChatModal}
          className="p-2.5 rounded-full hover:bg-zinc-700 transition text-zinc-300"
          title="New Chat"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-full hover:bg-zinc-700 transition text-amber-400"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 rounded-full hover:bg-zinc-700 transition text-zinc-300"
            title="More Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-12 w-52 bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowMenu(false)}
            >
              <button
                onClick={onOpenProfileModal}
                className="w-full px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-3"
              >
                <User className="w-4 h-4 text-emerald-500" /> Profile Settings
              </button>

              <button
                onClick={onOpenNewChatModal}
                className="w-full px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-3"
              >
                <Users className="w-4 h-4 text-sky-400" /> New Group
              </button>

              <button
                onClick={onOpenMultiUserModal}
                className="w-full px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-3"
              >
                <Star className="w-4 h-4 text-amber-400" /> Switch / Test Account
              </button>

              <hr className="my-1 border-zinc-700" />

              <button
                onClick={onOpenProfileModal}
                className="w-full px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-3"
              >
                <Settings className="w-4 h-4 text-zinc-400" /> Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
