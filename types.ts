
export interface Song {
  title: string;
  artist: string;
  id?: string; // Optional unique ID if needed
}

export interface Artist {
  name: string;
  bio?: string;
}

export interface LyricsData {
  lyrics?: string;
  composer: string;
  lyricist: string;
  lyrics_roman?: string;
  lyrics_nepali?: string;
  views?: number;
  category?: string; // Genre/Style
}

export interface SearchResult {
  type: 'artist' | 'song';
  name: string;
  subtext: string; // Artist name for songs, 'Artist' for artists
}

export interface ArtistDetails {
  name: string;
  bio: string;
  topSongs: string[];
  imageUrl?: string;
}

export interface HomeData {
  trendingSongs: { title: string; artist: string }[];
  popularArtists: string[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string; // Verse text
  subtitle: string; // Verse reference
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
