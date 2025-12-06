
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, logout } from '../utils/auth';
import { getAllCustomSongs, saveCustomSong, saveCustomArtist, getAllCustomArtists, deleteCustomSong, deleteCustomArtist, getCustomArtist, getBanners, saveBanner, deleteBanner } from '../utils/dataManager';
import { LogOut, Plus, Music, User, Trash2, Edit2, ChevronRight, Eye, Image as ImageIcon, Grid, ImageIcon as BannerIcon } from 'lucide-react';
import { Banner } from '../types';

const CATEGORIES = ['Worship', 'Praise', 'Hymn', 'Pop', 'Rock', 'Folk', 'Gospel', 'Contemporary', 'Kids', 'Christmas', 'Other'];

const AdminDashboard: React.FC = () => {
  const isAuth = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'songs' | 'artists' | 'banners' | 'addSong' | 'addArtist' | 'addBanner'>('songs');
  const [customSongs, setCustomSongs] = useState(getAllCustomSongs());
  const [customArtists, setCustomArtists] = useState(getAllCustomArtists());
  const [banners, setBanners] = useState<Banner[]>([]);

  // Form States for Adding
  const [songForm, setSongForm] = useState({ title: '', artist: '', lyrics_nepali: '', lyrics_roman: '', composer: '', lyricist: '', views: 0, artist_bio: '', category: 'Worship' });
  const [artistForm, setArtistForm] = useState({ name: '', bio: '', topSongs: '', imageUrl: '' });
  const [bannerForm, setBannerForm] = useState({ imageUrl: '', title: '', subtitle: '' });

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    } else {
        refreshData();
    }
  }, [isAuth, navigate]);

  const refreshData = () => {
    setCustomSongs(getAllCustomSongs());
    setCustomArtists(getAllCustomArtists());
    setBanners(getBanners());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songForm.title || !songForm.artist) return;
    
    // 1. Save Song
    saveCustomSong(songForm.artist, songForm.title, {
        lyrics_nepali: songForm.lyrics_nepali,
        lyrics_roman: songForm.lyrics_roman,
        composer: songForm.composer || 'Unknown',
        lyricist: songForm.lyricist || 'Unknown',
        views: songForm.views,
        category: songForm.category
    });

    // 2. Save/Update Artist Bio if provided
    if (songForm.artist_bio) {
        const existingArtist = getCustomArtist(songForm.artist);
        saveCustomArtist(songForm.artist, {
            name: songForm.artist,
            bio: songForm.artist_bio,
            topSongs: existingArtist?.topSongs || [], // Preserve existing songs if any
            imageUrl: existingArtist?.imageUrl // Preserve image if any
        });
    }

    setSongForm({ title: '', artist: '', lyrics_nepali: '', lyrics_roman: '', composer: '', lyricist: '', views: 0, artist_bio: '', category: 'Worship' });
    setActiveTab('songs');
    refreshData();
  };

  const handleAddArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistForm.name) return;
    saveCustomArtist(artistForm.name, {
        name: artistForm.name,
        bio: artistForm.bio,
        topSongs: artistForm.topSongs.split(',').map(s => s.trim()).filter(s => s),
        imageUrl: artistForm.imageUrl
    });
    setArtistForm({ name: '', bio: '', topSongs: '', imageUrl: '' });
    setActiveTab('artists');
    refreshData();
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    saveBanner({
        id,
        imageUrl: bannerForm.imageUrl || `https://picsum.photos/seed/${id}/1200/400`,
        title: bannerForm.title || 'Verse Content',
        subtitle: bannerForm.subtitle || 'Reference'
    });
    setBannerForm({ imageUrl: '', title: '', subtitle: '' });
    setActiveTab('banners');
    refreshData();
  };

  const handleDeleteSong = (artist: string, title: string) => {
    if (window.confirm('Delete this custom song?')) {
        deleteCustomSong(artist, title);
        refreshData();
    }
  };

  const handleDeleteArtist = (name: string) => {
    if (window.confirm('Delete this custom artist?')) {
        deleteCustomArtist(name);
        refreshData();
    }
  };

  const handleDeleteBanner = (id: string) => {
    if (window.confirm('Delete this banner?')) {
        deleteBanner(id);
        refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-slate-400">Manage custom content</p>
            </div>
            <button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300">
                <LogOut className="w-5 h-5 mr-2" /> Logout
            </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Content</p>
                <button 
                    onClick={() => setActiveTab('songs')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'songs' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <span className="flex items-center"><Music className="w-4 h-4 mr-2" /> Custom Songs</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200">{customSongs.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('artists')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'artists' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                     <span className="flex items-center"><User className="w-4 h-4 mr-2" /> Custom Artists</span>
                     <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200">{customArtists.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('banners')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'banners' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                     <span className="flex items-center"><BannerIcon className="w-4 h-4 mr-2" /> Banners</span>
                     <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200">{banners.length}</span>
                </button>
                
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-6">Actions</p>
                <button 
                    onClick={() => setActiveTab('addSong')}
                    className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'addSong' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Song
                </button>
                 <button 
                    onClick={() => setActiveTab('addArtist')}
                    className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'addArtist' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Artist
                </button>
                <button 
                    onClick={() => setActiveTab('addBanner')}
                    className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'addBanner' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Banner
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[800px]">
                
                {/* LIST SONGS */}
                {activeTab === 'songs' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Custom Songs</h2>
                        {customSongs.length === 0 ? <p className="text-slate-500 italic">No custom songs added yet.</p> : (
                            <div className="grid gap-3">
                                {customSongs.map(song => (
                                    <div key={song.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary/30 bg-white">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{song.title}</h3>
                                            <p className="text-sm text-slate-500">{song.artist}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Link to={`/lyrics/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`} className="p-2 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></Link>
                                            <button onClick={() => handleDeleteSong(song.artist, song.title)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* LIST ARTISTS */}
                {activeTab === 'artists' && (
                     <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Custom Artists</h2>
                         {customArtists.length === 0 ? <p className="text-slate-500 italic">No custom artists added yet.</p> : (
                            <div className="grid gap-3">
                                {customArtists.map(artist => (
                                    <div key={artist.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary/30 bg-white">
                                        <div className="flex items-center">
                                            {artist.imageUrl && <img src={artist.imageUrl} alt={artist.name} className="w-10 h-10 rounded-full mr-3 object-cover border border-slate-200" />}
                                            <div>
                                                <h3 className="font-bold text-slate-800">{artist.name}</h3>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Link to={`/artist/${encodeURIComponent(artist.name)}`} className="p-2 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></Link>
                                            <button onClick={() => handleDeleteArtist(artist.name)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* LIST BANNERS */}
                {activeTab === 'banners' && (
                     <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Slideshow Banners</h2>
                         {banners.length === 0 ? <p className="text-slate-500 italic">No custom banners. Showing defaults.</p> : (
                            <div className="grid gap-4">
                                {banners.map((banner, idx) => (
                                    <div key={banner.id} className="group relative rounded-lg overflow-hidden border border-slate-200">
                                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                                            <h3 className="text-white font-bold truncate">{banner.title}</h3>
                                            <p className="text-white/80 text-sm">{banner.subtitle}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 bg-red-500/80 text-white rounded hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ADD SONG FORM */}
                {activeTab === 'addSong' && (
                    <div className="max-w-xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Song</h2>
                        <form onSubmit={handleAddSong} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Title *</label>
                                    <input required type="text" className="w-full border p-2 rounded" value={songForm.title} onChange={e => setSongForm({...songForm, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Artist *</label>
                                    <input required type="text" className="w-full border p-2 rounded" value={songForm.artist} onChange={e => setSongForm({...songForm, artist: e.target.value})} />
                                </div>
                            </div>
                            
                            {/* Category Selector */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center"><Grid className="w-4 h-4 mr-1"/> Category</label>
                                <select 
                                    className="w-full border p-2 rounded bg-white"
                                    value={songForm.category}
                                    onChange={e => setSongForm({...songForm, category: e.target.value})}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Artist Bio (Optional)</label>
                                <textarea rows={3} placeholder="Enter bio to create/update artist profile..." className="w-full border p-2 rounded" value={songForm.artist_bio} onChange={e => setSongForm({...songForm, artist_bio: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Lyrics (Nepali)</label>
                                <textarea rows={6} className="w-full border p-2 rounded" value={songForm.lyrics_nepali} onChange={e => setSongForm({...songForm, lyrics_nepali: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Lyrics (Romanized)</label>
                                <textarea rows={6} className="w-full border p-2 rounded" value={songForm.lyrics_roman} onChange={e => setSongForm({...songForm, lyrics_roman: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Composer</label>
                                    <input type="text" className="w-full border p-2 rounded" value={songForm.composer} onChange={e => setSongForm({...songForm, composer: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Lyricist</label>
                                    <input type="text" className="w-full border p-2 rounded" value={songForm.lyricist} onChange={e => setSongForm({...songForm, lyricist: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center"><Eye className="w-4 h-4 mr-1"/> Initial Views</label>
                                <input type="number" className="w-full border p-2 rounded" value={songForm.views} onChange={e => setSongForm({...songForm, views: parseInt(e.target.value) || 0})} />
                            </div>
                            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Save Song & Artist Info</button>
                        </form>
                    </div>
                )}

                {/* ADD ARTIST FORM */}
                {activeTab === 'addArtist' && (
                    <div className="max-w-xl">
                         <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Artist</h2>
                        <form onSubmit={handleAddArtist} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Name *</label>
                                <input required type="text" className="w-full border p-2 rounded" value={artistForm.name} onChange={e => setArtistForm({...artistForm, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Profile Image URL</label>
                                <div className="flex gap-2">
                                     <input 
                                        type="text" 
                                        className="w-full border p-2 rounded" 
                                        value={artistForm.imageUrl} 
                                        onChange={e => setArtistForm({...artistForm, imageUrl: e.target.value})} 
                                        placeholder="https://example.com/artist.jpg"
                                     />
                                     <ImageIcon className="w-10 h-10 text-slate-300 border rounded p-1" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                                <textarea rows={4} className="w-full border p-2 rounded" value={artistForm.bio} onChange={e => setArtistForm({...artistForm, bio: e.target.value})} />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Top Songs (comma separated)</label>
                                <input type="text" className="w-full border p-2 rounded" value={artistForm.topSongs} onChange={e => setArtistForm({...artistForm, topSongs: e.target.value})} placeholder="Song 1, Song 2, Song 3" />
                            </div>
                            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Save Artist</button>
                        </form>
                    </div>
                )}

                {/* ADD BANNER FORM */}
                {activeTab === 'addBanner' && (
                    <div className="max-w-xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Banner</h2>
                        <form onSubmit={handleAddBanner} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Banner Image URL</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded" 
                                    value={bannerForm.imageUrl} 
                                    onChange={e => setBannerForm({...bannerForm, imageUrl: e.target.value})}
                                    placeholder="Leave empty for random generation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Verse / Title</label>
                                <textarea rows={3} className="w-full border p-2 rounded" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} placeholder="Enter verse text..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Reference / Subtitle</label>
                                <input type="text" className="w-full border p-2 rounded" value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} placeholder="e.g. John 3:16" />
                            </div>
                            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Add Banner</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
