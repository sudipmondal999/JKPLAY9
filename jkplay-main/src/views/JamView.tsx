import React, { useState } from 'react';
import { useJamStore } from '../stores/jamStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { usePlayerStore } from '../stores/playerStore.js';
import { Song } from '../types/index.js';
import { formatTime } from '../utils/formatTime.js';
import {
  Radio,
  Users,
  MessageSquare,
  Crown,
  Copy,
  Check,
  Send,
  Plus,
  Play,
  Pause,
  LogOut,
  Sparkles,
  AlertCircle,
  Loader2,
  Tv,
} from 'lucide-react';

interface JamViewProps {
  onOpenAuth: () => void;
  allSongs: Song[];
}

export const JamView: React.FC<JamViewProps> = ({ onOpenAuth, allSongs }) => {
  const { user } = useAuthStore();
  const {
    room,
    isInJam,
    isHost,
    chatMessages,
    isConnecting,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    sendLoadTrack,
    sendAddToQueue,
    sendChatMessage,
  } = useJamStore();

  const { isPlaying, currentTime, duration, togglePlay, showVideoPlayer, setShowVideoPlayer } = usePlayerStore();

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [everyoneControls, setEveryoneControls] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [songSearch, setSongSearch] = useState('');
  const [showAddQueueModal, setShowAddQueueModal] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
          <Radio className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white">KingPlay Jam Mode</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Listen to YouTube music simultaneously with your friends across devices, synchronized in real time.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-purple-950/40"
        >
          Sign In to Start a Jam
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard?.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoom(newRoomName || `${user.name}'s Jam Session`, everyoneControls);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    await joinRoom(joinCodeInput.trim());
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  // Jam Lobby (When not in room)
  if (!isInJam || !room) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <Radio className="w-4 h-4" />
            <span>Real-Time Synchronized Audio</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Jam Mode
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Stream YouTube together in real time. Create a private session, invite friends with your 4-digit code, and queue music collaboratively.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Create a Jam Session */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Create a Jam</h3>
              <p className="text-xs text-slate-400 mt-1">
                You'll be the host with playback control and queue privileges.
              </p>

              <form onSubmit={handleCreate} className="mt-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    placeholder={`${user.name}'s Jam Session`}
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="everyoneControls"
                    checked={everyoneControls}
                    onChange={(e) => setEveryoneControls(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-purple-600 focus:ring-0"
                  />
                  <label htmlFor="everyoneControls" className="text-xs text-slate-300 cursor-pointer">
                    Allow all participants to control playback
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full mt-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4" />
                  )}
                  <span>Create Live Jam</span>
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Join an existing Jam */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Join a Jam</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter the room code shared by your friend (e.g. KP-XXXX).
              </p>

              <form onSubmit={handleJoin} className="mt-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Room Code
                  </label>
                  <input
                    type="text"
                    placeholder="KP-7X92"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-mono uppercase tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isConnecting || !joinCodeInput.trim()}
                  className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  <span>Join Session</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Jam Room Screen
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Top Banner with Room Code */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#10101C]/80 to-transparent border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-white">{room.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Host: <span className="text-purple-300 font-medium">{room.hostUsername}</span>
            </p>
          </div>
        </div>

        {/* Room Code Badge & Leave Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-mono font-bold text-purple-300 transition-colors"
            title="Click to copy room code"
          >
            <span>{room.roomCode}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={leaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-semibold text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Jam</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Track & Queue vs Chat & Participants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Now Playing in Jam & Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synchronized Track Card */}
          {room.currentTrack ? (
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-xl flex flex-col sm:flex-row gap-6 items-center">
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-lg">
                <img
                  src={room.currentTrack.thumbnailUrl}
                  alt={room.currentTrack.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  Synchronized Jam Playback
                </span>
                <h3 className="font-display font-bold text-xl text-white truncate mt-1">
                  {room.currentTrack.title}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {room.currentTrack.artist}
                </p>

                {/* Status indicator */}
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-4 text-xs font-mono text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <button
                    onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Toggle Video Screen"
                  >
                    <Tv className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] text-center text-slate-400 text-xs">
              No track currently playing in this session.
            </div>
          )}

          {/* Jam Session Queue */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-white">Jam Queue</h3>
              <button
                onClick={() => setShowAddQueueModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Track to Jam</span>
              </button>
            </div>

            <div className="space-y-2">
              {room.queue.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No upcoming songs in queue.</p>
              ) : (
                room.queue.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-5 text-center text-xs font-mono text-slate-500">
                        {idx + 1}
                      </span>
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    {(isHost || room.everyoneCanControl) && (
                      <button
                        onClick={() => sendLoadTrack(track)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold transition-colors"
                      >
                        Play Now
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Live Chat & Connected Participants */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Listeners in Session ({room.participants.length})</span>
              </h3>
            </div>

            <div className="space-y-2">
              {room.participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${p.username}`}
                      alt={p.username}
                      className="w-7 h-7 rounded-full border border-purple-500/30"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-medium text-slate-200">{p.username}</span>
                  </div>
                  {p.isHost && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      <Crown className="w-3 h-3" /> Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time In-Room Chat */}
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-xl flex flex-col h-80">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="font-display font-bold text-sm text-white">Jam Chat</h3>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-slate-500 text-center italic py-10">No messages yet. Say hi!</p>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-xl ${
                      msg.isSystem
                        ? 'bg-purple-950/30 text-purple-300 text-center italic text-[11px]'
                        : msg.sender === user.username
                        ? 'bg-purple-600/20 ml-4 border border-purple-500/20 text-slate-200'
                        : 'bg-white/[0.03] mr-4 text-slate-300'
                    }`}
                  >
                    {!msg.isSystem && (
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-purple-400">{msg.sender}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    <p className="leading-snug">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Type a message to the room..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add Track to Jam Queue Modal */}
      {showAddQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0F0F1A] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[80vh]">
            <h3 className="font-display font-bold text-base text-white mb-3">Add Song to Jam Queue</h3>
            <input
              type="text"
              placeholder="Search catalog tracks..."
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-3"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-1">
              {allSongs
                .filter((s) => s.title.toLowerCase().includes(songSearch.toLowerCase()) || s.artist.toLowerCase().includes(songSearch.toLowerCase()))
                .map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-semibold text-white truncate">{song.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
                    </div>
                    <button
                      onClick={() => {
                        sendAddToQueue(song);
                        setShowAddQueueModal(false);
                      }}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Queue
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setShowAddQueueModal(false)}
              className="mt-3 w-full py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-xs text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
