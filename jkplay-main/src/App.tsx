import React, { useState, useEffect } from 'react';
import { ActiveTab, Song, Playlist, Story } from './types/index.js';
import { useAuthStore } from './stores/authStore.js';
import { usePlayerStore } from './stores/playerStore.js';

// Layout & Background
import { BackgroundArt } from './components/common/BackgroundArt.js';
import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { MobileNav } from './components/layout/MobileNav.js';

// Player & Audio
import { YouTubePlayer } from './components/player/YouTubePlayer.js';
import { GlobalPlayer } from './components/player/GlobalPlayer.js';
import { FullscreenPlayer } from './components/player/FullscreenPlayer.js';
import { QueueDrawer } from './components/player/QueueDrawer.js';
import { SleepTimerEngine } from './components/player/SleepTimerEngine.js';

// Modals & Notifications
import { AddSongModal } from './components/modals/AddSongModal.js';
import { AuthModal } from './components/modals/AuthModal.js';
import { CreatePlaylistModal } from './components/modals/CreatePlaylistModal.js';
import { StoryReaderModal } from './components/modals/StoryReaderModal.js';
import { StoryEditorModal } from './components/modals/StoryEditorModal.js';
import { SleepTimerModal } from './components/modals/SleepTimerModal.js';
import { ToastContainer } from './components/common/ToastContainer.js';

// Views
import { HomeView } from './views/HomeView.js';
import { DiscoverView } from './views/DiscoverView.js';
import { MusicView } from './views/MusicView.js';
import { StoriesView } from './views/StoriesView.js';
import { LibraryView } from './views/LibraryView.js';
import { JamView } from './views/JamView.js';
import { PlaylistDetailView } from './views/PlaylistDetailView.js';
import { SearchView } from './views/SearchView.js';
import { ProfileView } from './views/ProfileView.js';
import { AdminView } from './views/AdminView.js';
import { SettingsView } from './views/SettingsView.js';

