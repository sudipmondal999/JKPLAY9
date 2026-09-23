import React from 'react';
import { Story } from '../../types/index.js';
import { useAuthStore } from '../../stores/authStore.js';
import { X, Heart, Clock, User, Share2, BookOpen } from 'lucide-react';

interface StoryReaderModalProps {
  story: Story | null;
  onClose: () => void;
  onLikeToggle?: (storyId: string) => void;
}

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  story,
  onClose,
  onLikeToggle,
}) => {
  const { user } = useAuthStore();

  if (!story) return null;

  const isLiked = user ? (story.likedBy || []).includes(user.id) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-[#0C0C14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cover Header */}
        <div className="relative h-64 md:h-80 w-full shrink-0 overflow-hidden bg-slate-900">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C14] via-[#0C0C14]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Tag */}
          <div className="absolute bottom-6 left-6 md:left-8">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/80 text-white backdrop-blur-md">
              {story.category}
            </span>
          </div>
        </div>

        {/* Story Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-tight leading-tight mb-4">
            {story.title}
          </h1>

          {/* Author and Metadata Bar */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08] text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                {story.authorName.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium">{story.authorName}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {story.readingTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Like count & action */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLikeToggle && onLikeToggle(story.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                  isLiked
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'border-white/10 text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
                <span>{story.likesCount}</span>
              </button>
            </div>
          </div>

          {/* Excerpt Callout */}
          <div className="p-4 mb-6 rounded-2xl bg-purple-950/20 border-l-4 border-purple-500 text-slate-300 italic text-sm leading-relaxed">
            "{story.excerpt}"
          </div>

          {/* Longform Prose */}
          <div className="text-slate-300 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
            {story.content}
          </div>

          {/* Story Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-8 mt-8 border-t border-white/[0.06]">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] text-slate-400 border border-white/[0.06]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
