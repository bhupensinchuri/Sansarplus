import { LyricsData, ArtistDetails, Banner, Announcement, Category, ContactInfo, Report } from '../types';
import { supabase } from '../supabaseClient';
import { convertToRoman } from './nepaliConverter';

export interface BackupData {
    songs: any[];
    artists: any[];
    banners: Banner[];
    categories: Category[];
    announcement: Announcement | null;
    contactInfo: ContactInfo | null;
    siteLogo: string;
}

export interface AnalyticsData {
    lifetime: number;
    today: number;
    thisWeek: number;
    lastWeek: number;
}

// --- HELPER: Safe JSON Parse ---
const safeJsonParse = (val: string | null, fallback: any) => {
    if (!val) return fallback;
    try {
        return JSON.parse(val);
    } catch (e) {
        console.error("JSON Parse failed for setting:", e);
        return fallback;
    }
};

// --- HELPER: Offline Cache ---
const OFFLINE_CACHE_KEYS = {
    SONGS: 'sp_cache_songs',
    ARTISTS: 'sp_cache_artists',
    CATEGORIES: 'sp_cache_categories',
    BANNERS: 'sp_cache_banners',
    SETTINGS: 'sp_cache_settings'
};

const getCached = (key: string) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

const setCache = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn("Offline cache failed (likely full):", e);
    }
};

// --- SONGS ---
export const getAllCustomSongs = async (): Promise<any[]> => {
    try {
        const { data, error } = await supabase.from('songs').select('*');
        if (error) throw error;
        
        const songs = (data || []).map((s: any) => ({
            ...s,
            youtubeUrl: s.youtube_url,
            isYoutubeVisible: s.is_youtube_visible,
            title_nepali: s.title_nepali,
            isNoteVisible: s.is_note_visible
        }));

        setCache(OFFLINE_CACHE_KEYS.SONGS, songs);
        return songs;
    } catch (error: any) {
        console.warn("Fetch songs failed, using offline cache:", error.message);
        return getCached(OFFLINE_CACHE_KEYS.SONGS) || [];
    }
};

export const getSongById = async (id: string | number): Promise<any | null> => {
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error || !data) return null;
    return {
        ...data,
        youtubeUrl: data.youtube_url,
        isYoutubeVisible: data.is_youtube_visible,
        title_nepali: data.title_nepali,
        isNoteVisible: data.is_note_visible
    };
};

export const getCustomSong = async (artist: string, title: string): Promise<any | null> => {
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .ilike('title', title.trim())
        .ilike('artist', artist.trim())
        .maybeSingle();
    if (error || !data) return null;
    return {
        ...data,
        youtubeUrl: data.youtube_url,
        isYoutubeVisible: data.is_youtube_visible,
        title_nepali: data.title_nepali,
        isNoteVisible: data.is_note_visible
    };
};

export const saveCustomSong = async (artist: string, title: string, data: LyricsData & { id?: any }) => {
    // 1. Determine existing record
    let existingRecord = null;
    if (data.id) {
        const { data: byId } = await supabase.from('songs').select('id').eq('id', data.id).maybeSingle();
        existingRecord = byId;
    } else {
        existingRecord = await getCustomSong(artist, title);
    }

    // Split artist list if multiple provided in a single string
    const artistList = data.artists && data.artists.length > 0 
        ? data.artists 
        : (data.artist || artist).trim().split(',').map(a => a.trim()).filter(a => a);

    const payload: any = {
        title: (data.title || title).trim(),
        title_nepali: data.title_nepali?.trim() || null,
        artist: (data.artist || artist).trim(),
        artists: artistList,
        lyrics_nepali: data.lyrics_nepali || null,
        lyrics_roman: data.lyrics_roman || null,
        composer: data.composer || null,
        composers: data.composers || [],
        lyricist: data.lyricist || null,
        lyricists: data.lyricists || [],
        singer: data.singer || null,
        singers: data.singers || [],
        views: data.views || 0,
        category: (data.categories && data.categories.length > 0) ? data.categories[0] : (data.category || 'Worship'),
        categories: data.categories || [],
        youtube_url: data.youtubeUrl || null,
        is_youtube_visible: data.isYoutubeVisible ?? true,
        language: data.language || 'nepali',
        note: data.note || null,
        is_note_visible: data.isNoteVisible ?? true
    };
    
    try {
        let result;
        if (existingRecord?.id) {
            result = await supabase.from('songs').update(payload).eq('id', existingRecord.id);
        } else {
            result = await supabase.from('songs').insert([payload]);
        }
        
        if (result.error) {
            if (result.error.message.includes('title_nepali')) {
                throw new Error("Missing columns in Database. Ensure 'title_nepali', 'note', and 'is_note_visible' exist.");
            }
            throw new Error(result.error.message);
        }
        
        window.dispatchEvent(new Event('content-change'));
    } catch (err: any) {
        console.error("Database Save Error:", err);
        throw err;
    }
};

