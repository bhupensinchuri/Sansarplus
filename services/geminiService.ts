import { GoogleGenAI, Type } from "@google/genai";
import { LyricsData, SearchResult, ArtistDetails, HomeData } from "../types";
import { getCustomSong, getCustomArtist, getViewCount } from "../utils/dataManager";

// Note: We instantiate the client inside each function to ensure we pick up the latest 
// process.env.API_KEY, which resolves potential race conditions or 403 errors 
// if the key is injected/selected after module load.

const MODEL_NAME = "gemini-2.5-flash";

// --- Helper for JSON parsing ---
const cleanAndParseJSON = (text: string) => {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
};

// --- API Functions ---

export const getTrendingContent = async (): Promise<HomeData | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a list of trending content for a Nepali Christian lyrics website.
      Return a JSON object with:
      1. "trendingSongs": An array of 15 currently popular Nepali Christian songs ({title, artist}).
      2. "popularArtists": An array of 12 popular Nepali Christian artists or bands (strings).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trendingSongs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, artist: { type: Type.STRING } }
              }
            },
            popularArtists: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Error fetching trending:", error);
    return null;
  }
};

export const getSongsByLetter = async (letter: string): Promise<{title: string, artist: string}[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const isAll = letter.toLowerCase() === 'all';
    const prompt = isAll 
      ? `List 20 famous Nepali Christian songs or hymns from various artists. Return a JSON array of objects with "title" and "artist".`
      : `List 20 famous Nepali Christian songs or hymns whose titles start with the letter '${letter}' (or begin with a number if the letter is '0-9'). Return a JSON array of objects with "title" and "artist".`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING }
            }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  } catch (error) {
    console.error(`Error fetching songs for ${letter}:`, error);
    return [];
  }
};

export const getArtistsByLetter = async (letter: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const isAll = letter.toLowerCase() === 'all';
    const prompt = isAll
      ? `List 20 famous Nepali Christian music artists, worship leaders, or bands. Return a JSON array of strings.`
      : `List 20 famous Nepali Christian music artists, worship leaders, or bands whose names start with the letter '${letter}' (or begin with a number if the letter is '0-9'). Return a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  } catch (error) {
    console.error(`Error fetching artists for ${letter}:`, error);
    return [];
  }
};

export const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for Nepali Christian music artists, worship bands, and songs matching the query "${query}". 
      If the query is asking for songs by a specific composer or writer in the Nepali Christian community, list popular songs they worked on.
      Return a mixed list of up to 10 most relevant results.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["artist", "song"] },
              name: { type: Type.STRING },
              subtext: { type: Type.STRING, description: "Artist name if type is song, 'Artist' string if type is artist" }
            }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  } catch (error) {
    console.error("Error searching:", error);
    return [];
  }
};

export const getArtistDetails = async (artistName: string): Promise<ArtistDetails | null> => {
  // Check local override first
  const localData = getCustomArtist(artistName);
  if (localData) {
    return localData;
  }

   try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Provide detailed info for the Nepali Christian artist or band "${artistName}". Include a bio and a list of their 10 most popular songs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            bio: { type: Type.STRING },
            topSongs: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Error fetching artist details:", error);
    return null;
  }
};

export const getSongLyrics = async (artist: string, title: string): Promise<LyricsData | null> => {
  // Get Views from persistent storage
  const currentViews = getViewCount(artist, title);

  // Check local override first for song data
  const localData = getCustomSong(artist, title);
  if (localData) {
    return { ...localData, views: currentViews };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate the full lyrics for the Nepali Christian song "${title}" by "${artist}". 
      If available, include the names of the Composer(s) and Lyricist(s) from the Nepali Christian community.
      Also identify the best fitting 'category' or genre (e.g., Worship, Hymn, Pop, Rock, Folk).
      Please provide two versions of the lyrics:
      1. 'lyrics_roman': The lyrics in Romanized Nepali (English alphabet).
      2. 'lyrics_nepali': The lyrics in traditional Nepali script (Devanagari).
      Ensure both versions are properly formatted with newline characters.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lyrics_roman: { type: Type.STRING },
            lyrics_nepali: { type: Type.STRING },
            composer: { type: Type.STRING },
            lyricist: { type: Type.STRING },
            category: { type: Type.STRING }
          }
        }
      }
    });
    
    const apiData = cleanAndParseJSON(response.text);
    if (apiData) {
        return { ...apiData, views: currentViews };
    }
    return null;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return null;
  }
};