export default function App() {
  const { user, token, checkAuth } = useAuthStore();
  const { fetchLikedSongs } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Modal open states
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isStoryEditorOpen, setIsStoryEditorOpen] = useState(false);

  // Catalog state
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Initialize Auth & Liked Songs
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (token) {
      fetchLikedSongs();
    }
  }, [token]);

  // Fetch initial data catalog
  const loadCatalog = async () => {
    try {
      const [songsRes, playlistsRes, storiesRes] = await Promise.all([
        fetch('/api/songs').then((r) => r.json()),
        fetch('/api/playlists', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then((r) => r.json()),
        fetch('/api/stories').then((r) => r.json()),
      ]);

      if (songsRes.success && songsRes.data?.songs) {
        setSongs(songsRes.data.songs);
        const { currentTrack } = usePlayerStore.getState();
        if (!currentTrack && songsRes.data.songs.length > 0) {
          usePlayerStore.setState({
            currentTrack: songsRes.data.songs[0],
            queue: songsRes.data.songs,
            currentIndex: 0,
            duration: songsRes.data.songs[0].duration,
          });
        }
      }
      if (playlistsRes.success && playlistsRes.data?.playlists) {
        setPlaylists(playlistsRes.data.playlists);
      }
      if (storiesRes.success && storiesRes.data?.stories) {
        setStories(storiesRes.data.stories);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [token]);

  // Handlers
  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setActiveTab('playlist-detail');
  };

  const handleBackFromPlaylist = () => {
    setSelectedPlaylistId(null);
    setActiveTab('library');
  };

  const handleSongAdded = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev.filter((s) => s.id !== newSong.id)]);
    loadCatalog();
  };

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
    setSelectedPlaylistId(newPlaylist.id);
    setActiveTab('playlist-detail');
  };

  const handlePlaylistDeleted = (deletedId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleStoryPublished = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    setSelectedStory(newStory);
  };

  const handleStoryLikeToggle = async (storyId: string) => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await fetch(`/api/stories/${storyId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId
              ? {
                  ...s,
                  likesCount: data.data.likesCount,
                  likedBy: data.data.liked
                    ? [...(s.likedBy || []), user!.id]
                    : (s.likedBy || []).filter((id) => id !== user!.id),
                }
              : s
          )
        );
        if (selectedStory && selectedStory.id === storyId) {
          setSelectedStory((curr) =>
            curr
              ? {
                  ...curr,
                  likesCount: data.data.likesCount,
                  likedBy: data.data.liked
                    ? [...(curr.likedBy || []), user!.id]
                    : (curr.likedBy || []).filter((id) => id !== user!.id),
                }
              : null
          );
        }
      }
    } catch (err) {}
  };

  const userPlaylists = playlists.filter((p) => !user || p.ownerId === user.id);

  return (
    <div className="min-h-screen bg-[#08080D] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Royal Enfield Himalayan 411 Background Scrim & Aesthetic */}
      <BackgroundArt />

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddSong={() => {
          if (!user) {
            setIsAuthOpen(true);
          } else {
            setIsAddSongOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Body Area with Sidebar and Main View */}
      <div className="relative z-10 flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userPlaylists={userPlaylists}
          onSelectPlaylist={handleSelectPlaylist}
          onCreatePlaylist={() => {
            if (!user) {
              setIsAuthOpen(true);
            } else {
              setIsCreatePlaylistOpen(true);
            }
          }}
        />

        {/* Center Main View Canvas */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-32 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeView
              songs={songs}
              playlists={playlists}
              stories={stories}
              setActiveTab={setActiveTab}
              onSelectPlaylist={handleSelectPlaylist}
              onSelectStory={(s) => setSelectedStory(s)}
              onOpenAddSong={() => {
                if (!user) setIsAuthOpen(true);
                else setIsAddSongOpen(true);
              }}
            />
          )}

          {activeTab === 'discover' && (
            <DiscoverView
              songs={songs}
              playlists={playlists}
              onSelectPlaylist={handleSelectPlaylist}
            />
          )}

          {activeTab === 'music' && (
            <MusicView
              songs={songs}
              userPlaylists={userPlaylists}
              onOpenAddSong={() => {
                if (!user) setIsAuthOpen(true);
                else setIsAddSongOpen(true);
              }}
            />
          )}

          {activeTab === 'stories' && (
            <StoriesView
              stories={stories}
              onSelectStory={(s) => setSelectedStory(s)}
              onOpenStoryEditor={() => setIsStoryEditorOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              playlists={playlists}
              allSongs={songs}
              onSelectPlaylist={handleSelectPlaylist}
              onCreatePlaylist={() => {
                if (!user) setIsAuthOpen(true);
                else setIsCreatePlaylistOpen(true);
              }}
              onOpenAddSong={() => {
                if (!user) setIsAuthOpen(true);
                else setIsAddSongOpen(true);
              }}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'jam' && (
            <JamView onOpenAuth={() => setIsAuthOpen(true)} allSongs={songs} />
          )}

          {activeTab === 'playlist-detail' && selectedPlaylistId && (
            <PlaylistDetailView
              playlistId={selectedPlaylistId}
              onBack={handleBackFromPlaylist}
              onOpenAddSong={() => {
                if (!user) setIsAuthOpen(true);
                else setIsAddSongOpen(true);
              }}
              onPlaylistDeleted={handlePlaylistDeleted}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              onSelectPlaylist={handleSelectPlaylist}
              onSelectStory={(s) => setSelectedStory(s)}
              allSongs={songs}
              userPlaylists={userPlaylists}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              playlists={playlists}
              allSongs={songs}
              onSelectPlaylist={handleSelectPlaylist}
              onOpenAddSong={() => {
                if (!user) setIsAuthOpen(true);
                else setIsAddSongOpen(true);
              }}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              allSongs={songs}
              allPlaylists={playlists}
              allStories={stories}
              onSongDeleted={(sId) => setSongs((prev) => prev.filter((s) => s.id !== sId))}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global YouTube Player Engine */}
      <YouTubePlayer />

      {/* Sleep Timer Engine (reliable background timer) */}
      <SleepTimerEngine />

      {/* Persistent Global Audio Player (Fixed bottom) */}
      <GlobalPlayer />

      {/* Queue Drawer */}
      <QueueDrawer />

      {/* Fullscreen Player Mode */}
      <FullscreenPlayer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals & Overlays */}
      <SleepTimerModal />
      <ToastContainer />

      <AddSongModal
        isOpen={isAddSongOpen}
        onClose={() => setIsAddSongOpen(false)}
        userPlaylists={userPlaylists}
        onSongAdded={handleSongAdded}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />

      <StoryReaderModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onLikeToggle={handleStoryLikeToggle}
      />

      <StoryEditorModal
        isOpen={isStoryEditorOpen}
        onClose={() => setIsStoryEditorOpen(false)}
        onStoryPublished={handleStoryPublished}
      />
    </div>
  );
}
