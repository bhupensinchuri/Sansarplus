
import { GoogleGenAI, Type } from "@google/genai";
import { LyricsData, SearchResult, ArtistDetails, HomeData } from "../types";
import { 
  getCustomSong, 
  getCustomArtist, 
  getAllCustomSongs, 
  getAllCustomArtists,
  getCategories,
  getSongById
} from "../utils/dataManager";

// Export getSongById so it is accessible to components like FavoritesPage that import it from this service
export { getSongById };

// Helper map for Nepali Index to Romanized search
const NEPALI_TO_ROMAN_MAP: Record<string, string[]> = {
  'अ': ['a'], 'आ': ['aa', 'a'], 'इ': ['i', 'e'], 'ई': ['ee', 'i'], 'उ': ['u'], 'ऊ': ['oo', 'u'], 
  'ए': ['e'], 'ऐ': ['ai'], 'ओ': ['o'], 'औ': ['au'], 'अं': ['am'], 'अः': ['ah'],
  'क': ['k'], 'ख': ['kh'], 'ग': ['g'], 'घ': ['gh'], 'ङ': ['ng'],
  'च': ['ch'], 'छ': ['chh'], 'ज': ['j'], 'झ': ['jh', 'z'], 'ञ': ['yn'],
  'ट': ['t'], 'ठ': ['th'], 'ड': ['d'], 'ढ': ['dh'], 'ण': ['n'],
  'त': ['t'], 'थ': ['th'], 'द': ['d'], 'ध': ['dh'], 'न': ['n'],
  'प': ['p'], 'फ': ['ph', 'f'], 'ब': ['b'], 'भ': ['bh'], 'म': ['m'],
  'य': ['y'], 'र': ['r'], 'ल': ['l'], 'व': ['w', 'v'],
  'श': ['sh', 's'], 'ष': ['sh', 's'], 'स': ['s'], 'ह': ['h'],
  'क्ष': ['ksh'], 'त्र': ['tr'], 'ज्ञ': ['gy']
};

