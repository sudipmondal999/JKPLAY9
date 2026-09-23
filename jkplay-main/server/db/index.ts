import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Song, Playlist, Story, JamRoom } from '../../src/types/index.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  songs: Song[];
  playlists: Playlist[];
  likes: { id: string; userId: string; songId: string; createdAt: string }[];
  history: { id: string; userId: string; songId: string; playedAt: string }[];
  stories: Story[];
  jamRooms: JamRoom[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data with real, embeddable YouTube videos
function getInitialSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  const adminUser: User & { passwordHash: string } = {
    id: 'usr_admin_001',
    name: 'KingPlay Admin',
    username: 'admin',
    email: 'admin@kingplay.io',
    role: 'admin',
    bio: 'Platform curator & sound engineer.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    passwordHash: defaultPasswordHash,
  };

  const demoUser: User & { passwordHash: string } = {
    id: 'usr_demo_002',
    name: 'Sayan Rider',
    username: 'sayan',
    email: 'sayan@kingplay.io',
    role: 'user',
    bio: 'Motorcycle wanderer, audiophile, Himalayan 411 explorer.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    passwordHash: defaultPasswordHash,
  };

  const initialSongs: Song[] = [
    {
      id: 'sng_bollywood_jukebox',
      youtubeVideoId: 'I0b88L53Gbg',
      youtubeUrl: 'https://youtu.be/I0b88L53Gbg',
      title: 'Best Of Bollywood Dance Hits (Video Jukebox)',
      artist: 'T-Series & Various Artists',
      channelName: 'T-Series',
      thumbnailUrl: 'https://img.youtube.com/vi/I0b88L53Gbg/hqdefault.jpg',
      duration: 3240,
      genre: 'Dance / Bollywood / Party',
      isAvailable: true,
      description: 'Nonstop high-energy Bollywood dance songs including Bom Diggy Diggy, Abhi Toh Party Shuru Hui Hai, Chammak Challo, Dilbar, and more!',
      createdBy: 'usr_demo_002',
      addedByUsername: 'sayan',
      createdAt: new Date().toISOString(),
      playsCount: 1420,
    },
    {
      id: 'sng_001',
      youtubeVideoId: '5qap5aO4i9A',
      youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
      title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
      artist: 'Lofi Girl',
      channelName: 'Lofi Girl',
      thumbnailUrl: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg',
      duration: 3600,
      genre: 'Lo-Fi',
      isAvailable: true,
      description: 'Chilled beats for late night exploration and calm contemplation.',
      createdBy: adminUser.id,
      addedByUsername: 'admin',
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      playsCount: 2450,
    },
    {
      id: 'sng_002',
      youtubeVideoId: '4xDzrJKXOOY',
      youtubeUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
      title: 'SYNTHWAVE RADIO - Chill Synth / Retro Beats',
      artist: 'Lofi Girl - Synthwave Boy',
      channelName: 'Lofi Girl',
      thumbnailUrl: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
      duration: 2700,
      genre: 'Synthwave',
      isAvailable: true,
      description: 'Retro futuristic synthesizers for midnight drives.',
      createdBy: adminUser.id,
      addedByUsername: 'admin',
      createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      playsCount: 1890,
    },
    {
      id: 'sng_003',
      youtubeVideoId: 'fJ9rUzIMcZQ',
      youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      channelName: 'Queen Official',
      thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      duration: 359,
      genre: 'Rock',
      isAvailable: true,
      description: 'The monumental rock classic remastered in HD.',
      createdBy: demoUser.id,
      addedByUsername: 'sayan',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      playsCount: 4210,
    },
    {
      id: 'sng_004',
      youtubeVideoId: 'hT_nvWreIhg',
      youtubeUrl: 'https://www.youtube.com/watch?v=hT_nvWreIhg',
      title: 'Counting Stars',
      artist: 'OneRepublic',
      channelName: 'OneRepublic',
      thumbnailUrl: 'https://img.youtube.com/vi/hT_nvWreIhg/hqdefault.jpg',
      duration: 257,
      genre: 'Pop / Indie',
      isAvailable: true,
      description: 'Energetic acoustic-driven rhythms for boundless roads.',
      createdBy: demoUser.id,
      addedByUsername: 'sayan',
      createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      playsCount: 3120,
    },
    {
      id: 'sng_005',
      youtubeVideoId: 'kXYiU_JCYtU',
      youtubeUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
      title: 'Numb (Official Music Video)',
      artist: 'Linkin Park',
      channelName: 'Linkin Park',
      thumbnailUrl: 'https://img.youtube.com/vi/kXYiU_JCYtU/hqdefault.jpg',
      duration: 187,
      genre: 'Alternative Rock',
      isAvailable: true,
      description: 'Timeless nu-metal masterpiece and raw melodic emotion.',
      createdBy: adminUser.id,
      addedByUsername: 'admin',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      playsCount: 5200,
    },
    {
      id: 'sng_006',
      youtubeVideoId: 'kJQP7kiw5Fk',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      title: 'Despacito',
      artist: 'Luis Fonsi ft. Daddy Yankee',
      channelName: 'Luis Fonsi',
      thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      duration: 281,
      genre: 'Latin / Pop',
      isAvailable: true,
      description: 'Global Latin acoustic hit with irresistible rhythm.',
      createdBy: demoUser.id,
      addedByUsername: 'sayan',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      playsCount: 1650,
    },
    {
      id: 'sng_007',
      youtubeVideoId: 'JGwWNGJdvx8',
      youtubeUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      channelName: 'Ed Sheeran',
      thumbnailUrl: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
      duration: 233,
      genre: 'Acoustic / Pop',
      isAvailable: true,
      description: 'Loop pedal acoustic magic and driving percussive cadence.',
      createdBy: adminUser.id,
      addedByUsername: 'admin',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      playsCount: 2980,
    },
    {
      id: 'sng_008',
      youtubeVideoId: '9bZkp7q19f0',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      title: 'GANGNAM STYLE',
      artist: 'PSY',
      channelName: 'officialpsy',
      thumbnailUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
      duration: 252,
      genre: 'Electronic / Dance',
      isAvailable: true,
      description: 'Electrifying beats and high energy stadium synths.',
      createdBy: adminUser.id,
      addedByUsername: 'admin',
      createdAt: new Date().toISOString(),
      playsCount: 1840,
    }
  ];

  const initialPlaylists: Playlist[] = [
    {
      id: 'ply_001',
      name: 'Himalayan Highway - Motorcycle Ride',
      description: 'Deep rumble, vast landscapes, and gritty rock tracks tailored for rough terrains and high passes.',
      coverImage: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      ownerId: demoUser.id,
      ownerName: demoUser.name,
      visibility: 'public',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
      songs: [
        { id: 'ps_01', songId: 'sng_003', addedAt: new Date().toISOString(), order: 0 },
        { id: 'ps_02', songId: 'sng_005', addedAt: new Date().toISOString(), order: 1 },
        { id: 'ps_03', songId: 'sng_004', addedAt: new Date().toISOString(), order: 2 },
      ],
    },
    {
      id: 'ply_002',
      name: 'Midnight Synthwave & Neon Run',
      description: 'Hypnotic retro arpeggios and deep sub-bass for nighttime cruises under the city glow.',
      coverImage: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
      ownerId: adminUser.id,
      ownerName: adminUser.name,
      visibility: 'public',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
      songs: [
        { id: 'ps_04', songId: 'sng_002', addedAt: new Date().toISOString(), order: 0 },
        { id: 'ps_05', songId: 'sng_001', addedAt: new Date().toISOString(), order: 1 },
      ],
    },
    {
      id: 'ply_003',
      name: 'KingPlay Global Top Anthem',
      description: 'Curated chart-topping YouTube tracks loved by the KingPlay community.',
      coverImage: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
      ownerId: adminUser.id,
      ownerName: adminUser.name,
      visibility: 'public',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date().toISOString(),
      songs: [
        { id: 'ps_06', songId: 'sng_007', addedAt: new Date().toISOString(), order: 0 },
        { id: 'ps_07', songId: 'sng_004', addedAt: new Date().toISOString(), order: 1 },
        { id: 'ps_08', songId: 'sng_006', addedAt: new Date().toISOString(), order: 2 },
        { id: 'ps_09', songId: 'sng_008', addedAt: new Date().toISOString(), order: 3 },
      ],
    }
  ];

  const initialStories: Story[] = [
    {
      id: 'sty_001',
      title: 'Thunder in the Valley: Riding the Himalayan 411 Across Khardung La',
      slug: 'riding-himalayan-411-khardung-la',
      excerpt: 'Not built for speed, but built for surviving every road. A journey through biting altitude with a single-cylinder soundtrack.',
      category: 'Adventure & Sound',
      tags: ['motorcycle', 'himalayan', 'travel', 'soundtrack'],
      readingTime: '5 min read',
      authorId: demoUser.id,
      authorName: demoUser.name,
      coverImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      published: true,
      likesCount: 142,
      likedBy: [adminUser.id],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
      content: `### Some machines are made for attention — this one is made for adventure.

When the ignition catches at 4,000 meters above sea level, the LS410 engine lets out a low, deliberate thrum. It isn't the high-strung scream of a sportbike or the manufactured chrome roar of a boulevard cruiser. It sounds like rock hitting hard gravel — rhythmic, unhurried, steadfast.

#### The Sound of the High Desert
Riding into the Nubra Valley, the wind roars across the visor at 60 km/h. At that pace, you aren't fighting the terrain; you are listening to it. The tire lugs bite into the scree, echoing off granite cliffs that have stood for fifty million years. 

Music becomes different here. In your helmet's Bluetooth comms, high-gain guitars and expansive synthwave pads mingle with the piston strokes. There is an unmistakable synchronicity when a guitar solo drops right as the road twists into an endless panoramic descent over snow-capped peaks.

#### Surviving Every Road
"Not built for speed… built for surviving every road." When the river crossing at Shyok turns freezing cold and the water climbs to the crankcase, you don't panic. You drop into first gear, roll on the throttle, and let the torque pull you through. KingPlay was built for wanderers who demand their music everywhere the trail leads.`
    },
    {
      id: 'sty_002',
      title: 'The Analog Resonance: Why Tape, Tubes, and Vinyl Still Captivate Modern Ears',
      slug: 'the-analog-resonance-why-vinyl-captivates',
      excerpt: 'In an era of hyper-compressed digital streams, tactile soundscapes and physical imperfections offer warmth our brains crave.',
      category: 'Audio Culture',
      tags: ['audiophile', 'analog', 'sound-engineering', 'vinyl'],
      readingTime: '4 min read',
      authorId: adminUser.id,
      authorName: adminUser.name,
      coverImage: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
      published: true,
      likesCount: 89,
      likedBy: [demoUser.id],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
      content: `### The Beauty of Harmonic Distortion

Every modern digital audio workstation offers mathematical perfection. You can align waveforms to the picosecond, quantize drum hits to rigid grids, and pitch-correct vocals until not a cent of drift remains. Yet, artists and listeners continually return to the warmth of vacuum tubes and magnetic tape saturation.

#### The Brain and Psychoacoustics
Human hearing evolved to discern subtle physical vibrations in space. When sound travels through air and reflects off wood, stone, or iron, it picks up second-order harmonic distortions. Analog preamplifiers introduce these exact warm overtones. Far from being a flaw, this harmonic saturation glues disparate instruments together, making drums punchier and voices intimate.

#### KingPlay's Sound Vision
Whether you stream through YouTube's audio pipeline or join a lossless Jam session with friends, true listening is about connection. KingPlay celebrates both the classic analog ethos and digital ubiquity.`
    },
    {
      id: 'sty_003',
      title: 'Jam Mode Engineering: Synchronizing Microseconds Across the Web',
      slug: 'jam-mode-engineering-realtime-sync',
      excerpt: 'How KingPlay synchronizes audio playback across continents with drift compensation and low-latency WebSockets.',
      category: 'Tech & Architecture',
      tags: ['websockets', 'engineering', 'realtime', 'jam'],
      readingTime: '6 min read',
      authorId: adminUser.id,
      authorName: adminUser.name,
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      published: true,
      likesCount: 118,
      likedBy: [],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      content: `### Collaborative Listening Without Borders

Sharing music used to mean passing a pair of wired earphones or sitting together on a dorm room couch. When KingPlay introduced Jam Mode, the technical challenge was clear: how do two or ten people in different cities hear the same beat drops simultaneously?

#### Drift Detection & Clock Offset
Because client device clocks can differ by hundreds of milliseconds, the host timestamp is calculated using an initial round-trip latency handshake. Whenever the host plays, seeks, or skips:

1. A high-priority event is broadcast via Socket.IO with host playhead position and monotonic timestamp.
2. Participant clients compute the transport latency and smooth out drift.
3. Micro-adjustments ensure no jarring audio skips, keeping everyone in absolute harmony.`
    }
  ];

  return {
    users: [adminUser, demoUser],
    songs: initialSongs,
    playlists: initialPlaylists,
    likes: [
      { id: 'lk_01', userId: demoUser.id, songId: 'sng_001', createdAt: new Date().toISOString() },
      { id: 'lk_02', userId: demoUser.id, songId: 'sng_003', createdAt: new Date().toISOString() },
      { id: 'lk_03', userId: adminUser.id, songId: 'sng_002', createdAt: new Date().toISOString() },
    ],
    history: [
      { id: 'hist_01', userId: demoUser.id, songId: 'sng_003', playedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'hist_02', userId: demoUser.id, songId: 'sng_002', playedAt: new Date(Date.now() - 7200000).toISOString() },
    ],
    stories: initialStories,
    jamRooms: [
      {
        roomCode: 'KP-7X92',
        name: 'Midnight Riders Club',
        hostId: demoUser.id,
        hostUsername: demoUser.username,
        currentTrack: initialSongs[1],
        isPlaying: false,
        position: 45,
        lastUpdatedTimestamp: Date.now(),
        queue: [initialSongs[0], initialSongs[2]],
        participants: [
          {
            socketId: 'sock_demo_host',
            userId: demoUser.id,
            username: demoUser.username,
            avatarUrl: demoUser.avatarUrl,
            isHost: true,
            joinedAt: new Date().toISOString(),
          }
        ],
        everyoneCanControl: false,
        createdAt: new Date().toISOString(),
      }
    ],
  };
}

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Verify key integrity
        if (parsed.users && parsed.songs && parsed.playlists && parsed.stories) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading db.json, generating fresh seed data:', err);
    }

    const seed = getInitialSeedData();
    this.saveDataImmediate(seed);
    return seed;
  }

  private saveDataImmediate(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save db.json:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveDataImmediate(this.data);
      this.saveTimeout = null;
    }, 200);
  }

  // Users
  get users() {
    return this.data.users;
  }

  addUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.scheduleSave();
    return user;
  }

  updateUser(id: string, updates: Partial<User & { passwordHash?: string }>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.scheduleSave();
      return this.data.users[idx];
    }
    return null;
  }

  // Songs
  get songs() {
    return this.data.songs;
  }

  addSong(song: Song) {
    // Avoid duplicate video ID insertion
    const existing = this.data.songs.find(s => s.youtubeVideoId === song.youtubeVideoId);
    if (existing) {
      return existing;
    }
    this.data.songs.unshift(song);
    this.scheduleSave();
    return song;
  }

  updateSong(id: string, updates: Partial<Song>) {
    const idx = this.data.songs.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.songs[idx] = { ...this.data.songs[idx], ...updates, updatedAt: new Date().toISOString() };
      this.scheduleSave();
      return this.data.songs[idx];
    }
    return null;
  }

  deleteSong(id: string) {
    this.data.songs = this.data.songs.filter(s => s.id !== id);
    // remove from playlists
    this.data.playlists.forEach(pl => {
      pl.songs = pl.songs.filter(ps => ps.songId !== id);
    });
    this.data.likes = this.data.likes.filter(lk => lk.songId !== id);
    this.data.history = this.data.history.filter(h => h.songId !== id);
    this.scheduleSave();
  }

  // Playlists
  get playlists() {
    return this.data.playlists;
  }

  addPlaylist(playlist: Playlist) {
    this.data.playlists.unshift(playlist);
    this.scheduleSave();
    return playlist;
  }

  updatePlaylist(id: string, updates: Partial<Playlist>) {
    const idx = this.data.playlists.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.playlists[idx] = { ...this.data.playlists[idx], ...updates, updatedAt: new Date().toISOString() };
      this.scheduleSave();
      return this.data.playlists[idx];
    }
    return null;
  }

  deletePlaylist(id: string) {
    this.data.playlists = this.data.playlists.filter(p => p.id !== id);
    this.scheduleSave();
  }

  // Likes
  get likes() {
    return this.data.likes;
  }

  toggleLike(userId: string, songId: string): boolean {
    const idx = this.data.likes.findIndex(l => l.userId === userId && l.songId === songId);
    if (idx !== -1) {
      this.data.likes.splice(idx, 1);
      this.scheduleSave();
      return false; // unliked
    } else {
      this.data.likes.push({
        id: `lk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        songId,
        createdAt: new Date().toISOString(),
      });
      this.scheduleSave();
      return true; // liked
    }
  }

  // History
  get history() {
    return this.data.history;
  }

  recordHistory(userId: string, songId: string) {
    // Keep reasonable history, remove recent duplicate if within 1 minute
    const recentIndex = this.data.history.findIndex(
      h => h.userId === userId && h.songId === songId
    );
    if (recentIndex !== -1) {
      this.data.history.splice(recentIndex, 1);
    }
    this.data.history.unshift({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      songId,
      playedAt: new Date().toISOString(),
    });
    // Cap at 200 items per user
    const userHistory = this.data.history.filter(h => h.userId === userId);
    if (userHistory.length > 200) {
      const toRemove = userHistory.slice(200);
      const removeIds = new Set(toRemove.map(h => h.id));
      this.data.history = this.data.history.filter(h => !removeIds.has(h.id));
    }
    // Also increment song play count
    const song = this.data.songs.find(s => s.id === songId);
    if (song) {
      song.playsCount = (song.playsCount || 0) + 1;
    }
    this.scheduleSave();
  }

  // Stories
  get stories() {
    return this.data.stories;
  }

  addStory(story: Story) {
    this.data.stories.unshift(story);
    this.scheduleSave();
    return story;
  }

  updateStory(id: string, updates: Partial<Story>) {
    const idx = this.data.stories.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.stories[idx] = { ...this.data.stories[idx], ...updates, updatedAt: new Date().toISOString() };
      this.scheduleSave();
      return this.data.stories[idx];
    }
    return null;
  }

  deleteStory(id: string) {
    this.data.stories = this.data.stories.filter(s => s.id !== id);
    this.scheduleSave();
  }

  toggleStoryLike(userId: string, storyId: string): { liked: boolean; count: number } {
    const story = this.data.stories.find(s => s.id === storyId);
    if (!story) return { liked: false, count: 0 };
    if (!story.likedBy) story.likedBy = [];
    const idx = story.likedBy.indexOf(userId);
    let liked = false;
    if (idx !== -1) {
      story.likedBy.splice(idx, 1);
      story.likesCount = Math.max(0, story.likesCount - 1);
      liked = false;
    } else {
      story.likedBy.push(userId);
      story.likesCount = (story.likesCount || 0) + 1;
      liked = true;
    }
    this.scheduleSave();
    return { liked, count: story.likesCount };
  }

  // Jam Rooms
  get jamRooms() {
    return this.data.jamRooms;
  }

  getJamRoom(code: string) {
    return this.data.jamRooms.find(r => r.roomCode.toUpperCase() === code.toUpperCase());
  }

  saveJamRoom(room: JamRoom) {
    const idx = this.data.jamRooms.findIndex(r => r.roomCode === room.roomCode);
    if (idx !== -1) {
      this.data.jamRooms[idx] = room;
    } else {
      this.data.jamRooms.push(room);
    }
    this.scheduleSave();
  }

  deleteJamRoom(code: string) {
    this.data.jamRooms = this.data.jamRooms.filter(r => r.roomCode !== code);
    this.scheduleSave();
  }
}

export const db = new Database();
