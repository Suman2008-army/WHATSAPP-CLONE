import React, { useState, useEffect } from 'react';
import { StatusItem, UserProfile } from '../types';
import { X, Plus, ChevronLeft, ChevronRight, Eye, Send, Sparkles } from 'lucide-react';

interface StatusStoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusStories: StatusItem[];
  currentUser: UserProfile;
  onAddStatus: (status: Partial<StatusItem>) => void;
}

const BG_COLORS = ['#00a884', '#128c7e', '#075e54', '#34b7f1', '#7b1fa2', '#e91e63', '#d32f2f'];

export const StatusStoriesModal: React.FC<StatusStoriesModalProps> = ({
  isOpen,
  onClose,
  statusStories,
  currentUser,
  onAddStatus,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState(BG_COLORS[0]);

  // Status Story Auto-advance progress timer
  useEffect(() => {
    if (activeIndex === null) return;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeIndex < statusStories.length - 1) {
            setActiveIndex(activeIndex + 1);
            return 0;
          } else {
            setActiveIndex(null);
            return 0;
          }
        }
        return prev + 2; // 5 second total display duration
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeIndex, statusStories.length]);

  if (!isOpen) return null;

  const handleCreateTextStatus = () => {
    if (!newStatusText.trim()) return;

    onAddStatus({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: 'text',
      content: newStatusText.trim(),
      bgColor: selectedBgColor,
      timestamp: new Date().toISOString(),
      viewed: false,
    });

    setNewStatusText('');
    setShowCreateModal(false);
  };

  const activeStory = activeIndex !== null ? statusStories[activeIndex] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 text-white flex flex-col justify-between">
      {/* Active Story View Mode */}
      {activeStory ? (
        <div
          className="relative flex-1 flex flex-col justify-between p-6 bg-cover bg-center transition-all duration-300"
          style={{
            backgroundColor: activeStory.bgColor || '#111b21',
            backgroundImage: activeStory.type === 'image' ? `url(${activeStory.content})` : 'none',
          }}
        >
          {/* Top Progress Bar & Header */}
          <div className="z-10 space-y-3">
            <div className="flex gap-1">
              {statusStories.map((_, idx) => (
                <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100"
                    style={{
                      width:
                        idx < activeIndex
                          ? '100%'
                          : idx === activeIndex
                          ? `${progress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img
                  src={activeStory.userAvatar}
                  alt={activeStory.userName}
                  className="w-10 h-10 rounded-full border-2 border-[#00a884] object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm">{activeStory.userName}</h3>
                  <p className="text-[10px] text-gray-300">
                    {new Date(activeStory.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveIndex(null)}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Story Text Content */}
          {activeStory.type === 'text' && (
            <div className="flex-1 flex items-center justify-center p-8 text-center font-bold text-2xl md:text-4xl max-w-2xl mx-auto leading-relaxed">
              {activeStory.content}
            </div>
          )}

          {/* Image Story Caption */}
          {activeStory.caption && (
            <div className="z-10 bg-black/60 p-4 rounded-xl text-center text-sm font-medium backdrop-blur-md max-w-md mx-auto">
              {activeStory.caption}
            </div>
          )}

          {/* Navigation Controls */}
          <button
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() =>
              setActiveIndex(Math.min(statusStories.length - 1, activeIndex + 1))
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      ) : (
        /* Status List / Overview Mode */
        <div className="flex-1 flex flex-col max-w-md w-full mx-auto bg-[#111b21] p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00a884]" /> Status Updates
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current User Status Add Card */}
          <div className="flex items-center justify-between p-3 bg-[#202c33] rounded-2xl mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#00a884]"
                />
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-[#00a884] text-white rounded-full flex items-center justify-center font-bold text-xs shadow"
                >
                  +
                </button>
              </div>
              <div>
                <h3 className="font-bold text-sm">My Status</h3>
                <p className="text-xs text-gray-400">Tap to add status update</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-[#00a884] hover:bg-[#008f70] text-xs font-bold rounded-xl"
            >
              Add
            </button>
          </div>

          {/* Recent Updates List */}
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">
            Recent Contact Updates ({statusStories.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3">
            {statusStories.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => setActiveIndex(idx)}
                className="flex items-center gap-3 p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-2xl cursor-pointer transition"
              >
                <div className="p-0.5 rounded-full border-2 border-[#00a884]">
                  <img
                    src={story.userAvatar}
                    alt={story.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{story.userName}</h4>
                  <p className="text-xs text-gray-400">
                    {new Date(story.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Text Status Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md p-6 rounded-2xl flex flex-col justify-between min-h-[350px] shadow-2xl relative"
            style={{ backgroundColor: selectedBgColor }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm">Create Text Status</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <textarea
              value={newStatusText}
              onChange={(e) => setNewStatusText(e.target.value)}
              placeholder="Type a status update..."
              className="w-full bg-transparent text-center font-bold text-2xl text-white placeholder-white/60 focus:outline-none resize-none my-auto"
              rows={3}
            />

            <div className="space-y-4">
              {/* Background Color Pickers */}
              <div className="flex justify-center gap-2">
                {BG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedBgColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      selectedBgColor === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <button
                onClick={handleCreateTextStatus}
                className="w-full py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
              >
                <Send className="w-4 h-4" /> Post Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