export const deleteCustomSong = async (artist: string, title: string) => {
    const existing = await getCustomSong(artist, title);
    if (existing) {
        const { error } = await supabase.from('songs').delete().eq('id', existing.id);
        if (error) throw new Error(error.message);
        window.dispatchEvent(new Event('content-change'));
    }
};

// --- MIGRATION UTILITY ---
export const bulkMigrateMissingRomanLyrics = async (): Promise<number> => {
    const songs = await getAllCustomSongs();
    const toMigrate = songs.filter(s => s.lyrics_nepali && (!s.lyrics_roman || s.lyrics_roman.trim() === ''));
    
    if (toMigrate.length === 0) return 0;
    
    let count = 0;
    for (const song of toMigrate) {
        try {
            const roman = convertToRoman(song.lyrics_nepali);
            await saveCustomSong(song.artist, song.title, { ...song, lyrics_roman: roman });
            count++;
        } catch (e) {
            console.error(`Migration failed for song: ${song.title}`, e);
        }
    }
    return count;
};

// --- ARTISTS ---
export const getAllCustomArtists = async (): Promise<any[]> => {
    try {
        const { data, error } = await supabase.from('artists').select('*');
        if (error) throw error;
        
        const artists = (data || []).map((a: any) => ({
            ...a,
            imageUrl: a.image_url,
            topSongs: a.top_songs || [],
            facebookUrl: a.facebook_url,
            instagramUrl: a.instagram_url,
            youtubeUrl: a.youtube_url,
            isFacebookVisible: a.is_facebook_visible,
            isInstagramVisible: a.is_instagram_visible,
            isArtistYoutubeVisible: a.is_artist_youtube_visible
        })).sort((a, b) => a.name.localeCompare(b.name));

        setCache(OFFLINE_CACHE_KEYS.ARTISTS, artists);
        return artists;
    } catch (error: any) {
        console.warn("Fetch artists failed, using offline cache:", error.message);
        const cached = getCached(OFFLINE_CACHE_KEYS.ARTISTS) || [];
        return cached.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
};

export const parseArtistIdentifier = (identifier: string): { name: string; id: string | null } => {
    const idMatch = identifier.match(/\(ID:(.+)\)$/);
    if (idMatch) {
        return {
            name: identifier.replace(/\(ID:.+\)$/, '').trim(),
            id: idMatch[1]
        };
    }
    return { name: identifier.trim(), id: null };
};

export const getCustomArtist = async (nameOrIdentifier: string): Promise<any | null> => {
    const { name, id } = parseArtistIdentifier(nameOrIdentifier);
    
    if (id) {
        const { data, error } = await supabase.from('artists').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
            return {
                ...data,
                imageUrl: data.image_url,
                topSongs: data.top_songs || [],
                facebookUrl: data.facebook_url,
                instagramUrl: data.instagram_url,
                youtubeUrl: data.youtube_url,
                isFacebookVisible: data.is_facebook_visible,
                isInstagramVisible: data.is_instagram_visible,
                isArtistYoutubeVisible: data.is_artist_youtube_visible
            };
        }
    }

    const { data, error } = await supabase.from('artists').select('*').ilike('name', name.trim()).maybeSingle();
    if (error || !data) return null;
    return {
        ...data,
        imageUrl: data.image_url,
        topSongs: data.top_songs || [],
        facebookUrl: data.facebook_url,
        instagramUrl: data.instagram_url,
        youtubeUrl: data.youtube_url,
        isFacebookVisible: data.is_facebook_visible,
        isInstagramVisible: data.is_instagram_visible,
        isArtistYoutubeVisible: data.is_artist_youtube_visible
    };
};

