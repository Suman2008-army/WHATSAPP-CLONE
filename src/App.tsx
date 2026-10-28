/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChatFilter, Contact, Message, StatusItem, UserProfile } from './types';
import {
  getCurrentUser,
  saveCurrentUser,
  getContacts,
  saveContacts,
  getMessages,
  saveMessages,
  getStatusStories,
  saveStatusStories,
  getDarkMode,
  saveDarkMode,
  getWallpaper,
  saveWallpaper,
  sendMessageToContact,
  subscribeRealtimeEvents,
  broadcastEvent
} from './lib/storage';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInputBar } from './components/ChatInputBar';
import { AuthModal } from './components/AuthModal';
import { StatusStoriesModal } from './components/StatusStoriesModal';
import { ProfileModal } from './components/ProfileModal';
import { ContactInfoDrawer } from './components/ContactInfoDrawer';
import { CallModal } from './components/CallModal';
import { MultiUserSwitcher } from './components/MultiUserSwitcher';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [contacts, setContacts] = useState<Contact[]>(getContacts());
  const [messages, setMessages] = useState<Record<string, Message[]>>(getMessages());
  const [statusStories, setStatusStories] = useState<StatusItem[]>(getStatusStories());
  const [selectedContactId, setSelectedContactId] = useState<string | null>(contacts[0]?.id || null);
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');
  const [darkMode, setDarkMode] = useState<boolean>(getDarkMode());
  const [wallpaper, setWallpaper] = useState<string>(getWallpaper());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Modals & Drawer States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [isMultiUserOpen, setIsMultiUserOpen] = useState(false);
  const [callSession, setCallSession] = useState<{
    isOpen: boolean;
    contact: Contact | null;
    type: 'audio' | 'video';
  }>({
    isOpen: false,
    contact: null,
    type: 'audio',
  });

  // Apply dark mode class on root document body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Subscribe to real-time events across browser tabs
  useEffect(() => {
    const unsubscribe = subscribeRealtimeEvents((event) => {
      if (event.type === 'NEW_MESSAGE' || event.type === 'MESSAGE_STATUS_UPDATE') {
        setMessages(getMessages());
        setContacts(getContacts());
      } else if (event.type === 'USER_UPDATED') {
        setCurrentUser(getCurrentUser());
      } else if (event.type === 'CONTACTS_UPDATED') {
        setContacts(getContacts());
      } else if (event.type === 'STATUS_UPDATED') {
        setStatusStories(getStatusStories());
      } else if (event.type === 'TYPING_STATUS') {
        const { contactId, isTyping } = event.payload;
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, typing: isTyping } : c))
        );
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(contact.id);
    // Clear unread count for this contact
    if (contact.unreadCount > 0) {
      const updated = contacts.map((c) =>
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      );
      setContacts(updated);
      saveContacts(updated);
    }
  };

  const handleSendMessage = async (
    content: string,
    type: Message['type'] = 'text',
    extra?: Partial<Message>
  ) => {
    if (!selectedContactId) return;

    await sendMessageToContact(selectedContactId, {
      content,
      type,
      ...extra,
    });

    setMessages(getMessages());
    setContacts(getContacts());
  };

  const handleTypingStatus = (isTyping: boolean) => {
    if (selectedContactId) {
      broadcastEvent('TYPING_STATUS', { contactId: selectedContactId, isTyping });
    }
  };

  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!selectedContactId) return;
    const allMsgs = getMessages();
    const currentMsgs = allMsgs[selectedContactId] || [];

    const updated = currentMsgs.map((msg) => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        return {
          ...msg,
          reactions: [...reactions, { emoji, userId: currentUser.id }],
        };
      }
      return msg;
    });

    allMsgs[selectedContactId] = updated;
    saveMessages(allMsgs);
    setMessages({ ...allMsgs });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedContactId) return;
    const allMsgs = getMessages();
    const currentMsgs = allMsgs[selectedContactId] || [];

    const updated = currentMsgs.filter((m) => m.id !== messageId);
    allMsgs[selectedContactId] = updated;
    saveMessages(allMsgs);
    setMessages({ ...allMsgs });
  };

  const handleStarMessage = (messageId: string) => {
    if (!selectedContactId) return;
    const allMsgs = getMessages();
    const currentMsgs = allMsgs[selectedContactId] || [];

    const updated = currentMsgs.map((m) =>
      m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
    );

    allMsgs[selectedContactId] = updated;
    saveMessages(allMsgs);
    setMessages({ ...allMsgs });
  };

  const handleSaveUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);
  };

  const handleToggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveDarkMode(newMode);
  };

  const handleChangeWallpaper = (newWallpaper: string) => {
    setWallpaper(newWallpaper);
    saveWallpaper(newWallpaper);
  };

  const handleAddStatus = (newStatus: Partial<StatusItem>) => {
    const updated = [
      {
        id: 'status_' + Date.now(),
        userId: newStatus.userId || currentUser.id,
        userName: newStatus.userName || currentUser.name,
        userAvatar: newStatus.userAvatar || currentUser.avatar,
        type: newStatus.type || 'text',
        content: newStatus.content || '',
        bgColor: newStatus.bgColor,
        timestamp: new Date().toISOString(),
        viewed: false,
      } as StatusItem,
      ...statusStories,
    ];
    setStatusStories(updated);
    saveStatusStories(updated);
  };

  const handleToggleMuteContact = (contactId: string) => {
    const updated = contacts.map((c) =>
      c.id === contactId ? { ...c, isMuted: !c.isMuted } : c
    );
    setContacts(updated);
    saveContacts(updated);
  };

  const handleClearChat = (contactId: string) => {
    const allMsgs = getMessages();
    allMsgs[contactId] = [];
    saveMessages(allMsgs);
    setMessages({ ...allMsgs });
  };

  const handleSwitchUserIdentity = (contact: Contact) => {
    const newUserProfile: UserProfile = {
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      avatar: contact.avatar,
      status: contact.status,
      about: contact.about,
      online: true,
    };
    setCurrentUser(newUserProfile);
    saveCurrentUser(newUserProfile);
  };

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || null;
  const currentChatMessages = selectedContactId ? messages[selectedContactId] || [] : [];
  const hasUnseenStories = statusStories.some((s) => !s.viewed);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans antialiased select-none">
      {/* Outer App Frame Container */}
      <div className="w-full h-full max-w-[1600px] mx-auto flex overflow-hidden shadow-2xl relative bg-zinc-900 border border-zinc-800">
        {/* Left Sidebar: Contact List & User Header (Responsive hide on mobile when contact selected) */}
        <div
          className={`${
            selectedContactId ? 'hidden md:flex' : 'flex'
          } w-full md:w-96 lg:w-[400px] flex-col h-full border-r border-zinc-800 shrink-0 z-10 bg-zinc-900`}
        >
          <Header
            currentUser={currentUser}
            darkMode={darkMode}
            hasUnseenStories={hasUnseenStories}
            onToggleDarkMode={handleToggleDarkMode}
            onOpenStatusModal={() => setIsStatusModalOpen(true)}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onOpenNewChatModal={() => setIsAuthOpen(true)}
            onOpenMultiUserModal={() => setIsMultiUserOpen(true)}
          />

          <Sidebar
            contacts={contacts}
            messages={messages}
            selectedContactId={selectedContactId}
            activeFilter={activeFilter}
            onSelectContact={handleSelectContact}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Main Chat Window (Responsive show on mobile when contact selected) */}
        <div
          className={`${
            !selectedContactId ? 'hidden md:flex' : 'flex'
          } flex-1 flex-col h-full relative overflow-hidden`}
        >
          <ChatArea
            contact={selectedContact}
            currentUser={currentUser}
            messages={currentChatMessages}
            wallpaper={wallpaper}
            onSendMessage={handleSendMessage}
            onBackToSidebar={() => setSelectedContactId(null)}
            onOpenCallModal={(type) =>
              setCallSession({ isOpen: true, contact: selectedContact, type })
            }
            onOpenContactInfo={() => setIsContactInfoOpen(true)}
            onReactMessage={handleReactMessage}
            onDeleteMessage={handleDeleteMessage}
            onStarMessage={handleStarMessage}
            onReplyToMessage={(msg) => setReplyingTo(msg)}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />

          {selectedContact && (
            <ChatInputBar
              onSendMessage={handleSendMessage}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onTypingStatus={handleTypingStatus}
            />
          )}
        </div>

        {/* Right Drawer: Contact Details Info */}
        <ContactInfoDrawer
          isOpen={isContactInfoOpen}
          onClose={() => setIsContactInfoOpen(false)}
          contact={selectedContact}
          messages={currentChatMessages}
          onOpenCallModal={(type) =>
            setCallSession({ isOpen: true, contact: selectedContact, type })
          }
          onToggleMute={handleToggleMuteContact}
          onClearChat={handleClearChat}
        />
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
      />

      <StatusStoriesModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        statusStories={statusStories}
        currentUser={currentUser}
        onAddStatus={handleAddStatus}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        darkMode={darkMode}
        wallpaper={wallpaper}
        onSaveUser={handleSaveUser}
        onToggleDarkMode={handleToggleDarkMode}
        onChangeWallpaper={handleChangeWallpaper}
      />

      <CallModal
        isOpen={callSession.isOpen}
        onClose={() => setCallSession({ isOpen: false, contact: null, type: 'audio' })}
        contact={callSession.contact}
        callType={callSession.type}
      />

      <MultiUserSwitcher
        isOpen={isMultiUserOpen}
        onClose={() => setIsMultiUserOpen(false)}
        currentUser={currentUser}
        contacts={contacts}
        onSwitchUser={handleSwitchUserIdentity}
      />
    </div>
  );
}
