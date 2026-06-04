import { getCurrentUser } from './auth';

export interface FavoriteItem {
  id: string; // Internal storage key: "artist-Name" or "song-Title-Artist"
  dbId?: string | number; // Actual database ID for reliable linking
  type: 'artist' | 'song';
  name: string;
  name_nepali?: string; // Added for localized display
  subtext: string; // Artist for songs, Genre for artists (if available)
  language?: string;
  note?: string; // Added: Song note
}

// Helper to get storage key based on current user
const getStorageKey = () => {
  const user = getCurrentUser();
  if (user) {
    return `lyricvault_favorites_${user.username}`;
  }
  return 'lyricvault_favorites_guest'; // Fallback for non-logged in users
};

export const getFavorites = (): FavoriteItem[] => {
  try {
    const stored = localStorage.getItem(getStorageKey());
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const isFavorite = (id: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id);
};

export const toggleFavorite = (item: FavoriteItem): boolean => {
  const favorites = getFavorites();
  const exists = favorites.some(f => f.id === item.id);
  
  let newFavorites;
  if (exists) {
    newFavorites = favorites.filter(f => f.id !== item.id);
  } else {
    newFavorites = [...favorites, item];
  }
  
  localStorage.setItem(getStorageKey(), JSON.stringify(newFavorites));
  return !exists; // Returns true if added, false if removed
};

export const generateId = (type: 'artist' | 'song', name: string, subtext?: string) => {
  return type === 'artist' 
    ? `artist-${name.toLowerCase().replace(/\s+/g, '-')}` 
    : `song-${name.toLowerCase().replace(/\s+/g, '-')}-${subtext?.toLowerCase().replace(/\s+/g, '-')}`;
};