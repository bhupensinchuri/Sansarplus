import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, logout } from '../utils/auth';
import { 
  getAllCustomSongs, 
  saveCustomSong, 
  saveCustomArtist, 
  getAllCustomArtists, 
  deleteCustomSong, 
  deleteCustomArtist, 
  getCustomArtist, 
  getBanners, 
  saveBanner, 
  deleteBanner, 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories,
  exportAllData, 
  importAllData, 
  getSiteLogo, 
  saveSiteLogo, 
  getAnnouncement, 
  saveAnnouncement, 
  getContactInfo, 
  saveContactInfo, 
  getAnalytics, 
  AnalyticsData,
  getReports,
  deleteReport,
  bulkMigrateMissingRomanLyrics,
  parseArtistIdentifier
} from '../utils/dataManager';
import { 
  LogOut, Plus, Music, User, Trash2, Edit2, Grid, ImageIcon as BannerIcon, 
  Check, X, Database, Settings, Megaphone, Info, Activity, Calendar, Clock, 
  Save, ExternalLink, Search, Youtube, Globe, Mail, MessageCircle,
  Download, Shield, Upload, Camera, Image as ImageIconRegular,
  Facebook, Instagram, ChevronUp, ChevronDown, GripVertical, StickyNote,
  MailWarning, Bell, Sparkles, RefreshCw, Wrench, ChevronRight, Wand2, AlertCircle
} from 'lucide-react';
import { Banner, Announcement, Category, ContactInfo, Report } from '../types';
import Loader from '../components/Loader';
import ArtistSelector from '../components/ArtistSelector';
import { supabase } from '../supabaseClient';
import { convertToRoman } from '../utils/nepaliConverter';
import { transliterateNepaliToRoman } from '../services/geminiService';

