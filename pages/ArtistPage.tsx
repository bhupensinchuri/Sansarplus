import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getArtistDetails } from '../services/geminiService';
import { ArtistDetails } from '../types';
import Loader from '../components/Loader';
import { Disc, ArrowLeft, Edit, Save, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../utils/auth';
import { saveCustomArtist, deleteCustomArtist } from '../utils/dataManager';

const ArtistPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [artist, setArtist] = useState<ArtistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Admin / Edit State
  const isAuth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ArtistDetails>({
      name: '',
      bio: '',
      topSongs: [],
      imageUrl: ''
  });
  const [topSongsString, setTopSongsString] = useState('');

  useEffect(() => {
    const fetchArtist = async () => {
      if (name) {
        setLoading(true);
        const data = await getArtistDetails(name);
        setArtist(data);
        if (data) {
           setEditForm({ ...data, imageUrl: data.imageUrl || '' });
           setTopSongsString(data.topSongs.join(', '));
        }
        setLoading(false);
      }
    };
    fetchArtist();
  }, [name]);

  const handleSaveEdit = () => {
      if (!artist) return;
      const updatedArtist = {
          ...editForm,
          topSongs: topSongsString.split(',').map(s => s.trim()).filter(s => s)
      };
      saveCustomArtist(artist.name, updatedArtist);
      setArtist(updatedArtist);
      setIsEditing(false);
  };

  const handleDeleteArtist = () => {
      if (!artist) return;
      if (window.confirm('Delete this artist profile? This will revert to AI generation or remove if custom.')) {
          deleteCustomArtist(artist.name);
          navigate('/');
      }
  };

  if (loading) return <Loader fullScreen text="Loading artist profile..." />;
  if (!artist) return <div className="text-center text-slate-500 pt-20">Artist not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
       {/* Simplified Header */}
       <div className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link to="/browse/artists/A" className="inline-flex items-center text-slate-500 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse
                </Link>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                         {/* Artist Image Display */}
                         {artist.imageUrl ? (
                             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md flex-shrink-0">
                                 <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                             </div>
                         ) : (
                             // Fallback Placeholder if no image
                             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 shadow-inner flex-shrink-0">
                                 <ImageIcon className="w-10 h-10" />
                             </div>
                         )}

                         <div>
                             <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{artist.name}</h1>
                         </div>
                    </div>
                    
                    {isAuth && (
                        <div className="flex gap-2 self-start md:self-center">
                            {isEditing ? (
                                    <button onClick={handleSaveEdit} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center">
                                        <Save className="w-5 h-5 mr-2" /> Save
                                    </button>
                            ) : (
                                    <button onClick={() => setIsEditing(true)} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                                        <Edit className="w-5 h-5 mr-2" /> Edit
                                    </button>
                            )}
                            {isEditing && (
                                    <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                            )}
                            {!isEditing && (
                                    <button onClick={handleDeleteArtist} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center">
                                        <Trash2 className="w-5 h-5 mr-2" /> Delete
                                    </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Col: Bio */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">About</h3>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">Profile Image URL</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded"
                                    value={editForm.imageUrl || ''}
                                    onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">Biography</label>
                                <textarea 
                                    className="w-full h-64 border p-2 rounded"
                                    value={editForm.bio}
                                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-600 leading-loose text-sm md:text-base mb-4">
                            {artist.bio || "No biography available."}
                        </p>
                    )}
                </div>
            </div>

            {/* Right Col: Top Songs */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <Disc className="mr-3 text-primary" /> Popular Tracks
                </h2>
                
                {isEditing && (
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-500 mb-1">Edit Songs (comma separated)</label>
                        <input 
                            type="text" 
                            className="w-full border p-3 rounded"
                            value={topSongsString}
                            onChange={e => setTopSongsString(e.target.value)}
                        />
                    </div>
                )}

                <div className="space-y-3">
                    {artist.topSongs.map((song, idx) => (
                        <Link 
                            key={idx}
                            to={`/lyrics/${encodeURIComponent(artist.name)}/${encodeURIComponent(song)}`}
                            className="flex items-center justify-between p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/50 group transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center space-x-4">
                                <span className="text-slate-400 font-mono w-6 text-center text-lg">{idx + 1}</span>
                                <span className="font-semibold text-slate-800 group-hover:text-primary transition-colors text-lg">{song}</span>
                            </div>
                            <span className="text-xs text-slate-500 px-3 py-1 border border-slate-200 rounded-full group-hover:border-primary/50 group-hover:text-primary transition-colors bg-slate-50">
                                View Lyrics
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
       </div>
    </div>
  );
};

export default ArtistPage;