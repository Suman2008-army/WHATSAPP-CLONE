import React from 'react';
import { Contact, UserProfile } from '../types';
import { Users, ExternalLink, RefreshCw, X, ShieldCheck, Sparkles } from 'lucide-react';

interface MultiUserSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  contacts: Contact[];
  onSwitchUser: (selectedContact: Contact) => void;
}

export const MultiUserSwitcher: React.FC<MultiUserSwitcherProps> = ({
  isOpen,
  onClose,
  currentUser,
  contacts,
  onSwitchUser,
}) => {
  if (!isOpen) return null;

  const handleOpenDuplicateTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-4 bg-[#00a884] text-white flex justify-between items-center">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Users className="w-5 h-5" /> Switch User / Multi-Tab Test
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="font-semibold text-[#00a884] mb-1 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Instant Cross-Tab Real-time Messaging
            </p>
            You can switch your active identity to chat as another contact, or open a second browser window to test live two-way real-time messaging between two tabs!
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-gray-400">Current Logged-in User</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#202c33] rounded-xl border border-[#00a884]">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{currentUser.name} (You)</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.phone}</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#00a884]" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-gray-400">Switch Identity To:</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    onSwitchUser(contact);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl text-left transition border border-gray-100 dark:border-gray-800"
                >
                  <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{contact.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{contact.status}</p>
                  </div>
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleOpenDuplicateTab}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Open 2nd Synced Tab (Mirror Test)
          </button>
        </div>
      </div>
    </div>
  );
};
