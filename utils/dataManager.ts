
import { LyricsData, ArtistDetails, Banner } from '../types';
import { generateId } from './storage';

// Keys for local storage
const CUSTOM_SONGS_KEY = 'sansarplus_custom_songs';
const CUSTOM_ARTISTS_KEY = 'sansarplus_custom_artists';
const SONG_VIEWS_KEY = 'sansarplus_song_views';
const BANNERS_KEY = 'sansarplus_banners';

interface CustomSong extends LyricsData {
  id: string;
  title: string;
  artist: string;
  lastUpdated: number;
}

interface CustomArtist extends ArtistDetails {
  id: string;
  lastUpdated: number;
}

// Default Banners (15 Verses) in Nepali
const DEFAULT_BANNERS: Banner[] = [
  { id: 'b1', imageUrl: 'https://picsum.photos/seed/verse1/1200/400', title: 'किनकि परमेश्वरले संसारलाई यस्तो प्रेम गर्नुभयो कि उहाँले आफ्ना एकमात्र पुत्र दिनुभयो, ताकि उहाँमाथि विश्वास गर्ने कोही पनि नाश नहोस्, तर त्यसले अनन्त जीवन पाओस्।', subtitle: 'यूहन्ना ३:१६' },
  { id: 'b2', imageUrl: 'https://picsum.photos/seed/verse2/1200/400', title: 'परमप्रभु मेरो गोठालो हुनुहुन्छ; मलाई केहीको अभाव हुँदैन।', subtitle: 'भजनसंग्रह २३:१' },
  { id: 'b3', imageUrl: 'https://picsum.photos/seed/verse3/1200/400', title: 'जसले मलाई शक्ति दिनुहुन्छ, उहाँमा म सब कुरा गर्न सक्छु।', subtitle: 'फिलिप्पी ४:१३' },
  { id: 'b4', imageUrl: 'https://picsum.photos/seed/verse4/1200/400', title: 'किनकि जुन योजनाहरू मैले तिमीहरूका लागि बनाएको छु, ती म जान्दछु, परमप्रभु भन्नुहुन्छ, तिमीहरूका भलाईका योजनाहरू, हानीका होइनन्, तिमीहरूलाई एउटा भविष्य र आशा दिनलाई।', subtitle: 'यर्मिया २९:११' },
  { id: 'b5', imageUrl: 'https://picsum.photos/seed/verse5/1200/400', title: 'र हामी जान्दछौं कि परमेश्वरलाई प्रेम गर्नेहरूका निम्ति, अर्थात् उहाँको उद्देश्य अनुसार बोलाइएकाहरूका निम्ति सबै कुराले भलाइको लागि मिलिजुली काम गर्छ।', subtitle: 'रोमी ८:२८' },
  { id: 'b6', imageUrl: 'https://picsum.photos/seed/verse6/1200/400', title: 'नडरा, किनकि म तँसँग छु; विचलित नहो, किनकि म तेरा परमेश्वर हुँ; म तँलाई बलियो पार्नेछु; म तँलाई सहायता गर्नेछु।', subtitle: 'यशैया ४१:१०' },
  { id: 'b7', imageUrl: 'https://picsum.photos/seed/verse7/1200/400', title: 'के मैले तँलाई आज्ञा गरेको छैन र? बलियो र साहसी हो; नडरा, र निराश नहो, किनकि परमप्रभु तेरा परमेश्वर तँ जहाँ गए पनि तँसँग हुनुहुन्छ।', subtitle: 'यहोशू १:९' },
  { id: 'b8', imageUrl: 'https://picsum.photos/seed/verse8/1200/400', title: 'र हेर, म युगको अन्त्यसम्म सधैं तिमीहरूसँग छु।', subtitle: 'मत्ती २८:२०' },
  { id: 'b9', imageUrl: 'https://picsum.photos/seed/verse9/1200/400', title: 'परमेश्वर हाम्रो शरणस्थान र शक्ति हुनुहुन्छ, सङ्कष्टमा अति सजिलैसँग पाइने सहायता।', subtitle: 'भजनसंग्रह ४६:१' },
  { id: 'b10', imageUrl: 'https://picsum.photos/seed/verse10/1200/400', title: 'आफ्नो सारा हृदयले परमप्रभुमा भरोसा राख्, र आफ्नै समझशक्तिमा भर नपर्।', subtitle: 'हितोपदेश ३:५' },
  { id: 'b11', imageUrl: 'https://picsum.photos/seed/verse11/1200/400', title: 'प्रेम धैर्यवान् हुन्छ, र दयालु हुन्छ; प्रेमले डाह गर्दैन; प्रेमले धाक लगाउँदैन, ऊ घमण्ड गर्दैन।', subtitle: '१ कोरिन्थी १३:४' },
  { id: 'b12', imageUrl: 'https://picsum.photos/seed/verse12/1200/400', title: 'तर पवित्र आत्माको फल प्रेम, आनन्द, शान्ति, धैर्य, दया, भलाइ, विश्वास हो।', subtitle: 'गलाती ५:२२' },
  { id: 'b13', imageUrl: 'https://picsum.photos/seed/verse13/1200/400', title: 'तपाईंको वचन मेरो खुट्टाको निम्ति बत्ती र मेरो बाटोको निम्ति उज्यालो हो।', subtitle: 'भजनसंग्रह ११९:१०५' },
  { id: 'b14', imageUrl: 'https://picsum.photos/seed/verse14/1200/400', title: 'तर परमप्रभुको बाटो हेर्नेहरूले नयाँ बल पाउनेछन्; तिनीहरू गरूडझैं पखेटा फिँजाएर उड्नेछन्।', subtitle: 'यशैया ४०:३१' },
  { id: 'b15', imageUrl: 'https://picsum.photos/seed/verse15/1200/400', title: 'हे सबै थाकेका र बोझले दबिएका हो, मकहाँ आओ, र म तिमीहरूलाई विश्राम दिनेछु।', subtitle: 'मत्ती ११:२८' }
];

