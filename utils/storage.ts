export interface FavoriteItem {
  id: string; // "artist-Name" or "song-Title-Artist"
  type: 'artist' | 'song';
  name: string;
  subtext: string; // Artist for songs, Genre for artists (if available)
}

const STORAGE_KEY = 'lyricvault_favorites';

export const getFavorites = (): FavoriteItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
  return !exists; // Returns true if added, false if removed
};

export const generateId = (type: 'artist' | 'song', name: string, subtext?: string) => {
  return type === 'artist' 
    ? `artist-${name.toLowerCase().replace(/\s+/g, '-')}` 
    : `song-${name.toLowerCase().replace(/\s+/g, '-')}-${subtext?.toLowerCase().replace(/\s+/g, '-')}`;
};