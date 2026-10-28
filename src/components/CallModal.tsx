import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  callType: 'audio' | 'video';
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  contact,
  callType,
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('calling');
      setSeconds(0);
      return;
    }

    // Connect call after 3 seconds
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2500);

    return () => clearTimeout(connectTimer);
  }, [isOpen]);

  // Call duration counter
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen || !contact) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111b21]/95 text-white flex flex-col justify-between p-8 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="text-center space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#00a884] bg-[#00a884]/10 px-3 py-1 rounded-full">
          Message Karo {callType === 'video' ? 'Video' : 'Voice'} Call
        </span>
        <h2 className="text-2xl font-bold mt-2">{contact.name}</h2>
        <p className="text-sm font-medium text-gray-300">
          {callStatus === 'calling' ? (
            <span className="animate-pulse text-amber-400">Ringing...</span>
          ) : callStatus === 'connected' ? (
            <span className="text-emerald-400 font-mono">{formatTimer(seconds)}</span>
          ) : (
            <span className="text-red-400">Call Ended</span>
          )}
        </p>
      </div>

      {/* Center Display / Avatar or Video Stream Simulation */}
      <div className="flex-1 flex items-center justify-center relative my-6">
        {callType === 'video' && !isVideoOff && callStatus === 'connected' ? (
          <div className="relative w-full max-w-lg aspect-video bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/30">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur">
              {contact.name}
            </div>

            {/* Self Camera PIP */}
            <div className="absolute bottom-4 right-4 w-28 h-36 bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                alt="Me"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-36 h-36 rounded-full object-cover border-4 border-[#00a884] shadow-2xl"
            />
            {callStatus === 'calling' && (
              <div className="absolute -inset-4 border-2 border-[#00a884] rounded-full animate-ping opacity-75" />
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center items-center gap-6 max-w-md mx-auto w-full">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition ${
            isMuted ? 'bg-red-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {callType === 'video' && (
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl transform active:scale-95 transition"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
