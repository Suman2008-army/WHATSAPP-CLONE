import React, { useState } from 'react';
import { ChatFilter, Contact, Message } from '../types';
import {
  Search,
  Check,
  CheckCheck,
  Pin,
  Bot,
  Users,
  Volume2,
  VolumeX,
  X,
  Mic,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface SidebarProps {
  contacts: Contact[];
  messages: Record<string, Message[]>;
  selectedContactId: string | null;
  activeFilter: ChatFilter;
  onSelectContact: (contact: Contact) => void;
  onFilterChange: (filter: ChatFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  contacts,
  messages,
  selectedContactId,
  activeFilter,
  onSelectContact,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const filteredContacts = contacts.filter((contact) => {
    // Search query match
    const nameMatch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = contact.phone.toLowerCase().includes(searchQuery.toLowerCase());
    if (!nameMatch && !phoneMatch) return false;

    // Filter match
    if (activeFilter === 'unread') return contact.unreadCount > 0;
    if (activeFilter === 'favorites') return contact.isFavorite;
    if (activeFilter === 'groups') return contact.isGroup;
    return true;
  });

  // Sort contacts: pinned first, then by last message timestamp
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    const msgsA = messages[a.id] || [];
    const msgsB = messages[b.id] || [];
    const lastA = msgsA[msgsA.length - 1]?.timestamp || '0';
    const lastB = msgsB[msgsB.length - 1]?.timestamp || '0';

    return new Date(lastB).getTime() - new Date(lastA).getTime();
  });

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const renderLastMessagePreview = (contactId: string) => {
    const msgs = messages[contactId] || [];
    if (msgs.length === 0) return 'No messages yet';

    const lastMsg = msgs[msgs.length - 1];
    const isMe = lastMsg.senderId === 'user_me';

    return (
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate">
        {isMe && (
          <span className="shrink-0">
            {lastMsg.status === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
            ) : lastMsg.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-gray-400" />
            )}
          </span>
        )}

        {lastMsg.type === 'image' && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ImageIcon className="w-3.5 h-3.5" /> Photo
          </span>
        )}
        {lastMsg.type === 'audio' && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Mic className="w-3.5 h-3.5" /> Voice Note ({lastMsg.audioDuration || 3}s)
          </span>
        )}
        {lastMsg.type === 'document' && (
          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
            <FileText className="w-3.5 h-3.5" /> {lastMsg.fileName || 'Document'}
          </span>
        )}
        {lastMsg.type === 'text' && (
          <span className="truncate">{lastMsg.content}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 bg-zinc-900">
        <div className="relative flex items-center bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
          <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="p-1 hover:bg-zinc-700 rounded-full">
              <X className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-zinc-800">
        {(['all', 'unread', 'favorites', 'groups'] as ChatFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition ${
              activeFilter === filter
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Chat Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
        {sortedContacts.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No chats found matching your filter.
          </div>
        ) : (
          sortedContacts.map((contact) => {
            const msgs = messages[contact.id] || [];
            const lastMsg = msgs[msgs.length - 1];
            const isSelected = selectedContactId === contact.id;

            return (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className={`flex items-center p-3 cursor-pointer transition relative group ${
                  isSelected
                    ? 'bg-zinc-800 border-l-4 border-emerald-500'
                    : 'hover:bg-zinc-800/80'
                }`}
              >
                {/* Contact Avatar */}
                <div className="relative shrink-0 mr-3">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                  )}
                  {contact.isAiBot && (
                    <span className="absolute -top-1 -right-1 bg-sky-500 text-white rounded-full p-0.5" title="AI Bot">
                      <Bot className="w-3 h-3" />
                    </span>
                  )}
                  {contact.isGroup && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5" title="Group Chat">
                      <Users className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Contact Details */}
                <div className="flex-1 min-w-0 border-b border-zinc-800/80 pb-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-sm text-zinc-100 truncate flex items-center gap-1.5">
                      {contact.name}
                      {contact.isMuted && (
                        <VolumeX className="w-3 h-3 text-zinc-500 shrink-0" />
                      )}
                    </h3>
                    {lastMsg && (
                      <span className="text-[10px] text-emerald-500 font-medium uppercase shrink-0">
                        {formatTimestamp(lastMsg.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    {contact.typing ? (
                      <span className="text-xs text-emerald-500 font-medium animate-pulse">
                        typing...
                      </span>
                    ) : (
                      renderLastMessagePreview(contact.id)
                    )}

                    {/* Unread & Pin Badges */}
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      {contact.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-zinc-500 transform rotate-45" />
                      )}
                      {contact.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full min-w-[18px] text-center shadow-sm">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