export const getCustomArtistById = async (id: string | number): Promise<any | null> => {
    const { data, error } = await supabase.from('artists').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return {
        ...data,
        imageUrl: data.image_url,
        topSongs: data.top_songs || [],
        facebookUrl: data.facebook_url,
        instagramUrl: data.instagram_url,
        youtubeUrl: data.youtube_url,
        isFacebookVisible: data.is_facebook_visible,
        isInstagramVisible: data.is_instagram_visible,
        isArtistYoutubeVisible: data.is_artist_youtube_visible
    };
};

export const saveCustomArtist = async (name: string, data: ArtistDetails) => {
    const payload: any = {
        name: name.trim(),
        bio: data.bio || '',
        top_songs: data.topSongs || [],
        image_url: data.imageUrl || '',
        facebook_url: data.facebookUrl || '',
        instagram_url: data.instagramUrl || '',
        youtube_url: data.youtubeUrl || '',
        is_facebook_visible: data.isFacebookVisible ?? true,
        is_instagram_visible: data.isInstagramVisible ?? true,
        is_artist_youtube_visible: data.isArtistYoutubeVisible ?? true
    };
    
    let result;
    if (data.id) {
        result = await supabase.from('artists').update(payload).eq('id', data.id);
    } else {
        result = await supabase.from('artists').insert([payload]);
    }
    
    if (result.error) throw new Error(result.error.message);
    window.dispatchEvent(new Event('content-change'));
};

export const deleteCustomArtist = async (name: string) => {
    const existing = await getCustomArtist(name);
    if (existing) {
        const { error } = await supabase.from('artists').delete().eq('id', existing.id);
        if (error) throw new Error(error.message);
        window.dispatchEvent(new Event('content-change'));
    }
};

// --- CATEGORIES ---
export const getCategories = async (): Promise<Category[]> => {
    try {
        const { data, error } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
        if (error) throw error;
        
        const categories = (data || []).map((c: any) => ({
            name: c.name,
            imageUrl: c.image_url,
            hideTitle: c.hide_title,
            orderIndex: c.order_index || 0
        }));

        setCache(OFFLINE_CACHE_KEYS.CATEGORIES, categories);
        return categories;
    } catch (error: any) {
        console.warn("Fetch categories failed, using offline cache:", error.message);
        return getCached(OFFLINE_CACHE_KEYS.CATEGORIES) || [];
    }
};

export const addCategory = async (name: string, imageUrl: string = '', hideTitle: boolean = false) => {
    const current = await getCategories();
    const nextOrder = current.length;
    
    const { error } = await supabase.from('categories').insert([{ 
        name: name.trim(), 
        image_url: imageUrl, 
        hide_title: hideTitle,
        order_index: nextOrder
    }]);
    
    if (error) return { success: false, error: error.message };
    window.dispatchEvent(new Event('content-change'));
    return { success: true };
};

export const updateCategory = async (oldName: string, newName: string, imageUrl: string = '', hideTitle: boolean = false, orderIndex?: number) => {
    const payload: any = { name: newName.trim(), image_url: imageUrl, hide_title: hideTitle };
    if (orderIndex !== undefined) payload.order_index = orderIndex;

    const { error } = await supabase.from('categories').update(payload).eq('name', oldName);
    if (error) throw new Error(error.message);
    window.dispatchEvent(new Event('content-change'));
};

export const reorderCategories = async (categoryList: Category[]) => {
    const payload = categoryList.map((cat, idx) => ({
        name: cat.name,
        order_index: idx
    }));
    const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'name' });
    if (error) throw new Error(error.message);
    window.dispatchEvent(new Event('content-change'));
};

export const deleteCategory = async (name: string) => {
    const { error } = await supabase.from('categories').delete().eq('name', name);
    if (error) throw new Error(error.message);
    window.dispatchEvent(new Event('content-change'));
};

// --- BANNERS ---
export const getBanners = async (): Promise<Banner[]> => {
    try {
        const { data, error } = await supabase.from('banners').select('*').order('id', { ascending: true });
        if (error) throw error;
        
        const banners = (data || []).map((b: any) => ({
            id: b.id.toString(),
            imageUrl: b.image_url,
            title: b.title,
            subtitle: b.subtitle,
            link: b.link
        }));

        setCache(OFFLINE_CACHE_KEYS.BANNERS, banners);
        return banners;
    } catch (error: any) {
        console.warn("Fetch banners failed, using offline cache:", error.message);
        return getCached(OFFLINE_CACHE_KEYS.BANNERS) || [];
    }
};

