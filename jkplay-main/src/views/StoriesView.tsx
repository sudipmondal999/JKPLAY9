import React, { useState } from 'react';
import { Story } from '../types/index.js';
import { useAuthStore } from '../stores/authStore.js';
import { BookOpen, Plus, Clock, Heart, Sparkles, Filter } from 'lucide-react';

interface StoriesViewProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onOpenStoryEditor: () => void;
  onOpenAuth: () => void;
}

export const StoriesView: React.FC<StoriesViewProps> = ({
  stories,
  onSelectStory,
  onOpenStoryEditor,
  onOpenAuth,
}) => {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Audio Culture', 'Artist Spotlight', 'Track Origins', 'Road Journeys', 'Gear & Acoustic'];

  const filteredStories =
    selectedCategory === 'All'
      ? stories
      : stories.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>KingPlay Chronicle</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Music Stories & Lore
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            In-depth journeys into sound synthesis, motorcycle highway culture, lyrics breakdowns, and analog acoustics.
          </p>
        </div>

        <button
          onClick={user ? onOpenStoryEditor : onOpenAuth}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-purple-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Story</span>
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30 font-semibold'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            onClick={() => onSelectStory(story)}
            className="group rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-purple-950/20"
          >
            <div>
              {/* Cover */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C14] via-transparent to-transparent opacity-80" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-purple-300 border border-white/10">
                  {story.category}
                </span>
              </div>

              {/* Title & Excerpt */}
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {story.excerpt}
                </p>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <span className="text-slate-300 font-medium">By {story.authorName}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {story.readingTime}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-red-400/80">
                  <Heart className="w-3.5 h-3.5 fill-red-400/20" />
                  {story.likesCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