const AdminDashboard: React.FC = () => {
  const { user, isAuth, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isRegularUser = userRole === 'USER';

  const [activeTab, setActiveTab] = useState<'overview' | 'songs' | 'artists' | 'banners' | 'categories' | 'contact' | 'backup' | 'settings' | 'addSong' | 'addArtist' | 'announcement' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [customSongs, setCustomSongs] = useState<any[]>([]);
  const [customArtists, setCustomArtists] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement>({ imageUrl: '', link: '', isVisible: false });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
      missionTitle: '', missionText: '', visionTitle: '', visionText: '',
      email: '', whatsapp: '', facebookUrl: '', footerTitle: '', footerText: ''
  });
  
  const [analytics, setAnalytics] = useState<AnalyticsData>({ lifetime: 0, today: 0, thisWeek: 0, lastWeek: 0 });
  const [onlineCount, setOnlineCount] = useState(0);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Refs for file uploads
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const announcementFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const backupFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);
  const editCategoryFileRef = useRef<HTMLInputElement>(null);
  const artistFileRef = useRef<HTMLInputElement>(null);

  // Search/Filter states
  const [songSearch, setSongSearch] = useState('');
  const [artistSearch, setArtistSearch] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Form States
  const [songForm, setSongForm] = useState({ 
      title: '', title_nepali: '', artist: '', artists: [] as string[], 
      lyrics_nepali: '', lyrics_roman: '', 
      composer: '', composers: [] as string[], 
      lyricist: '', lyricists: [] as string[], 
      singer: '', singers: [] as string[], 
      views: 0, artist_bio: '', categories: [] as string[],
      youtubeUrl: '', isYoutubeVisible: true,
      language: 'nepali' as 'nepali' | 'hindi' | 'english',
      note: '', isNoteVisible: true
  });

  const handleImportSong = async () => {
      if (!importUrl) return;
      setIsImporting(true);
      try {
          // Note: This will likely fail due to CORS if the website doesn't allow it.
          // In a real production app, this would be handled by a server-side proxy.
          const response = await fetch(importUrl);
          const text = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          
          // This is a placeholder for the parsing logic.
          // I need to know the structure of the song page to implement this correctly.
          alert("Importing from " + importUrl + " - Parsing logic needs to be implemented based on website structure.");
      } catch (e: any) {
          alert("Import failed: " + e.message);
      } finally {
          setIsImporting(false);
      }
  };
  const [artistForm, setArtistForm] = useState({ 
      name: '', bio: '', topSongs: '', imageUrl: '', 
      facebookUrl: '', instagramUrl: '', youtubeUrl: '',
      isFacebookVisible: true, isInstagramVisible: true, isArtistYoutubeVisible: true
  });
  const [bannerForm, setBannerForm] = useState({ imageUrl: '', title: '', subtitle: '', link: '' });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', imageUrl: '', hideTitle: false });
  const [siteLogo, setSiteLogo] = useState('');
  const [editingCategory, setEditingCategory] = useState<{original: string, current: string, imageUrl: string, hideTitle: boolean} | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuth) {
        navigate('/login');
      } else if (isRegularUser) {
        navigate('/');
      } else {
        refreshData();
        setupPresence();
        
        // Listen for report events
        window.addEventListener('new-report', refreshData);
        return () => window.removeEventListener('new-report', refreshData);
      }
    }
  }, [isAuth, isRegularUser, authLoading, navigate]);

  const setupPresence = () => {
    const channel = supabase.channel('online_users');
    channel
        .on('presence', { event: 'sync' }, () => {
            const newState = channel.presenceState();
            setOnlineCount(Object.keys(newState).length);
        })
        .subscribe();
    
    return () => { channel.unsubscribe(); }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const [songs, artists, bans, cats, logo, stats, ann, info, rpts] = await Promise.all([
        getAllCustomSongs(),
        getAllCustomArtists(),
        getBanners(),
        getCategories(),
        getSiteLogo(),
        getAnalytics(),
        getAnnouncement(),
        getContactInfo(),
        getReports()
      ]);

      setCustomSongs(songs);
      setCustomArtists(artists);
      setBanners(bans);
      setCategories(cats);
      setSiteLogo(logo);
      setAnalytics(stats);
      setReports(rpts);
      
      if (ann) setAnnouncement(ann);
      if (info) setContactInfo(prev => ({ ...prev, ...info }));
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRomanize = async () => {
      if (window.confirm("This will scan all songs and automatically generate Romanized lyrics for any song missing them. This process might take a few moments. Continue?")) {
          setIsMigrating(true);
          try {
              const count = await bulkMigrateMissingRomanLyrics();
              alert(`Successfully migrated ${count} songs!`);
              refreshData();
          } catch (e: any) {
              alert("Migration failed: " + e.message);
          } finally {
              setIsMigrating(false);
          }
      }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'banner' | 'announcement' | 'logo' | 'category' | 'edit-category' | 'artist') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        if (target === 'banner') setBannerForm(prev => ({ ...prev, imageUrl: base64 }));
        else if (target === 'announcement') setAnnouncement(prev => ({ ...prev, imageUrl: base64 }));
        else if (target === 'logo') setSiteLogo(base64);
        else if (target === 'category') setCategoryForm(prev => ({ ...prev, imageUrl: base64 }));
        else if (target === 'edit-category') setEditingCategory(prev => prev ? { ...prev, imageUrl: base64 } : null);
        else if (target === 'artist') setArtistForm(prev => ({ ...prev, imageUrl: base64 }));
        
        e.target.value = '';
      } catch (err) {
        alert("File conversion failed.");
      }
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleClean = songForm.title.trim();
    if (!titleClean) return;
    
    const artistList = songForm.artists.length > 0 ? songForm.artists : (songForm.artist ? [songForm.artist] : []);
    
    // Clean names for display and simple fields
    const cleanArtistList = artistList.map(a => parseArtistIdentifier(a).name);
    const displayArtist = cleanArtistList.length > 0 ? cleanArtistList.join(', ') : 'Unknown';
    
    try {
        setLoading(true);
        
        // 1. Filter and Create New Artists automatically
        const allContributors = Array.from(new Set([
            ...artistList,
            ...songForm.composers,
            ...songForm.lyricists,
            ...songForm.singers
        ])).filter(name => name && name.toLowerCase() !== 'unknown');

        for (const identifier of allContributors) {
            const { name, id } = parseArtistIdentifier(identifier);
            
            // If it has an ID, it already exists
            if (id) continue;

            // Otherwise check by name
            const existing = customArtists.find(a => a.name.toLowerCase() === name.toLowerCase());
            if (!existing) {
                console.log(`Creating profile for new artist: ${name}`);
                await saveCustomArtist(name, {
                    name: name,
                    bio: `Artist profile automatically created while adding song: ${titleClean}`,
                    topSongs: [titleClean],
                    imageUrl: '',
                    facebookUrl: '',
                    instagramUrl: '',
                    youtubeUrl: '',
                    isFacebookVisible: false,
                    isInstagramVisible: false,
                    isArtistYoutubeVisible: false
                });
            }
        }

        // 2. Save the song
        await saveCustomSong(displayArtist, titleClean, {
            title_nepali: songForm.title_nepali.trim(),
            lyrics_nepali: songForm.lyrics_nepali,
            lyrics_roman: songForm.lyrics_roman,
            composer: songForm.composers.map(c => parseArtistIdentifier(c).name).join(', '),
            composers: songForm.composers,
            lyricist: songForm.lyricists.map(l => parseArtistIdentifier(l).name).join(', '),
            lyricists: songForm.lyricists,
            singer: songForm.singers.map(s => parseArtistIdentifier(s).name).join(', '),
            singers: songForm.singers,
            views: songForm.views,
            categories: songForm.categories.length > 0 ? songForm.categories : ['Worship'],
            youtubeUrl: songForm.youtubeUrl.trim(),
            isYoutubeVisible: songForm.isYoutubeVisible,
            artists: artistList,
            language: songForm.language,
            artist: displayArtist,
            note: songForm.note.trim(),
            isNoteVisible: songForm.isNoteVisible
        });
        
        setSongForm({ 
            title: '', title_nepali: '', artist: '', artists: [], lyrics_nepali: '', lyrics_roman: '', 
            composer: '', composers: [], lyricist: '', lyricists: [], singer: '', 
            singers: [], views: 0, artist_bio: '', categories: [], youtubeUrl: '', 
            isYoutubeVisible: true, language: 'nepali', note: '', isNoteVisible: true
        });
        
        setActiveTab('songs');
        await refreshData();
        alert("Song and new artist profiles saved successfully!");
    } catch (err: any) {
        alert("Failed to save song: " + (err.message || "Unknown error"));
    } finally {
        setLoading(false);
    }
  };

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameClean = artistForm.name.trim();
    if (!nameClean) return;

    // Check for duplicates
    const existing = customArtists.find(a => a.name.toLowerCase() === nameClean.toLowerCase());
    if (existing) {
        const confirmAdd = window.confirm(`An artist with the name "${nameClean}" already exists. Do you want to create another one with the same name? (They will be distinguished by their unique IDs in selection lists)`);
        if (!confirmAdd) return;
    }

    try {
        await saveCustomArtist(nameClean, {
            name: nameClean,
            bio: artistForm.bio,
            topSongs: artistForm.topSongs.split(',').map(s => s.trim()).filter(s => s),
            imageUrl: artistForm.imageUrl.trim(),
            facebookUrl: artistForm.facebookUrl.trim(),
            instagramUrl: artistForm.instagramUrl.trim(),
            youtubeUrl: artistForm.youtubeUrl.trim(),
            isFacebookVisible: artistForm.isFacebookVisible,
            isInstagramVisible: artistForm.isInstagramVisible,
            isArtistYoutubeVisible: artistForm.isArtistYoutubeVisible
        });
        setArtistForm({ name: '', bio: '', topSongs: '', imageUrl: '', facebookUrl: '', instagramUrl: '', youtubeUrl: '', isFacebookVisible: true, isInstagramVisible: true, isArtistYoutubeVisible: true });
        setActiveTab('artists');
        refreshData();
    } catch (err: any) {
        alert("Failed to create artist: " + (err.message || "Unknown error"));
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.imageUrl) {
        alert("Banner image is required!");
        return;
    }

    try {
        setLoading(true);
        const id = editingBannerId || `temp_${Date.now()}`;
        
        await saveBanner({ 
            id, imageUrl: bannerForm.imageUrl, title: bannerForm.title, 
            subtitle: bannerForm.subtitle, link: bannerForm.link
        });
        
        setBannerForm({ imageUrl: '', title: '', subtitle: '', link: '' });
        setEditingBannerId(null);
        
        await refreshData();
        alert("Banner saved successfully!");
    } catch (err: any) {
        alert("Failed to save banner: " + (err.message || "Error saving banner."));
    } finally {
        setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameClean = categoryForm.name.trim();
    if (!nameClean) return;
    const result = await addCategory(nameClean, categoryForm.imageUrl.trim(), categoryForm.hideTitle);
    if (result.success) {
      setCategoryForm({ name: '', imageUrl: '', hideTitle: false });
      refreshData();
    } else {
      alert("Error adding category: " + result.error);
    }
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && editingCategory.current.trim()) {
      try {
        await updateCategory(editingCategory.original, editingCategory.current.trim(), editingCategory.imageUrl.trim(), editingCategory.hideTitle);
        setEditingCategory(null);
        refreshData();
      } catch (err: any) {
        alert("Update failed: " + err.message);
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    
    // Remove and Insert at new position
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, draggedItem);
    
    setCategories(newCategories);
    setDraggedIndex(null);

    try {
        await reorderCategories(newCategories);
    } catch (err: any) {
        alert("Failed to update order: " + err.message);
        refreshData(); // Revert on failure
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    // Swap items locally
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
    
    setCategories(newCategories);
    try {
        await reorderCategories(newCategories);
    } catch (err: any) {
        alert("Failed to update order: " + err.message);
        refreshData();
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await saveAnnouncement(announcement);
          alert("Announcement updated!");
      } catch (err: any) {
          alert("Update failed: " + err.message);
      }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await saveContactInfo(contactInfo);
          alert("Contact information updated!");
      } catch (err: any) {
          alert("Update failed: " + err.message);
      }
  };

  const handleSaveLogo = async () => {
      try {
          await saveSiteLogo(siteLogo);
          alert("Site logo updated!");
      } catch (err: any) {
          alert("Update failed: " + err.message);
      }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const result = await importAllData(json);
          alert(result.message);
          if (result.success) refreshData();
        } catch (err) {
          alert("Invalid backup file format.");
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  const handleDownloadBackup = async () => {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `sansarplus_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
  };

  const handleDeleteSong = (artist: string, title: string) => { if (window.confirm('Delete song?')) { deleteCustomSong(artist, title).then(refreshData); } };
  const handleDeleteArtist = (name: string) => { if (window.confirm('Delete artist?')) { deleteCustomArtist(name).then(refreshData); } };
  const handleDeleteBanner = (id: string) => { if (window.confirm('Delete banner?')) { deleteBanner(id).then(refreshData).catch(e => alert(e.message)); } };
  const handleDeleteCategory = async (cat: string) => { if (window.confirm(`Delete category "${cat}"?`)) { await deleteCategory(cat); refreshData(); } };
  const handleDeleteReport = async (id: string | number) => { if (window.confirm('Mark this message as resolved and delete it?')) { await deleteReport(id); refreshData(); } };

  if (authLoading) return <Loader fullScreen text="Verifying admin credentials..." />;

  const filteredSongs = customSongs.filter(s => 
      s.title.toLowerCase().includes(songSearch.toLowerCase()) || 
      s.artist.toLowerCase().includes(songSearch.toLowerCase())
  );

  const filteredArtists = customArtists.filter(a => 
      a.name.toLowerCase().includes(artistSearch.toLowerCase())
  );

  // Sync native to romanized if romanized is empty
  const handleLyricsChange = (val: string) => {
      setSongForm(prev => {
          const newState = { ...prev, lyrics_nepali: val };
          // Auto-romanize if romanized field is empty
          if (val.trim() && (!prev.lyrics_roman || prev.lyrics_roman.trim() === "")) {
              newState.lyrics_roman = convertToRoman(val);
          }
          return newState;
      });
  }

  const triggerManualRomanization = () => {
      if (songForm.lyrics_nepali) {
          setSongForm(prev => ({ ...prev, lyrics_roman: convertToRoman(prev.lyrics_nepali) }));
      }
  }

  const handleAiTransliterate = async () => {
      if (!songForm.lyrics_nepali || songForm.lyrics_nepali.trim().length < 5) {
          alert("Please enter some native lyrics first.");
          return;
      }
      
      setIsTranslating(true);
      try {
          const result = await transliterateNepaliToRoman(songForm.lyrics_nepali);
          if (result) {
              setSongForm(prev => ({ ...prev, lyrics_roman: result }));
          } else {
              alert("AI Transliteration returned no result. Using basic converter instead.");
              triggerManualRomanization();
          }
      } catch (error) {
          alert("AI Transliteration failed. Using basic converter.");
          triggerManualRomanization();
      } finally {
          setIsTranslating(false);
      }
  };

    const allAvailableArtists = [
        ...customArtists,
        ...Array.from(new Set([...songForm.artists, ...songForm.composers, ...songForm.lyricists, ...songForm.singers]))
            .map(identifier => {
                const { name, id } = parseArtistIdentifier(identifier);
                if (id) return null; // Already from DB
                if (customArtists.some(a => a.name.toLowerCase() === name.toLowerCase())) return null; // Already in DB
                return { name, id: 'temp-' + name }; // Temporary new artist
            })
            .filter(Boolean) as any[]
    ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold flex items-center">Admin Dashboard {isSuperAdmin && <span className="ml-3 text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold uppercase">Super Admin</span>}</h1>
                <p className="text-slate-400">Manage site content and configuration</p>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/" className="text-slate-400 hover:text-white flex items-center text-sm"><ExternalLink className="w-4 h-4 mr-1"/> View Site</Link>
                <button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300 font-bold transition-colors"><LogOut className="w-5 h-5 mr-2" /> Logout</button>
            </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-1">
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-200'}`}><Activity className="w-4 h-4 mr-2" /> Analytics</button>
                <div className="pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Content</div>
                <button onClick={() => setActiveTab('songs')} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'songs' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}><span className="flex items-center"><Music className="w-4 h-4 mr-2" /> Songs</span><span className="text-xs bg-slate-200 px-1.5 rounded-full">{customSongs.length}</span></button>
                <button onClick={() => setActiveTab('artists')} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'artists' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}><span className="flex items-center"><User className="w-4 h-4 mr-2" /> Artists</span><span className="text-xs bg-slate-200 px-1.5 rounded-full">{customArtists.length}</span></button>
                <button onClick={() => setActiveTab('banners')} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'banners' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}><span className="flex items-center"><BannerIcon className="w-4 h-4 mr-2" /> Banners</span><span className="text-xs bg-slate-200 px-1.5 rounded-full">{banners.length}</span></button>
                <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}><span className="flex items-center"><Grid className="w-4 h-4 mr-2" /> Categories</span><span className="text-xs bg-slate-200 px-1.5 rounded-full">{categories.length}</span></button>
                <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-red-50/50'}`}><span className="flex items-center"><MailWarning className="w-4 h-4 mr-2" /> Messages</span>{reports.length > 0 && <span className="text-xs bg-red-500 text-white px-1.5 rounded-full animate-pulse">{reports.length}</span>}</button>
                
                <div className="pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Site Customization</div>
                <button onClick={() => setActiveTab('announcement')} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'announcement' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}><Megaphone className="w-4 h-4 mr-2" /> Announcement</button>
                <button onClick={() => setActiveTab('contact')} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'contact' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}><Info className="w-4 h-4 mr-2" /> Contact/About</button>
                
                {isSuperAdmin && (
                    <div className="pt-6">
                        <div className="pb-2 text-[10px] font-bold text-yellow-600 uppercase tracking-widest px-3">System</div>
                        <button onClick={() => setActiveTab('backup')} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'backup' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-blue-50/50'}`}><Database className="w-4 h-4 mr-2" /> Data Backup</button>
                        <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}><Settings className="w-4 h-4 mr-2" /> Site Settings</button>
                    </div>
                )}
                
                <div className="pt-8">
                    <button onClick={() => setActiveTab('addSong')} className="w-full flex items-center justify-center p-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:bg-primary/90 transition-all mb-3"><Plus className="w-4 h-4 mr-2" /> Add Song</button>
                    <button onClick={() => setActiveTab('addArtist')} className="w-full flex items-center justify-center p-3 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg hover:bg-secondary/90 transition-all mb-3"><User className="w-4 h-4 mr-2" /> Add Artist</button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[85vh]">
                {loading && (activeTab !== 'overview' && activeTab !== 'reports') ? <Loader text="Processing..." /> : (
                <>
                {/* 1. OVERVIEW / ANALYTICS */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-bold text-slate-800">Site Performance</h2>
                            <button onClick={refreshData} className="text-xs font-bold text-primary hover:underline">Refresh Data</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                                <Activity className="w-12 h-12 opacity-20 absolute -right-2 -top-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-4xl font-black mb-1">{onlineCount}</h3>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Active Sessions</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <Clock className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{analytics.today}</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Visits Today</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <Calendar className="w-6 h-6 text-purple-500 mb-3" />
                                <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{analytics.thisWeek}</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Last 7 Days</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <Database className="w-6 h-6 text-emerald-500 mb-3" />
                                <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{analytics.lifetime.toLocaleString()}</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Visits</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-slate-800 flex items-center"><Music className="w-5 h-5 mr-2 text-primary" /> Recent Songs</h4>
                                        {reports.length > 0 && (
                                            <button onClick={() => setActiveTab('reports')} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-red-200 transition-colors">
                                                <Bell className="w-3 h-3" /> {reports.length} New Messages
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {customSongs.slice(0, 5).map((s, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{s.title}</p>
                                                    <p className="text-xs text-slate-400">{s.artist}</p>
                                                </div>
                                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">{s.views || 0} views</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Maintenance / Bulk Actions */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                            <Wrench className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">Database Maintenance</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cleanup & Migration tools</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button 
                                            onClick={handleBulkRomanize}
                                            disabled={isMigrating}
                                            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    {isMigrating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-slate-800">Fix Missing Roman Lyrics</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Scan & Auto-convert all songs</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between h-fit lg:sticky lg:top-0">
                                <div>
                                    <h4 className="font-bold text-indigo-200 mb-2">Quick Access</h4>
                                    <div className="space-y-3 mt-4">
                                        <button onClick={() => setActiveTab('addSong')} className="w-full flex items-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-bold"><Plus className="w-4 h-4 mr-3" /> Add New Song</button>
                                        <button onClick={() => setActiveTab('banners')} className="w-full flex items-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-bold"><BannerIcon className="w-4 h-4 mr-3" /> Change Banners</button>
                                        <button onClick={() => setActiveTab('announcement')} className="w-full flex items-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-bold"><Megaphone className="w-4 h-4 mr-3" /> Update Message</button>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10 text-center text-[10px] text-indigo-400 font-bold uppercase tracking-widest">SansarPlus Admin v2.4</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* REPORTS / MESSAGES TAB */}
                {activeTab === 'reports' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                <MailWarning className="text-red-500" /> Issue Reports & Feedback
                            </h2>
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                                {reports.length} Active Reports
                            </span>
                        </div>

                        {reports.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <Mail className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-400">No active reports</h3>
                                <p className="text-slate-500 text-sm">Everything is running smoothly!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {reports.map((report) => (
                                    <div key={report.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                                                    report.type.includes('Lyrics') ? 'bg-red-50 text-red-600 border-red-100' : 
                                                    report.type.includes('Credit') ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    report.type.includes('Typo') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                    {report.type}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {new Date(report.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            
                                            <p className="text-slate-800 text-sm md:text-base mb-3 leading-relaxed font-medium">
                                                "{report.text}"
                                            </p>
                                            
                                            {report.song_title && (
                                                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 w-fit group cursor-default">
                                                    <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                        <Music className="w-3 h-3" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-700 truncate">
                                                            {report.song_title}
                                                        </p>
                                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate">
                                                            Artist: {report.artist || 'Unknown'}
                                                        </p>
                                                    </div>
                                                    {report.song_id && (
                                                        <Link to={`/l/${report.song_id}`} className="ml-2 p-1 text-primary hover:bg-primary/10 rounded transition-colors" title="View Song">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                                            <button 
                                                onClick={() => handleDeleteReport(report.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-emerald-100 shadow-sm"
                                            >
                                                <Check className="w-4 h-4" /> Resolve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CATEGORIES MANAGEMENT */}
                {activeTab === 'categories' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-slate-800">Library Categories</h2>
                        <p className="text-xs text-slate-400 -mt-6">Tip: Drag and drop cards by the handle <GripVertical className="inline w-3 h-3"/> to reorder.</p>
                        
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4">Create New Category</h3>
                            <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category Name</label>
                                    <input required className="w-full border p-2 rounded text-sm bg-white" value={categoryForm.name} onChange={e => setCategoryForm(prev => ({...prev, name: e.target.value}))} placeholder="e.g. Bhajan" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cover Image (Optional)</label>
                                    <div className="flex items-center gap-3">
                                        <input className="flex-1 border p-2 rounded text-sm bg-white" value={categoryForm.imageUrl} onChange={e => setCategoryForm(prev => ({...prev, imageUrl: e.target.value}))} placeholder="URL or Browse File" />
                                        <button type="button" onClick={() => categoryFileRef.current?.click()} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"><Upload className="w-4 h-4"/></button>
                                        <input type="file" ref={categoryFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'category')} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                        <input type="checkbox" className="rounded text-primary focus:ring-primary/20" checked={categoryForm.hideTitle} onChange={e => setCategoryForm(prev => ({...prev, hideTitle: e.target.checked}))} /> Hide Title on Cover
                                    </label>
                                </div>
                                <div className="flex justify-end md:col-span-2">
                                    <button type="submit" className="bg-primary text-white px-8 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-primary/90 transition-colors">Add Category</button>
                                </div>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((cat, idx) => (
                                <div 
                                    key={cat.name} 
                                    className={`relative group rounded-2xl overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-md cursor-default ${draggedIndex === idx ? 'opacity-40 scale-95 border-primary border-2' : ''}`}
                                    draggable={!editingCategory}
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(idx)}
                                >
                                    {editingCategory?.original === cat.name ? (
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Category Name</label>
                                                <input className="w-full text-sm border p-2 rounded bg-slate-50 mt-0.5" value={editingCategory.current} onChange={e => setEditingCategory({...editingCategory, current: e.target.value})} placeholder="Name" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Image URL / Upload</label>
                                                <div className="flex gap-2 items-center mt-0.5">
                                                    <input className="flex-1 text-[11px] border p-2 rounded bg-slate-50" value={editingCategory.imageUrl} onChange={e => setEditingCategory({...editingCategory, imageUrl: e.target.value})} placeholder="Image URL" />
                                                    <button type="button" onClick={() => editCategoryFileRef.current?.click()} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 shadow-sm"><Upload className="w-3.5 h-3.5"/></button>
                                                    <input type="file" ref={editCategoryFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'edit-category')} />
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                                                <input type="checkbox" className="rounded" checked={editingCategory.hideTitle} onChange={e => setEditingCategory({...editingCategory, hideTitle: e.target.checked})} /> Hide Title
                                            </label>
                                            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                                                <button onClick={handleUpdateCategory} className="bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-1"><Check className="w-3 h-3"/> Update</button>
                                                <button onClick={() => setEditingCategory(null)} className="bg-slate-400 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-500 transition-colors shadow-sm flex items-center gap-1"><X className="w-3 h-3"/> Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                        {/* Drag Handle Overlay */}
                                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1.5 rounded-lg shadow-sm cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-4 h-4 text-slate-400" />
                                        </div>

                                        <div className="h-32 bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                                            {cat.imageUrl ? <img src={cat.imageUrl} className="w-full h-full object-cover" /> : <Grid className="w-10 h-10 text-slate-300" />}
                                            
                                            {/* Standard Order Controls (Fallback) */}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    disabled={idx === 0} 
                                                    onClick={(e) => { e.stopPropagation(); handleMoveCategory(idx, 'up'); }}
                                                    className={`p-1 rounded bg-white shadow-sm hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed`}
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    disabled={idx === categories.length - 1} 
                                                    onClick={(e) => { e.stopPropagation(); handleMoveCategory(idx, 'down'); }}
                                                    className={`p-1 rounded bg-white shadow-sm hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed`}
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-900">{cat.name}</p>
                                                {cat.hideTitle && <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-1 rounded border border-slate-100">Title Hidden</span>}
                                            </div>
                                            <div className="flex gap-1 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingCategory({original: cat.name, current: cat.name, imageUrl: cat.imageUrl || '', hideTitle: cat.hideTitle || false})} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm border border-slate-200"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDeleteCategory(cat.name)} className="p-2 bg-slate-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-200"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeTab === 'songs' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-800">Manage Songs</h2>
                            <div className="relative w-full sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Search songs..." 
                                    className="w-full border p-2 pl-9 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={songSearch}
                                    onChange={(e) => setSongSearch(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {filteredSongs.length === 0 ? (
                                <p className="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed">No songs found.</p>
                            ) : filteredSongs.map((s, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                                    <div className="flex items-center min-w-0 pr-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Music className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900 truncate">{s.title}</h3>
                                            <p className="text-xs text-slate-400 font-medium">{s.artist}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link to={`/l/${s.id}`} className="p-2 text-slate-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></Link>
                                        <button onClick={() => handleDeleteSong(s.artist, s.title)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'artists' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-800">Manage Artists</h2>
                            <div className="relative w-full sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Search artists..." 
                                    className="w-full border p-2 pl-9 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={artistSearch}
                                    onChange={(e) => setArtistSearch(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredArtists.length === 0 ? (
                                <p className="col-span-full text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed">No artists found.</p>
                            ) : filteredArtists.map((a, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                                    <div className="flex items-center min-w-0">
                                        <div className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50 overflow-hidden mr-4">
                                            {a.imageUrl ? <img src={a.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-6 h-6" /></div>}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900 truncate">{a.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{a.topSongs?.length || 0} Songs credited</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link 
                                            to={`/artist/${encodeURIComponent(customArtists.filter(art => art.name === a.name).length > 1 ? `${a.name} (ID:${a.id})` : a.name)}`} 
                                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                                        ><Edit2 className="w-4 h-4" /></Link>
                                        <button onClick={() => handleDeleteArtist(a.name)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'banners' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Slider Banners</h2>
                            <button onClick={refreshData} className="text-xs font-bold text-primary hover:underline">Refresh List</button>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4">{editingBannerId ? 'Edit Banner' : 'Create New Banner'}</h3>
                            <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Banner Image</label>
                                    <div className="flex items-center gap-3">
                                        <input className="flex-1 border p-2 rounded text-sm bg-white" value={bannerForm.imageUrl} onChange={e => setBannerForm(prev => ({...prev, imageUrl: e.target.value}))} placeholder="Direct link to image..." />
                                        <button type="button" onClick={() => bannerFileRef.current?.click()} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-xs font-bold shadow-sm transition-colors"><Upload className="w-4 h-4"/> Browse File</button>
                                        <input type="file" ref={bannerFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} />
                                    </div>
                                    {bannerForm.imageUrl && (
                                        <div className="mt-3 group relative w-fit">
                                            <div className="h-24 w-48 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-md">
                                                <img src={bannerForm.imageUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <button type="button" onClick={() => setBannerForm(prev => ({...prev, imageUrl: ''}))} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Main Title (Optional)</label>
                                    <input className="w-full border p-2 rounded text-sm bg-white" value={bannerForm.title} onChange={e => setBannerForm(prev => ({...prev, title: e.target.value}))} placeholder="e.g. Verse Text" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Subtitle / Link (Optional)</label>
                                    <input className="w-full border p-2 rounded text-sm bg-white" value={bannerForm.subtitle} onChange={e => setBannerForm(prev => ({...prev, subtitle: e.target.value}))} placeholder="e.g. Verse Reference" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Click Action URL (Optional)</label>
                                    <input className="w-full border p-2 rounded text-sm bg-white" value={bannerForm.link} onChange={e => setBannerForm(prev => ({...prev, link: e.target.value}))} placeholder="https://..." />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? 'Saving...' : (editingBannerId ? 'Update Banner' : 'Add Banner')}</button>
                                    {editingBannerId && <button type="button" onClick={() => { setEditingBannerId(null); setBannerForm({imageUrl:'', title:'', subtitle:'', link:''}); }} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors">Cancel</button>}
                                </div>
                            </form>
                        </div>

                        <div className="space-y-3">
                            {banners.length === 0 ? (
                                <p className="text-center py-10 text-slate-400 italic">No banners configured.</p>
                            ) : banners.map((b) => (
                                <div key={b.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-100 shadow-inner"><img src={b.imageUrl} className="w-full h-full object-cover" /></div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{b.title || 'Untitled Banner'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{b.subtitle || 'No Subtitle'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => { setEditingBannerId(b.id); setBannerForm({imageUrl:b.imageUrl, title:b.title, subtitle:b.subtitle, link:b.link||''}); }} className="p-2 text-slate-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeTab === 'addArtist' && (
                    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-8">
                             <h2 className="text-2xl font-bold text-slate-800">Add New Artist Profile</h2>
                             <button onClick={() => setActiveTab('artists')} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm"><X /></button>
                        </div>
                        <form onSubmit={handleAddArtist} className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Artist Name</label>
                                    <input required className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" value={artistForm.name} onChange={e => setArtistForm(prev => ({...prev, name: e.target.value}))} placeholder="e.g. Adrian Dewan" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Profile Image</label>
                                    <div className="flex items-center gap-3">
                                        <input className="flex-1 border p-3 rounded-xl bg-slate-50 text-sm outline-none" value={artistForm.imageUrl} onChange={e => setArtistForm(prev => ({...prev, imageUrl: e.target.value}))} placeholder="Image URL or Upload..." />
                                        <button type="button" onClick={() => artistFileRef.current?.click()} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 shadow-sm transition-colors"><Upload className="w-5 h-5"/></button>
                                        <input type="file" ref={artistFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'artist')} />
                                    </div>
                                    {artistForm.imageUrl && (
                                        <div className="mt-4 flex justify-center">
                                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 group relative">
                                                <img src={artistForm.imageUrl} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setArtistForm(prev => ({...prev, imageUrl: ''}))} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs">Clear Image</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Biography</label>
                                    <textarea className="w-full h-64 p-3 border rounded-xl bg-slate-50 focus:bg-white outline-none" value={artistForm.bio} onChange={e => setArtistForm(prev => ({...prev, bio: e.target.value}))} placeholder="Artist life story, accomplishments (supports paragraphs)..." />
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">Social Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Facebook className="absolute left-3 top-3.5 w-4 h-4 text-blue-500" />
                                        <input className="w-full border p-2.5 pl-10 rounded-xl text-sm bg-slate-50" value={artistForm.facebookUrl} onChange={e => setArtistForm(prev => ({...prev, facebookUrl: e.target.value}))} placeholder="Facebook URL" />
                                    </div>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-3.5 w-4 h-4 text-pink-500" />
                                        <input className="w-full border p-2.5 pl-10 rounded-xl text-sm bg-slate-50" value={artistForm.instagramUrl} onChange={e => setArtistForm(prev => ({...prev, instagramUrl: e.target.value}))} placeholder="Instagram URL" />
                                    </div>
                                    <div className="relative col-span-full">
                                        <Youtube className="absolute left-3 top-3.5 w-4 h-4 text-red-500" />
                                        <input className="w-full border p-2.5 pl-10 rounded-xl text-sm bg-slate-50" value={artistForm.youtubeUrl} onChange={e => setArtistForm(prev => ({...prev, youtubeUrl: e.target.value}))} placeholder="YouTube Channel URL" />
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" disabled={loading} className="w-full bg-secondary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-secondary/30 hover:bg-secondary/90 transition-all flex items-center justify-center transform active:scale-[0.98] uppercase tracking-wider disabled:opacity-50">{loading ? 'Saving...' : 'Create Artist Profile'}</button>
                        </form>
                    </div>
                )}

                {activeTab === 'announcement' && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm"><Megaphone className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Home Message</h2>
                                <p className="text-sm text-slate-500">Display a banner message on the landing page</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveAnnouncement} className="space-y-6">
                            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                                <div><p className="font-bold text-slate-800">Display Message</p><p className="text-xs text-slate-400">Toggle visibility for all users</p></div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={announcement.isVisible} onChange={e => setAnnouncement(prev => ({...prev, isVisible: e.target.checked}))} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Announcement Banner Image</label>
                                    <div className="flex items-center gap-3 mb-3">
                                        <input className="flex-1 border p-3 rounded-xl shadow-sm text-sm bg-slate-50" value={announcement.imageUrl} onChange={e => setAnnouncement(prev => ({...prev, imageUrl: e.target.value}))} placeholder="https://..." />
                                        <button type="button" onClick={() => announcementFileRef.current?.click()} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 shadow-sm transition-colors"><Upload className="w-5 h-5"/></button>
                                        <input type="file" ref={announcementFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'announcement')} />
                                    </div>
                                    {announcement.imageUrl && (
                                        <div className="group relative">
                                            <div className="h-40 w-full rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-inner">
                                                <img src={announcement.imageUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <button type="button" onClick={() => setAnnouncement(prev => ({...prev, imageUrl: ''}))} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Click Destination Link (Optional)</label>
                                    <input className="w-full border p-3 rounded-xl shadow-sm text-sm bg-slate-50" value={announcement.link} onChange={e => setAnnouncement(prev => ({...prev, link: e.target.value}))} placeholder="https://..." />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center"><Save className="w-5 h-5 mr-2" /> Update Announcement</button>
                        </form>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm"><Info className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">About & Contact Details</h2>
                                <p className="text-sm text-slate-500">Manage global site info for the Contact/About page</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveContact} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center border-b border-slate-50 pb-2 mb-4"><Globe className="w-3.5 h-3.5 mr-2 text-primary" /> Organization Identity</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Mission Section Title</label>
                                            <input className="w-full border p-3 rounded-xl text-sm bg-slate-50 focus:bg-white" value={contactInfo.missionTitle} onChange={e => setContactInfo(prev => ({...prev, missionTitle: e.target.value}))} placeholder="e.g. Our Mission" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Mission Statement</label>
                                            <textarea className="w-full h-24 border p-3 rounded-xl text-sm bg-slate-50 focus:bg-white" value={contactInfo.missionText} onChange={e => setContactInfo(prev => ({...prev, missionText: e.target.value}))} placeholder="Mission text..." />
                                        </div>
                                        <div className="pt-2 border-t border-slate-50">
                                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Vision Section Title</label>
                                            <input className="w-full border p-3 rounded-xl text-sm bg-slate-50 focus:bg-white" value={contactInfo.visionTitle} onChange={e => setContactInfo(prev => ({...prev, visionTitle: e.target.value}))} placeholder="e.g. Our Vision" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Vision Statement</label>
                                            <textarea className="w-full h-24 border p-3 rounded-xl text-sm bg-slate-50 focus:bg-white" value={contactInfo.visionText} onChange={e => setContactInfo(prev => ({...prev, visionText: e.target.value}))} placeholder="Vision text..." />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center border-b border-slate-50 pb-2 mb-2"><Mail className="w-3.5 h-3.5 mr-2 text-primary" /> Contact Channels</h3>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                                <input className="w-full border p-3 pl-10 rounded-xl text-sm bg-slate-50 focus:bg-white" value={contactInfo.email} onChange={e => setContactInfo(prev => ({...prev, email: e.target.value}))} placeholder="Organization Email" />
                                            </div>
                                            <div className="relative">
                                                <MessageCircle className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                                <input className="w-full border p-3 pl-10 rounded-xl text-sm bg-slate-50 focus:bg-white" value={contactInfo.whatsapp} onChange={e => setContactInfo(prev => ({...prev, whatsapp: e.target.value}))} placeholder="WhatsApp Link/Number" />
                                            </div>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                                <input className="w-full border p-3 pl-10 rounded-xl text-sm bg-slate-50 focus:bg-white" value={contactInfo.facebookUrl} onChange={e => setContactInfo(prev => ({...prev, facebookUrl: e.target.value}))} placeholder="Facebook URL" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl text-white space-y-4">
                                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-white/5 pb-2">Footer Branding</h3>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Branding Heading</label>
                                            <input className="w-full border-none bg-white/5 p-3 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary" value={contactInfo.footerTitle} onChange={e => setContactInfo(prev => ({...prev, footerTitle: e.target.value}))} placeholder="e.g. Free for everyone" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Branding Subtext</label>
                                            <textarea className="w-full h-20 border-none bg-white/5 p-3 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary" value={contactInfo.footerText} onChange={e => setContactInfo(prev => ({...prev, footerText: e.target.value}))} placeholder="Footer subtext..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center"><Save className="w-5 h-5 mr-2" /> Save Organization Profile</button>
                        </form>
                    </div>
                )}

                {activeTab === 'backup' && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm"><Database className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Database Backup & Recovery</h2>
                                <p className="text-sm text-slate-500">Export your data to a local file or restore from a backup</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2"><Download className="w-8 h-8" /></div>
                                <h3 className="text-lg font-bold">Export Library</h3>
                                <p className="text-slate-500 text-xs px-2 leading-relaxed">Download a JSON snapshot of all songs, artists, categories, and settings.</p>
                                <button onClick={handleDownloadBackup} className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center"><Download className="w-4 h-4 mr-2" /> Download Backup</button>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2"><Upload className="w-8 h-8" /></div>
                                <h3 className="text-lg font-bold">Restore Data</h3>
                                <p className="text-slate-500 text-xs px-2 leading-relaxed">Upload a previous backup file. <span className="text-red-500 font-bold uppercase">Note:</span> This will overwrite existing data.</p>
                                <button onClick={() => backupFileRef.current?.click()} className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center"><Upload className="w-4 h-4 mr-2" /> Import JSON</button>
                                <input type="file" ref={backupFileRef} className="hidden" accept=".json" onChange={handleImportBackup} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center shadow-sm"><Settings className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">General Settings</h2>
                                <p className="text-sm text-slate-500">Manage site logo and system configuration</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center uppercase text-xs tracking-widest"><Globe className="w-4 h-4 mr-2" /> Branding</h3>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Site Logo (Icon)</label>
                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                            <div className="w-24 h-24 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner group relative">
                                                {siteLogo ? <img src={siteLogo} className="w-full h-full object-cover" /> : <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No Logo</div>}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => logoFileRef.current?.click()}>
                                                    <Camera className="text-white w-6 h-6" />
                                                </div>
                                            </div>
                                            <div className="flex-1 w-full space-y-3">
                                                <div className="flex gap-2">
                                                    <input className="flex-1 border p-3 rounded-xl text-sm bg-white" value={siteLogo} onChange={e => setSiteLogo(e.target.value)} placeholder="Logo URL..." />
                                                    <button type="button" onClick={() => logoFileRef.current?.click()} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 shadow-sm transition-colors"><Upload className="w-5 h-5"/></button>
                                                    <input type="file" ref={logoFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                                </div>
                                                <button onClick={handleSaveLogo} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-md w-full sm:w-auto">Save Changes</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center uppercase text-xs tracking-widest"><Shield className="w-4 h-4 mr-2" /> Security</h3>
                                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner"><Shield className="w-6 h-6" /></div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Encrypted Admin Access</h4>
                                            <p className="text-xs text-slate-500">Only authorized Super Admins can access critical functions.</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">Administration is strictly restricted. All data transmissions between your browser and the database are encrypted. Ensure you keep your backup JSON files secure as they contain the full site content.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'addSong' && (
                    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-8">
                             <h2 className="text-2xl font-bold text-slate-800">Add New Lyrics</h2>
                             <button onClick={() => setActiveTab('songs')} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm"><X /></button>
                        </div>
                        <form onSubmit={handleAddSong} className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">Import from URL</h3>
                                <div className="flex gap-2">
                                    <input className="flex-1 border p-3 rounded-xl bg-slate-50 focus:bg-white outline-none" value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="https://www.nepalichristiansongs.com/..." />
                                    <button type="button" onClick={handleImportSong} disabled={isImporting} className="bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all disabled:opacity-50">{isImporting ? 'Importing...' : 'Import'}</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Song Title (Romanized)</label>
                                    <input required className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" value={songForm.title} onChange={e => setSongForm(prev => ({...prev, title: e.target.value}))} placeholder="e.g. Hosanna" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nepali Title (Native script)</label>
                                    <input className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" value={songForm.title_nepali} onChange={e => setSongForm(prev => ({...prev, title_nepali: e.target.value}))} placeholder="Type song title in Nepali script (e.g. होसन्ना)" />
                                </div>
                                <div className="col-span-2">
                                    <ArtistSelector label="Primary Artist(s) / Band" selected={songForm.artists} onChange={arts => setSongForm(prev => ({...prev, artists: arts}))} suggestions={allAvailableArtists} />
                                    {[...songForm.artists, ...songForm.composers, ...songForm.lyricists, ...songForm.singers].some(identifier => {
                                        const { name, id } = parseArtistIdentifier(identifier);
                                        return !id && !customArtists.find(a => a.name.toLowerCase() === name.toLowerCase());
                                    }) && (
                                        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                            <AlertCircle className="w-3 h-3" />
                                            NEW ARTIST(S) DETECTED - PROFILES WILL BE CREATED AUTOMATICALLY
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Original Language</label>
                                    <select className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20" value={songForm.language} onChange={e => setSongForm(prev => ({...prev, language: e.target.value as any}))}>
                                        <option value="nepali">Nepali</option>
                                        <option value="english">English</option>
                                        <option value="hindi">Hindi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Library Categories</label>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border rounded-xl bg-slate-50 border-slate-200">
                                        {categories.map(cat => (
                                            <button 
                                                key={cat.name}
                                                type="button"
                                                onClick={() => {
                                                    const exists = songForm.categories.includes(cat.name);
                                                    setSongForm(prev => ({...prev, categories: exists ? prev.categories.filter(c => c !== cat.name) : [...prev.categories, cat.name]}));
                                                }}
                                                className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold transition-all shadow-sm ${songForm.categories.includes(cat.name) ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white text-slate-600 border-slate-200'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">Contributors</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ArtistSelector label="Composers" selected={songForm.composers} onChange={v => setSongForm(prev => ({...prev, composers: v}))} suggestions={allAvailableArtists} />
                                    <ArtistSelector label="Lyricists" selected={songForm.lyricists} onChange={v => setSongForm(prev => ({...prev, lyricists: v}))} suggestions={allAvailableArtists} />
                                    <ArtistSelector label="Singers" selected={songForm.singers} onChange={v => setSongForm(prev => ({...prev, singers: v}))} suggestions={allAvailableArtists} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">Media, Video & Notes</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">YouTube Video URL</label>
                                        <div className="relative">
                                            <input 
                                                className="w-full border p-3 pl-10 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                                                value={songForm.youtubeUrl} 
                                                onChange={e => setSongForm(prev => ({...prev, youtubeUrl: e.target.value}))} 
                                                placeholder="https://www.youtube.com/watch?v=..." 
                                            />
                                            <Youtube className="absolute left-3 top-3.5 w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Song Note (Small info next to title)</label>
                                        <div className="relative">
                                            <input 
                                                className="w-full border p-3 pl-10 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                                                value={songForm.note} 
                                                onChange={e => setSongForm(prev => ({...prev, note: e.target.value}))} 
                                                placeholder="e.g. (Capo 1) or (Female Version)" 
                                            />
                                            <StickyNote className="absolute left-3 top-3.5 w-4 h-4 text-amber-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={songForm.isYoutubeVisible} 
                                                    onChange={e => setSongForm(prev => ({...prev, isYoutubeVisible: e.target.checked}))} 
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                            <span className="text-xs font-bold text-slate-700">Display Video</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={songForm.isNoteVisible} 
                                                    onChange={e => setSongForm(prev => ({...prev, isNoteVisible: e.target.checked}))} 
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                            <span className="text-xs font-bold text-slate-700">Display Note</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Song Lyrics</h3>
                                        <span className="text-[9px] text-primary font-bold flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-full border border-primary/10"><RefreshCw className={`w-2.5 h-2.5 ${isTranslating ? 'animate-spin' : 'animate-spin-slow'}`}/> {isTranslating ? 'AI Working...' : 'Auto-Sync Active'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="button" 
                                            onClick={handleAiTransliterate} 
                                            disabled={isTranslating}
                                            className={`text-[9px] font-black ${isTranslating ? 'text-slate-400' : 'text-indigo-600 hover:text-indigo-700'} uppercase flex items-center gap-1 transition-colors`}
                                        >
                                            <Wand2 className={`w-2.5 h-2.5 ${isTranslating ? 'animate-pulse' : ''}`} /> 
                                            AI Transliterate
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={triggerManualRomanization} 
                                            className="text-[9px] font-black text-primary hover:underline uppercase flex items-center gap-1"
                                        >
                                            <Sparkles className="w-2.5 h-2.5"/> Basic Sync
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Native Text (Nepali/Hindi)</label>
                                        <textarea className="w-full h-64 p-4 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none font-sans text-sm leading-relaxed" value={songForm.lyrics_nepali} onChange={e => handleLyricsChange(e.target.value)} placeholder="Type or paste native text here..." />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Romanized Version</label>
                                        <textarea className="w-full h-64 p-4 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none font-sans text-sm leading-relaxed" value={songForm.lyrics_roman} onChange={e => setSongForm(prev => ({...prev, lyrics_roman: e.target.value}))} placeholder="Romanized text will appear automatically..." />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center transform active:scale-[0.98] uppercase tracking-wider"><Save className="w-6 h-6 mr-3" /> Publish to Library</button>
                        </form>
                    </div>
                )}
                </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
