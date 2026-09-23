import { v4 as uuidv4 } from 'uuid';
import { Song } from '../../src/types/index.js';

export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If directly an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex covering standard watch, shorts, embed, youtu.be, live
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
    /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]{11})/i,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function extractYouTubePlaylistId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If directly playlist ID (usually starts with PL, RD, UU, OLAK, etc.)
  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed) && !trimmed.includes('http')) {
    return trimmed;
  }

  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

export interface VideoMetadata {
  youtubeVideoId: string;
  youtubeUrl: string;
  title: string;
  artist: string;
  channelName: string;
  thumbnailUrl: string;
  duration: number;
  description: string;
  isAvailable: boolean;
}

/**
 * Fetches video metadata either via YouTube Data API v3 or oEmbed fallback
 */
export async function fetchYouTubeVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 1. Try YouTube Data API v3 if API key is present
  if (apiKey) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${videoId}&key=${apiKey}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const snippet = item.snippet;
          const contentDetails = item.contentDetails;
          const status = item.status;

          // Parse ISO 8601 duration (e.g. PT4M21S)
          const durationSec = parseIsoDuration(contentDetails.duration);

          // Clean artist & title
          const { artist, title } = parseArtistAndTitle(snippet.title, snippet.channelTitle);

          const thumbnailUrl = 
            snippet.thumbnails?.maxres?.url || 
            snippet.thumbnails?.high?.url || 
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

          const isEmbeddable = status?.embeddable !== false;

          return {
            youtubeVideoId: videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title,
            artist,
            channelName: snippet.channelTitle || 'YouTube Artist',
            thumbnailUrl,
            duration: durationSec || 210,
            description: snippet.description?.substring(0, 400) || '',
            isAvailable: isEmbeddable,
          };
        }
      }
    } catch (err) {
      console.warn('YouTube Data API fetch failed, falling back to oEmbed:', err);
    }
  }

  // 2. oEmbed Fallback (always works without API key for public videos)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      const rawTitle = data.title || 'Unknown Title';
      const channelTitle = data.author_name || 'YouTube Creator';
      const { artist, title } = parseArtistAndTitle(rawTitle, channelTitle);

      return {
        youtubeVideoId: videoId,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        artist,
        channelName: channelTitle,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        duration: 240, // Estimated duration if API key not available
        description: `Imported from YouTube channel: ${channelTitle}`,
        isAvailable: true,
      };
    }
  } catch (err) {
    console.warn('oEmbed fetch failed:', err);
  }

  // 3. Resilient fallback with standard YouTube CDN thumbnail
  return {
    youtubeVideoId: videoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    title: `YouTube Video (${videoId})`,
    artist: 'YouTube Audio',
    channelName: 'YouTube',
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration: 200,
    description: 'Imported from YouTube',
    isAvailable: true,
  };
}

/**
 * Parses common YouTube title conventions like "Artist - Title (Official Video)"
 */
function parseArtistAndTitle(fullTitle: string, channelName: string): { artist: string; title: string } {
  let cleaned = fullTitle
    .replace(/\s*[\(\[](Official|Audio|Video|Lyrics|Visualizer|HD|4K|Remastered|MV)[\)\]]/gi, '')
    .trim();

  // Check for "Artist - Title" or "Artist – Title"
  const splitDash = cleaned.split(/\s*[-–—:]\s*/);
  if (splitDash.length >= 2) {
    const artist = splitDash[0].trim();
    const title = splitDash.slice(1).join(' - ').trim();
    if (artist && title) {
      return { artist, title };
    }
  }

  return {
    artist: channelName || 'Various Artists',
    title: cleaned || fullTitle,
  };
}

function parseIsoDuration(isoDuration: string): number {
  if (!isoDuration) return 0;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Imports playlist videos using YouTube Data API v3 or sample set
 */
export async function fetchYouTubePlaylistTracks(playlistId: string): Promise<Partial<Song>[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const tracks: Partial<Song>[] = [];

  if (apiKey) {
    try {
      let nextPageToken = '';
      let pageCount = 0;
      do {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        const res = await fetch(apiUrl);
        if (!res.ok) break;
        const data = await res.json();
        
        for (const item of data.items || []) {
          const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
          if (!videoId) continue;

          const title = item.snippet?.title;
          if (title === 'Private video' || title === 'Deleted video') continue;

          const { artist, title: cleanTitle } = parseArtistAndTitle(title, item.snippet?.videoOwnerChannelTitle || '');

          tracks.push({
            id: `sng_yt_${uuidv4().substring(0, 8)}`,
            youtubeVideoId: videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: cleanTitle,
            artist,
            channelName: item.snippet?.videoOwnerChannelTitle || 'YouTube',
            thumbnailUrl: item.snippet?.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            duration: 210,
            isAvailable: true,
            createdAt: new Date().toISOString(),
          });
        }

        nextPageToken = data.nextPageToken || '';
        pageCount++;
      } while (nextPageToken && pageCount < 3); // Max 150 items per import to preserve performance
    } catch (err) {
      console.error('Failed importing YouTube playlist:', err);
    }
  }

  return tracks;
}