export const saveBanner = async (banner: Banner) => {
    const isNew = banner.id.startsWith('temp_');
    const payload: any = {
        image_url: banner.imageUrl,
        title: banner.title || null,
        subtitle: banner.subtitle || null,
        link: banner.link || null
    };

    if (isNew) {
        const { error } = await supabase.from('banners').insert([payload]);
        if (error) throw new Error(`Insert failed: ${error.message}`);
    } else {
        const numericId = parseInt(banner.id);
        const finalId = isNaN(numericId) ? banner.id : numericId;
        const { error } = await supabase.from('banners').update(payload).eq('id', finalId);
        if (error) throw new Error(`Update failed: ${error.message}`);
    }
    
    window.dispatchEvent(new Event('content-change'));
};

export const deleteBanner = async (id: string) => {
    const numericId = parseInt(id);
    const finalId = isNaN(numericId) ? id : numericId;
    const { error } = await supabase.from('banners').delete().eq('id', finalId);
    if (error) throw new Error(error.message);
    window.dispatchEvent(new Event('content-change'));
};

// --- SITE SETTINGS ---
export const getSiteLogo = async (): Promise<string> => {
    try {
        const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'site_logo').maybeSingle();
        if (error) throw error;
        const logo = data?.value || '';
        setCache('sp_site_logo', logo);
        return logo;
    } catch (error: any) {
        console.warn("Fetch site logo failed, using offline cache:", error.message);
        return localStorage.getItem('sp_site_logo') || '';
    }
};

export const saveSiteLogo = async (url: string) => {
    const { data: existing } = await supabase.from('site_settings').select('key').eq('key', 'site_logo').maybeSingle();
    let res;
    if (existing) {
        res = await supabase.from('site_settings').update({ value: url }).eq('key', 'site_logo');
    } else {
        res = await supabase.from('site_settings').insert([{ key: 'site_logo', value: url }]);
    }
    if (res.error) throw new Error(res.error.message);
    window.dispatchEvent(new Event('logo-change'));
};

export const getAnnouncement = async (): Promise<Announcement | null> => {
    try {
        const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'announcement').maybeSingle();
        if (error) throw error;
        const announcement = safeJsonParse(data?.value, null);
        setCache('sp_announcement', announcement);
        return announcement;
    } catch (error: any) {
        console.warn("Fetch announcement failed, using offline cache:", error.message);
        return getCached('sp_announcement');
    }
};

export const saveAnnouncement = async (ann: Announcement) => {
    const value = JSON.stringify(ann);
    const { data: existing } = await supabase.from('site_settings').select('key').eq('key', 'announcement').maybeSingle();
    let res;
    if (existing) {
        res = await supabase.from('site_settings').update({ value }).eq('key', 'announcement');
    } else {
        res = await supabase.from('site_settings').insert([{ key: 'announcement', value }]);
    }
    if (res.error) throw new Error(res.error.message);
    window.dispatchEvent(new Event('content-change'));
};

export const getContactInfo = async (): Promise<ContactInfo | null> => {
    try {
        const { data, error = null } = await supabase.from('site_settings').select('value').eq('key', 'contact_info').maybeSingle();
        if (error) throw error;
        const info = safeJsonParse(data?.value, null);
        setCache('sp_contact_info', info);
        return info;
    } catch (error: any) {
        console.warn("Fetch contact info failed, using offline cache:", error.message);
        return getCached('sp_contact_info');
    }
};

export const saveContactInfo = async (info: ContactInfo) => {
    const value = JSON.stringify(info);
    const { data: existing } = await supabase.from('site_settings').select('key').eq('key', 'contact_info').maybeSingle();
    let res;
    if (existing) {
        res = await supabase.from('site_settings').update({ value }).eq('key', 'contact_info');
    } else {
        res = await supabase.from('site_settings').insert([{ key: 'contact_info', value }]);
    }
    if (res.error) throw new Error(res.error.message);
};

