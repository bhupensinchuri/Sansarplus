export interface Song {
  title: string;
  title_nepali?: string;
  artist: string;
  id?: string; // Optional unique ID if needed
  note?: string; // Short note text
}

export interface Artist {
  id?: string;
  name: string;
  bio?: string;
}

export interface Category {
  name: string;
  imageUrl?: string;
  hideTitle?: boolean;
  orderIndex?: number;
}

export interface ContactInfo {
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  email: string;
  whatsapp: string;
  facebookUrl: string;
  footerTitle: string;
  footerText: string;
}

export interface Report {
  id: string | number;
  type: string;
  text: string;
  song_id?: string;
  song_title?: string;
  artist?: string;
  created_at: string;
  status?: 'new' | 'resolved';
}

export interface LyricsData {
  title?: string; // Added for renaming support
  title_nepali?: string; // Localized title
  lyrics?: string;
  composer: string; // Legacy Display String
  composers?: string[]; // New Array for multiple
  lyricist: string; // Legacy Display String
  lyricists?: string[]; // New Array for multiple
  singer?: string; // Display String for Vocals
  singers?: string[]; // Array for multiple vocalists
  lyrics_roman?: string;
  lyrics_nepali?: string;
  views?: number;
  category?: string; // Legacy Genre/Style
  categories?: string[]; // New Multi-select Genres
  artist?: string; // Display Name (e.g., "Artist A feat. Artist B")
  artists?: string[]; // Individual Artist Names for indexing
  youtubeUrl?: string;
  isYoutubeVisible?: boolean;
  language?: 'nepali' | 'hindi' | 'english'; // Language flag
  note?: string; // Added: Song note
  isNoteVisible?: boolean; // Added: Toggle for visibility
}

export interface SearchResult {
  type: 'artist' | 'song' | 'category';
  name: string;
  name_nepali?: string;
  subtext: string; // Artist for songs, 'Artist' for artists, 'Category' for categories
  language?: string;
  imageUrl?: string; // Added for artist/category thumbnails
  id?: string | number; // Added for links
  note?: string; // Added: Song note
}

export interface ArtistDetails {
  id?: string;
  name: string;
  bio: string;
  topSongs: string[];
  imageUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  // Visibility Flags
  isFacebookVisible?: boolean;
  isInstagramVisible?: boolean;
  isArtistYoutubeVisible?: boolean;
}

export interface HomeData {
  trendingSongs: { id: string | number; title: string; title_nepali?: string; artist: string; language?: string; note?: string }[];
  popularArtists: { name: string; roles: string[]; imageUrl?: string }[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string; // Verse text
  subtitle: string; // Verse reference
  link?: string; // Optional URL to navigate to
}

export interface Announcement {
  imageUrl: string;
  link: string;
  isVisible: boolean;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}