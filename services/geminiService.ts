
import { LyricsData, SearchResult, ArtistDetails, HomeData } from "../types";
import { 
  getCustomSong, 
  getCustomArtist, 
  getViewCount, 
  getAllCustomSongs, 
  getAllCustomArtists 
} from "../utils/dataManager";

// NOTE: AI Generation has been removed. This service now acts as a wrapper for local dataManager lookups.

export const getTrendingContent = async (): Promise<HomeData | null> => {
  try {
    const allSongs = getAllCustomSongs();
    const allArtists = getAllCustomArtists();

    // Sort songs by view count descending
    const trendingSongs = allSongs
      .map(s => {
          // Ensure we have the latest view count
          const views = getViewCount(s.artist, s.title);
          return { ...s, views };
      })
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 15)
      .map(s => ({ title: s.title, artist: s.artist }));

    // For artists, we don't have explicit views, so we return the most recently updated or just the list
    const popularArtists = allArtists
      .slice(0, 12)
      .map(a => a.name);

    return {
      trendingSongs,
      popularArtists
    };
  } catch (error) {
    console.error("Error fetching trending content:", error);
    return { trendingSongs: [], popularArtists: [] };
  }
};

export const getSongsByLetter = async (letter: string): Promise<{title: string, artist: string}[]> => {
  try {
    const allSongs = getAllCustomSongs();
    const isAll = letter.toLowerCase() === 'all';
    const charCode = letter.toLowerCase();

    return allSongs
      .filter(s => {
        if (isAll) return true;
        const titleLower = s.title.toLowerCase();
        if (charCode === '0-9') return /^\d/.test(titleLower);
        return titleLower.startsWith(charCode);
      })
      .map(s => ({ title: s.title, artist: s.artist }))
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error(`Error fetching songs for ${letter}:`, error);
    return [];
  }
};

export const getArtistsByLetter = async (letter: string): Promise<string[]> => {
  try {
    const allArtists = getAllCustomArtists();
    const isAll = letter.toLowerCase() === 'all';
    const charCode = letter.toLowerCase();

    return allArtists
      .filter(a => {
        if (isAll) return true;
        const nameLower = a.name.toLowerCase();
        if (charCode === '0-9') return /^\d/.test(nameLower);
        return nameLower.startsWith(charCode);
      })
      .map(a => a.name)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error(`Error fetching artists for ${letter}:`, error);
    return [];
  }
};

export const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const allSongs = getAllCustomSongs();
    const allArtists = getAllCustomArtists();

    const songResults: SearchResult[] = allSongs
      .filter(s => 
          s.title.toLowerCase().includes(q) || 
          s.artist.toLowerCase().includes(q) || 
          (s.lyrics_nepali && s.lyrics_nepali.toLowerCase().includes(q)) || 
          (s.lyrics_roman && s.lyrics_roman.toLowerCase().includes(q))
      )
      .map(s => ({ type: 'song', name: s.title, subtext: s.artist }));

    const artistResults: SearchResult[] = allArtists
      .filter(a => a.name.toLowerCase().includes(q))
      .map(a => ({ type: 'artist', name: a.name, subtext: 'Artist' }));

    // Combine and limit results
    return [...artistResults, ...songResults].slice(0, 20);
  } catch (error) {
    console.error("Error searching:", error);
    return [];
  }
};

export const getArtistDetails = async (artistName: string): Promise<ArtistDetails | null> => {
  // Only return data if it exists locally
  const localData = getCustomArtist(artistName);
  return localData || null; 
};

export const getSongLyrics = async (artist: string, title: string): Promise<LyricsData | null> => {
  // Get Views from persistent storage
  const currentViews = getViewCount(artist, title);

  // Check local storage for song data
  const localData = getCustomSong(artist, title);
  
  if (localData) {
    return { ...localData, views: currentViews };
  }
  
  // Return null if not found locally (no AI generation)
  return null;
};