// --- ANALYTICS ---
export const recordVisit = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from('analytics').select('*').eq('date', today).maybeSingle();
    if (existing) {
        await supabase.from('analytics').update({ count: existing.count + 1 }).eq('date', today);
    } else {
        await supabase.from('analytics').insert([{ date: today, count: 1 }]);
    }
};

export const getAnalytics = async (): Promise<AnalyticsData> => {
    try {
        const { data: rawData, error } = await supabase.from('analytics').select('*').order('date', { ascending: false });
        if (error) throw error;
        
        const stats = rawData || [];
        const lifetime = stats.reduce((acc, curr) => acc + curr.count, 0);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = stats.find(s => s.date === todayStr)?.count || 0;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeek = stats.filter(s => new Date(s.date) >= oneWeekAgo).reduce((acc, curr) => acc + curr.count, 0);

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const lastWeek = stats.filter(s => {
            const d = new Date(s.date);
            return d >= twoWeeksAgo && d < oneWeekAgo;
        }).reduce((acc, curr) => acc + curr.count, 0);

        return { lifetime, today: todayCount, thisWeek, lastWeek };
    } catch (e) {
        console.error("Analytics fetch failed:", e);
        return { lifetime: 0, today: 0, thisWeek: 0, lastWeek: 0 };
    }
};

export const incrementViewCount = async (artist: string, title: string) => {
    const song = await getCustomSong(artist, title);
    if (song) {
        await supabase.from('songs').update({ views: (song.views || 0) + 1 }).eq('id', song.id);
    }
};

export const setViewCount = async (artist: string, title: string, count: number) => {
    const song = await getCustomSong(artist, title);
    if (song) {
        await supabase.from('songs').update({ views: count }).eq('id', song.id);
    }
};

// --- REPORTS / FEEDBACK ---
export const submitReport = async (report: Partial<Report>) => {
    const payload = {
        type: report.type || 'Other',
        text: report.text || '',
        song_id: report.song_id || null,
        song_title: report.song_title || null,
        artist: report.artist || null,
        status: 'new',
        created_at: new Date().toISOString()
    };
    
    const { error } = await supabase.from('reports').insert([payload]);
    if (error) throw new Error(error.message);
    
    window.dispatchEvent(new Event('new-report'));
};

export const getReports = async (): Promise<Report[]> => {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error("Fetch reports error:", error.message);
        return [];
    }
    return data || [];
};

export const deleteReport = async (id: string | number) => {
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw new Error(error.message);
    window.dispatchEvent(new Event('new-report'));
};

// --- BACKUP ---
export const exportAllData = async (): Promise<BackupData> => {
    const [songs, artists, banners, categories, announcement, contactInfo, siteLogo] = await Promise.all([
        getAllCustomSongs(),
        getAllCustomArtists(),
        getBanners(),
        getCategories(),
        getAnnouncement(),
        getContactInfo(),
        getSiteLogo()
    ]);
    return { songs, artists, banners, categories, announcement, contactInfo, siteLogo };
};

export const importAllData = async (data: BackupData): Promise<{ success: boolean; message: string }> => {
    try {
        if (data.songs) {
            for (const song of data.songs) {
                await saveCustomSong(song.artist, song.title, song);
            }
        }
        if (data.artists) {
            for (const artist of data.artists) {
                await saveCustomArtist(artist.name, artist);
            }
        }
        if (data.banners) {
            await supabase.from('banners').delete().not('id', 'is', null);
            for (const banner of data.banners) {
                await saveBanner(banner);
            }
        }
        if (data.categories) {
            for (const cat of data.categories) {
                const { data: existing } = await supabase.from('categories').select('name').eq('name', cat.name).maybeSingle();
                if (existing) {
                    await updateCategory(cat.name, cat.name, cat.imageUrl, cat.hideTitle, cat.orderIndex);
                } else {
                    await addCategory(cat.name, cat.imageUrl, cat.hideTitle);
                }
            }
        }
        if (data.announcement) await saveAnnouncement(data.announcement);
        if (data.contactInfo) await saveContactInfo(data.contactInfo);
        if (data.siteLogo) await saveSiteLogo(data.siteLogo);

        window.dispatchEvent(new Event('content-change'));
        return { success: true, message: "Data imported successfully!" };
    } catch (error: any) {
        console.error("Import failed:", error);
        return { success: false, message: "Import failed: " + error.message };
    }
};