export const getTrendingContent = async (): Promise<HomeData | null> => {
  try {
    const allSongs = await getAllCustomSongs();
    const allArtists = await getAllCustomArtists();

    const trendingSongs = allSongs
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(s => ({ 
          id: s.id,
          title: s.title, 
          title_nepali: s.title_nepali, 
          artist: s.artist, 
          language: s.language,
          note: s.note
      }));

    const artistViews: Record<string, number> = {};
    allSongs.forEach(song => {
        const v = song.views || 0;
        // Split artist string if comma-separated to credit multiple main artists
        const mainArtists = (song.artists && song.artists.length > 0) 
            ? song.artists 
            : song.artist.split(',').map((a: string) => a.trim());

        mainArtists.forEach((name: string) => {
            const trimmed = name.trim();
            if (trimmed && trimmed.toLowerCase() !== 'unknown') {
                artistViews[trimmed] = (artistViews[trimmed] || 0) + v;
            }
        });
    });

    const sortedArtists = allArtists
      .map(a => ({ 
          name: a.name,
          imageUrl: a.imageUrl, 
          totalViews: artistViews[a.name] || 0 
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10);

    const popularArtists = sortedArtists.map(artist => {
        const lowerName = artist.name.toLowerCase();
        const roles = new Set<string>();

        for (const song of allSongs) {
            const compList = (song.composers || []).concat(song.composer ? [song.composer] : []);
            if (compList.some((c: string) => c.toLowerCase() === lowerName)) roles.add('Composer');

            const lyrList = (song.lyricists || []).concat(song.lyricist ? [song.lyricist] : []);
            if (lyrList.some((l: string) => l.toLowerCase() === lowerName)) roles.add('Lyricist');

            const singList = (song.singers || []).concat(song.singer ? [song.singer] : []);
            if (singList.some((v: string) => v.toLowerCase() === lowerName)) roles.add('Singer');
            
            // Check main artists
            const mainArtists = (song.artists && song.artists.length > 0) 
                ? song.artists.map((a: string) => a.toLowerCase().trim()) 
                : song.artist.split(',').map((a: string) => a.toLowerCase().trim());
                
            if (mainArtists.includes(lowerName)) roles.add('Singer');
        }

        if (roles.size === 0) roles.add('Artist');

        const orderedRoles: string[] = [];
        if (roles.has('Singer')) orderedRoles.push('Singer');
        if (roles.has('Composer')) orderedRoles.push('Composer');
        if (roles.has('Lyricist')) orderedRoles.push('Lyricist');
        roles.forEach(r => {
            if (r !== 'Singer' && r !== 'Composer' && r !== 'Lyricist') orderedRoles.push(r);
        });

        return {
            name: artist.name,
            imageUrl: artist.imageUrl,
            roles: orderedRoles.slice(0, 3)
        };
    });

    return {
      trendingSongs,
      popularArtists
    };
  } catch (error) {
    console.error("Error fetching trending content:", error);
    return { trendingSongs: [], popularArtists: [] };
  }
};

export const getSongsByLetter = async (letter: string): Promise<{id: string, title: string, title_nepali?: string, artist: string, language?: string, note?: string}[]> => {
  try {
    const allSongs = await getAllCustomSongs();
    const isAll = letter.toLowerCase() === 'all';
    const mappedPrefixes = NEPALI_TO_ROMAN_MAP[letter];

    return allSongs
      .filter(s => {
        if (isAll) return true;
        const titleLower = s.title.toLowerCase();
        if (mappedPrefixes) {
            return mappedPrefixes.some(prefix => titleLower.startsWith(prefix)) || titleLower.startsWith(letter);
        }
        const charCode = letter.toLowerCase();
        if (charCode === '0-9') return /^\d/.test(titleLower);
        return titleLower.startsWith(charCode);
      })
      .map(s => ({ 
          id: s.id,
          title: s.title, 
          title_nepali: s.title_nepali, 
          artist: s.artist, 
          language: s.language,
          note: s.note
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    return [];
  }
};

export interface ArtistWithRoles {
    name: string;
    roles: string[];
    imageUrl?: string;
}

export const getArtistsByLetter = async (letter: string): Promise<ArtistWithRoles[]> => {
  try {
    const [allArtistProfiles, allSongs] = await Promise.all([
        getAllCustomArtists(),
        getAllCustomSongs()
    ]);
    
    // 1. Collect all unique artist names from both profiles and song credits
    const artistNamesMap = new Map<string, { name: string, imageUrl?: string }>();
    
    // Add existing profiles
    allArtistProfiles.forEach(p => {
        artistNamesMap.set(p.name.toLowerCase().trim(), { name: p.name, imageUrl: p.imageUrl });
    });

    // Add artists mentioned in songs (main artist, singers, composers, lyricists)
    allSongs.forEach(song => {
        const mainArtists = (song.artists && song.artists.length > 0) 
            ? song.artists 
            : song.artist.split(',').map((a: string) => a.trim());

        const contributors = [
            ...mainArtists,
            ...(song.singers || []),
            ...(song.composers || []),
            ...(song.lyricists || [])
        ];

        contributors.forEach(name => {
            if (name && typeof name === 'string') {
                const trimmed = name.trim();
                const lower = trimmed.toLowerCase();
                if (trimmed && lower !== 'unknown' && !artistNamesMap.has(lower)) {
                    artistNamesMap.set(lower, { name: trimmed });
                }
            }
        });
    });

    const isAll = letter.toLowerCase() === 'all';
    const mappedPrefixes = NEPALI_TO_ROMAN_MAP[letter];

    // 2. Filter the unified list of names by letter
    const filteredArtistNames = Array.from(artistNamesMap.values())
      .filter(a => {
        if (isAll) return true;
        const nameLower = a.name.toLowerCase();
        if (mappedPrefixes) {
             return mappedPrefixes.some(prefix => nameLower.startsWith(prefix)) || nameLower.startsWith(letter);
        }
        const charCode = letter.toLowerCase();
        if (charCode === '0-9') return /^\d/.test(nameLower);
        return nameLower.startsWith(charCode);
      });

    // 3. Map names to objects with roles
    return filteredArtistNames.map(artist => {
        const lowerName = artist.name.toLowerCase();
        const roles = new Set<string>();

        for (const song of allSongs) {
            const compList = (song.composers || []).concat(song.composer ? [song.composer] : []);
            if (compList.some((c: string) => c.toLowerCase() === lowerName)) roles.add('Composer');

            const lyrList = (song.lyricists || []).concat(song.lyricist ? [song.lyricist] : []);
            if (lyrList.some((l: string) => l.toLowerCase() === lowerName)) roles.add('Lyricist');

            const singList = (song.singers || []).concat(song.singer ? [song.singer] : []);
            if (singList.some((v: string) => v.toLowerCase() === lowerName)) roles.add('Singer');
            
            const mainArtists = (song.artists && song.artists.length > 0) 
                ? song.artists.map((a: string) => a.toLowerCase().trim()) 
                : song.artist.split(',').map((a: string) => a.toLowerCase().trim());
                
            if (mainArtists.includes(lowerName)) roles.add('Singer');
        }

        if (roles.size === 0) roles.add('Artist');

        const orderedRoles: string[] = [];
        if (roles.has('Singer')) orderedRoles.push('Singer');
        if (roles.has('Composer')) orderedRoles.push('Composer');
        if (roles.has('Lyricist')) orderedRoles.push('Lyricist');

        return {
            name: artist.name,
            imageUrl: artist.imageUrl,
            roles: orderedRoles
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error in getArtistsByLetter:", error);
    return [];
  }
};

export const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const [allSongs, allArtists, allCategories] = await Promise.all([
        getAllCustomSongs(),
        getAllCustomArtists(),
        getCategories()
    ]);

    const songResults: SearchResult[] = allSongs
      .filter(s => {
          if (s.title.toLowerCase().includes(q) || 
              (s.title_nepali && s.title_nepali.toLowerCase().includes(q)) ||
              s.artist.toLowerCase().includes(q) || 
              (s.lyrics_nepali && s.lyrics_nepali.toLowerCase().includes(q)) || 
              (s.lyrics_roman && s.lyrics_roman.toLowerCase().includes(q))) {
              return true;
          }
          if (s.categories && s.categories.some((cat: string) => cat.toLowerCase().includes(q))) {
              return true;
          }
          if (s.category && s.category.toLowerCase().includes(q)) {
              return true;
          }
          return false;
      })
      .map(s => ({ 
          type: 'song', 
          id: s.id, // Included ID for links
          name: s.title, 
          name_nepali: s.title_nepali,
          subtext: s.artist, 
          language: s.language,
          note: s.note
      }));

    const artistResults: SearchResult[] = allArtists
      .filter(a => a.name.toLowerCase().includes(q))
      .map(a => ({ type: 'artist', name: a.name, subtext: 'Artist', imageUrl: a.imageUrl }));

    const categoryResults: SearchResult[] = (allCategories || [])
      .filter(c => c.name.toLowerCase().includes(q))
      .map(c => ({ type: 'category', name: c.name, subtext: 'Category', imageUrl: c.imageUrl }));

    return [...categoryResults, ...artistResults, ...songResults].slice(0, 50);
  } catch (error) {
    return [];
  }
};

export const getArtistDetails = async (artistName: string): Promise<ArtistDetails | null> => {
  return await getCustomArtist(artistName); 
};

export const getSongLyrics = async (artist: string, title: string): Promise<LyricsData | null> => {
  const localData = await getCustomSong(artist, title);
  if (localData) {
    return localData as LyricsData;
  }
  return null;
};

/**
 * Uses Gemini AI to transliterate Nepali/Hindi lyrics into high-quality Romanized text.
 * This handles context, common words, and phonetic nuances better than simple mapping.
 */
export const transliterateNepaliToRoman = async (text: string): Promise<string> => {
  if (!text || text.trim().length < 5) return "";
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Transliterate the following Nepali/Hindi song lyrics into Romanized text (Phonetic English). 
      Maintain the line breaks and structure. Do not translate the meaning, just transliterate the sounds.
      
      Lyrics:
      ${text}`,
      config: {
        systemInstruction: "You are a professional transliterator for Nepali and Hindi music. Your goal is to provide accurate, readable Romanized lyrics that follow standard conventions used in the Nepali Christian music community.",
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Transliteration failed:", error);
    return "";
  }
};