// --- Helpers ---

const getCustomSongsMap = (): Record<string, CustomSong> => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_SONGS_KEY) || '{}');
  } catch { return {}; }
};

const getCustomArtistsMap = (): Record<string, CustomArtist> => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_ARTISTS_KEY) || '{}');
  } catch { return {}; }
};

const getViewsMap = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(SONG_VIEWS_KEY) || '{}');
  } catch { return {}; }
};

const getBannersList = (): Banner[] => {
  try {
    const stored = localStorage.getItem(BANNERS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_BANNERS;
  } catch { return DEFAULT_BANNERS; }
};

const saveSongsMap = (map: Record<string, CustomSong>) => {
  localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(map));
};

const saveArtistsMap = (map: Record<string, CustomArtist>) => {
  localStorage.setItem(CUSTOM_ARTISTS_KEY, JSON.stringify(map));
};

const saveViewsMap = (map: Record<string, number>) => {
  localStorage.setItem(SONG_VIEWS_KEY, JSON.stringify(map));
};

const saveBannersList = (list: Banner[]) => {
  localStorage.setItem(BANNERS_KEY, JSON.stringify(list));
};

// --- VIEWS API ---

export const getViewCount = (artist: string, title: string): number => {
  const map = getViewsMap();
  const id = generateId('song', title, artist);
  return map[id] || 0;
};

export const setViewCount = (artist: string, title: string, count: number) => {
  const map = getViewsMap();
  const id = generateId('song', title, artist);
  map[id] = count;
  saveViewsMap(map);
};

export const incrementViewCount = (artist: string, title: string): number => {
  const map = getViewsMap();
  const id = generateId('song', title, artist);
  const current = map[id] || 0;
  const next = current + 1;
  map[id] = next;
  saveViewsMap(map);
  return next;
};

// --- SONGS API ---

export const saveCustomSong = (artist: string, title: string, data: LyricsData) => {
  const map = getCustomSongsMap();
  const id = generateId('song', title, artist);
  
  // If views are provided in data, update them too
  if (typeof data.views === 'number') {
      setViewCount(artist, title, data.views);
  }
  
  map[id] = {
    ...data,
    id,
    title,
    artist,
    lastUpdated: Date.now()
  };
  
  saveSongsMap(map);
};

export const getCustomSong = (artist: string, title: string): CustomSong | null => {
  const map = getCustomSongsMap();
  const id = generateId('song', title, artist);
  return map[id] || null;
};

export const deleteCustomSong = (artist: string, title: string) => {
  const map = getCustomSongsMap();
  const id = generateId('song', title, artist);
  if (map[id]) {
    delete map[id];
    saveSongsMap(map);
  }
};

export const getAllCustomSongs = (): CustomSong[] => {
  const map = getCustomSongsMap();
  return Object.values(map).sort((a, b) => b.lastUpdated - a.lastUpdated);
};

// --- ARTISTS API ---

export const saveCustomArtist = (name: string, data: ArtistDetails) => {
  const map = getCustomArtistsMap();
  const id = generateId('artist', name);
  
  map[id] = {
    ...data,
    id,
    lastUpdated: Date.now()
  };
  
  saveArtistsMap(map);
};

export const getCustomArtist = (name: string): CustomArtist | null => {
  const map = getCustomArtistsMap();
  const id = generateId('artist', name);
  return map[id] || null;
};

export const deleteCustomArtist = (name: string) => {
  const map = getCustomArtistsMap();
  const id = generateId('artist', name);
  if (map[id]) {
    delete map[id];
    saveArtistsMap(map);
  }
};

export const getAllCustomArtists = (): CustomArtist[] => {
  const map = getCustomArtistsMap();
  return Object.values(map).sort((a, b) => b.lastUpdated - a.lastUpdated);
};

// --- BANNERS API ---

export const getBanners = (): Banner[] => {
  return getBannersList();
};

export const saveBanner = (banner: Banner) => {
  const list = getBannersList();
  // If exists update, else add
  const idx = list.findIndex(b => b.id === banner.id);
  if (idx >= 0) {
    list[idx] = banner;
  } else {
    list.push(banner);
  }
  saveBannersList(list);
};

export const deleteBanner = (id: string) => {
  const list = getBannersList();
  const newList = list.filter(b => b.id !== id);
  saveBannersList(newList);
};
