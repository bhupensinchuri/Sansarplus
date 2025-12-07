
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, logout, getCurrentUserRole, getAdmins, createAdmin, deleteAdmin, AdminUser, getUsers, deleteUser } from '../utils/auth';
import { getAllCustomSongs, saveCustomSong, saveCustomArtist, getAllCustomArtists, deleteCustomSong, deleteCustomArtist, getCustomArtist, getBanners, saveBanner, deleteBanner, getCategories, addCategory, updateCategory, deleteCategory, exportAllData, importAllData, BackupData, getSiteLogo, saveSiteLogo } from '../utils/dataManager';
import { LogOut, Plus, Music, User, Trash2, Edit2, ChevronRight, Eye, Image as ImageIcon, Grid, ImageIcon as BannerIcon, Check, X, Shield, Lock, Download, Upload, Database, AlertTriangle, Users, Settings } from 'lucide-react';
import { Banner } from '../types';

const AdminDashboard: React.FC = () => {
  const isAuth = useAuth();
  const navigate = useNavigate();
  const userRole = getCurrentUserRole();
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isRegularUser = userRole === 'USER';

  const [activeTab, setActiveTab] = useState<'songs' | 'artists' | 'banners' | 'categories' | 'admins' | 'users' | 'backup' | 'settings' | 'addSong' | 'addArtist' | 'addBanner'>('songs');
  const [customSongs, setCustomSongs] = useState(getAllCustomSongs());
  const [customArtists, setCustomArtists] = useState(getAllCustomArtists());
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [regularUsers, setRegularUsers] = useState<AdminUser[]>([]);

  // Form States
  const [songForm, setSongForm] = useState({ title: '', artist: '', lyrics_nepali: '', lyrics_roman: '', composer: '', lyricist: '', views: 0, artist_bio: '', categories: [] as string[] });
  const [artistForm, setArtistForm] = useState({ name: '', bio: '', topSongs: '', imageUrl: '' });
  const [bannerForm, setBannerForm] = useState({ imageUrl: '', title: '', subtitle: '', link: '' });
  const [categoryForm, setCategoryForm] = useState('');
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '' });
  const [adminError, setAdminError] = useState('');
  const [siteLogo, setSiteLogo] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<{original: string, current: string} | null>(null);

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    } else if (isRegularUser) {
      // Security Check: Users cannot access admin dashboard
      navigate('/');
    } else {
        refreshData();
    }
  }, [isAuth, isRegularUser, navigate]);

  const refreshData = () => {
    setCustomSongs(getAllCustomSongs());
    setCustomArtists(getAllCustomArtists());
    setBanners(getBanners());
    setCategories(getCategories());
    setSiteLogo(getSiteLogo());
    if (isSuperAdmin) {
        setAdminUsers(getAdmins());
        setRegularUsers(getUsers());
    }
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
        categories: songForm.categories.length > 0 ? songForm.categories : ['Worship']
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

    setSongForm({ title: '', artist: '', lyrics_nepali: '', lyrics_roman: '', composer: '', lyricist: '', views: 0, artist_bio: '', categories: [] });
    setActiveTab('songs');
    refreshData();
  };

  const toggleCategorySelection = (cat: string) => {
      setSongForm(prev => {
          const exists = prev.categories.includes(cat);
          if (exists) {
              return { ...prev, categories: prev.categories.filter(c => c !== cat) };
          } else {
              return { ...prev, categories: [...prev.categories, cat] };
          }
      });
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
        subtitle: bannerForm.subtitle || 'Reference',
        link: bannerForm.link
    });
    setBannerForm({ imageUrl: '', title: '', subtitle: '', link: '' });
    setActiveTab('banners');
    refreshData();
  };
  
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryForm.trim()) {
      addCategory(categoryForm.trim());
      setCategoryForm('');
      refreshData();
    }
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
      e.preventDefault();
      setAdminError('');
      if (!newAdminForm.username || !newAdminForm.password) return;
      
      const success = createAdmin(newAdminForm.username, newAdminForm.password);
      if (success) {
          setNewAdminForm({ username: '', password: '' });
          refreshData();
      } else {
          setAdminError('Username already exists');
      }
  };

  const handleDeleteAdmin = (username: string) => {
      if (window.confirm(`Are you sure you want to remove access for "${username}"?`)) {
          deleteAdmin(username);
          refreshData();
      }
  };

  const handleDeleteUser = (username: string) => {
      if (window.confirm(`Are you sure you want to delete user "${username}"? They will lose their playlist data.`)) {
          deleteUser(username);
          refreshData();
      }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.current.trim()) {
      updateCategory(editingCategory.original, editingCategory.current.trim());
      setEditingCategory(null);
      refreshData();
    }
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
  
  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Delete category "${cat}"?`)) {
        deleteCategory(cat);
        refreshData();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
      e.preventDefault();
      saveSiteLogo(siteLogo);
      alert('Site settings saved successfully!');
  };

  const handleDownloadBackup = () => {
      const data = exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sansarplus_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (window.confirm("WARNING: Importing data will overwrite your current songs, artists, and categories. This cannot be undone. Are you sure?")) {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const json = JSON.parse(e.target?.result as string) as BackupData;
                  if (importAllData(json)) {
                      alert("Backup restored successfully! The page will now reload.");
                      window.location.reload();
                  } else {
                      alert("Failed to restore backup. Invalid file format.");
                  }
              } catch (error) {
                  console.error(error);
                  alert("Error parsing backup file.");
              }
          };
          reader.readAsText(file);
      }
      
      // Reset input
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const getFavoritesCount = (username: string) => {
     try {
         const stored = localStorage.getItem(`lyricvault_favorites_${username}`);
         const favs = stored ? JSON.parse(stored) : [];
         return favs.length;
     } catch {
         return 0;
     }
  };

  if (isRegularUser) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 text-center">
              <div className="max-w-md">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-red-700">Access Denied</h1>
                  <p className="text-red-600 mb-6">You do not have permission to view the Admin Dashboard.</p>
                  <Link to="/" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700">Return Home</Link>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold flex items-center">
                    Admin Dashboard
                    {isSuperAdmin && <span className="ml-3 text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold uppercase tracking-wider">Super Admin</span>}
                </h1>
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
                <button 
                    onClick={() => setActiveTab('categories')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                     <span className="flex items-center"><Grid className="w-4 h-4 mr-2" /> Categories</span>
                     <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200">{categories.length}</span>
                </button>
                
                {isSuperAdmin && (
                    <>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-6 text-yellow-600">Super Admin</p>
                        <button 
                            onClick={() => setActiveTab('admins')}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'admins' ? 'bg-yellow-100 text-yellow-800' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className="flex items-center"><Shield className="w-4 h-4 mr-2" /> Manage Admins</span>
                        </button>
                         <button 
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className="flex items-center"><Users className="w-4 h-4 mr-2" /> Registered Users</span>
                        </button>
                         <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-gray-200 text-gray-800' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className="flex items-center"><Settings className="w-4 h-4 mr-2" /> Site Settings</span>
                        </button>
                         <button 
                            onClick={() => setActiveTab('backup')}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'backup' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className="flex items-center"><Database className="w-4 h-4 mr-2" /> Backup & Restore</span>
                        </button>
                    </>
                )}

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
                                        {banner.link && (
                                            <div className="absolute bottom-2 right-2 bg-white/20 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                                                Link Active
                                            </div>
                                        )}
                                        <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* CATEGORIES MANAGEMENT */}
                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Manage Categories</h2>
                        
                        <form onSubmit={handleAddCategory} className="flex gap-2">
                             <input 
                                type="text" 
                                className="flex-1 border p-2 rounded" 
                                placeholder="New category name"
                                value={categoryForm}
                                onChange={e => setCategoryForm(e.target.value)}
                             />
                             <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center">
                                <Plus className="w-4 h-4 mr-1" /> Add
                             </button>
                        </form>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categories.map(cat => (
                                <div key={cat} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                                    {editingCategory?.original === cat ? (
                                        <div className="flex-1 flex gap-2 mr-2">
                                            <input 
                                                className="flex-1 border rounded px-2 py-1 text-sm"
                                                value={editingCategory.current}
                                                onChange={e => setEditingCategory({...editingCategory, current: e.target.value})}
                                                autoFocus
                                            />
                                            <button onClick={handleUpdateCategory} className="text-green-500"><Check className="w-4 h-4"/></button>
                                            <button onClick={() => setEditingCategory(null)} className="text-slate-400"><X className="w-4 h-4"/></button>
                                        </div>
                                    ) : (
                                        <span className="font-medium text-slate-700">{cat}</span>
                                    )}
                                    
                                    {!editingCategory && (
                                        <div className="flex gap-1">
                                            <button onClick={() => setEditingCategory({original: cat, current: cat})} className="p-1.5 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* MANAGE ADMINS (Super Admin Only) */}
                {activeTab === 'admins' && isSuperAdmin && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Manage Admins</h2>
                        
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                            <h3 className="font-bold text-yellow-800 mb-2 flex items-center"><Plus className="w-4 h-4 mr-2"/> Create New Admin</h3>
                            <form onSubmit={handleCreateAdmin} className="flex flex-col md:flex-row gap-3">
                                <input 
                                    type="text" 
                                    className="border p-2 rounded flex-1"
                                    placeholder="Username"
                                    value={newAdminForm.username}
                                    onChange={e => setNewAdminForm({...newAdminForm, username: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    className="border p-2 rounded flex-1"
                                    placeholder="Password"
                                    value={newAdminForm.password}
                                    onChange={e => setNewAdminForm({...newAdminForm, password: e.target.value})}
                                />
                                <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded font-bold hover:bg-yellow-600">Create</button>
                            </form>
                            {adminError && <p className="text-red-500 text-sm mt-2">{adminError}</p>}
                        </div>

                        <div className="space-y-3">
                             <h3 className="font-bold text-slate-600 uppercase text-xs">Existing Users</h3>
                             {adminUsers.map(admin => (
                                 <div key={admin.username} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                                     <div className="flex items-center">
                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${admin.role === 'SUPER_ADMIN' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-600'}`}>
                                            <User className="w-4 h-4" />
                                         </div>
                                         <div>
                                             <p className="font-bold text-slate-800">{admin.username}</p>
                                             <p className="text-xs text-slate-500">{admin.role}</p>
                                         </div>
                                     </div>
                                     {admin.role !== 'SUPER_ADMIN' && (
                                         <button onClick={() => handleDeleteAdmin(admin.username)} className="text-red-400 hover:text-red-600 p-2">
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                     )}
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* MANAGE REGULAR USERS (Super Admin Only) */}
                {activeTab === 'users' && isSuperAdmin && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Registered Users</h2>
                        
                        <div className="space-y-3">
                             {regularUsers.length === 0 ? (
                                 <p className="text-slate-500 italic">No regular users registered yet.</p>
                             ) : (
                                regularUsers.map(user => {
                                    const favCount = getFavoritesCount(user.username);
                                    return (
                                        <div key={user.username} className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{user.name || 'Unnamed User'}</p>
                                                    <p className="text-sm text-slate-500">{user.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <span className="block font-bold text-slate-700">{favCount}</span>
                                                    <span className="text-xs text-slate-400 uppercase">Favorites</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.username)} 
                                                    className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                             )}
                        </div>
                    </div>
                )}

                {/* SITE SETTINGS (Super Admin Only) */}
                {activeTab === 'settings' && isSuperAdmin && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Site Settings</h2>
                        
                        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center"><ImageIcon className="w-5 h-5 mr-2" /> Website Logo</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-600 mb-2">Logo URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 border p-3 rounded-lg text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="https://example.com/logo.png"
                                        value={siteLogo}
                                        onChange={(e) => setSiteLogo(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Enter a direct URL to an image (PNG, JPG, SVG). Leave empty to use the default icon.</p>
                            </div>

                            {siteLogo && (
                                <div className="mb-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Preview</p>
                                    <div className="p-4 bg-slate-100 rounded-lg inline-block">
                                        <img src={siteLogo} alt="Logo Preview" className="h-16 w-auto object-contain rounded" />
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}

                {/* BACKUP & RESTORE (Super Admin Only) */}
                {activeTab === 'backup' && isSuperAdmin && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Backup & Restore</h2>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 mb-6">
                            <p className="text-sm">
                                Create a full backup of all your custom songs, artists, banners, views, and categories. 
                                <br /><strong>Note:</strong> Keep your backup file secure.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* EXPORT */}
                            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center"><Download className="w-5 h-5 mr-2 text-primary" /> Download Backup</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Download all site data as a JSON file. Use this file to restore content if the site crashes or if you move to a new browser.
                                </p>
                                <button 
                                    onClick={handleDownloadBackup}
                                    className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 flex items-center justify-center"
                                >
                                    <Download className="w-5 h-5 mr-2" /> Download Data
                                </button>
                            </div>

                            {/* IMPORT */}
                            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center"><Upload className="w-5 h-5 mr-2 text-red-500" /> Upload Backup</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Restore data from a backup file. <span className="font-bold text-red-500">Warning: This will overwrite current data.</span>
                                </p>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        accept=".json"
                                        onChange={handleUploadBackup}
                                        className="hidden"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-lg hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center"
                                    >
                                        <Upload className="w-5 h-5 mr-2" /> Select File to Restore
                                    </button>
                                </div>
                            </div>
                        </div>
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
                            
                            {/* Category Selector (Multi Select) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Grid className="w-4 h-4 mr-1"/> Categories (Select multiple)</label>
                                <div className="border rounded p-2 bg-white max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => toggleCategorySelection(cat)}
                                            className={`text-xs px-3 py-2 rounded-lg text-left transition-colors ${
                                                songForm.categories.includes(cat)
                                                ? 'bg-primary text-white font-bold'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Selected: {songForm.categories.join(', ') || 'None'}</p>
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
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Target URL (Optional)</label>
                                <input type="text" className="w-full border p-2 rounded" value={bannerForm.link} onChange={e => setBannerForm({...bannerForm, link: e.target.value})} placeholder="https://..." />
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
