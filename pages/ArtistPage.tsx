import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArtistDetails } from '../services/geminiService';
import { ArtistDetails } from '../types';
import Loader from '../components/Loader';
import { Play, Disc, ArrowLeft, Heart } from 'lucide-react';
import { isFavorite, toggleFavorite, generateId } from '../utils/storage';

const ArtistPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [artist, setArtist] = useState<ArtistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      if (name) {
        setLoading(true);
        const data = await getArtistDetails(name);
        setArtist(data);
        if (data) {
           setIsFav(isFavorite(generateId('artist', data.name)));
        }
        setLoading(false);
      }
    };
    fetchArtist();
  }, [name]);

  const handleFavorite = () => {
    if (!artist) return;
    const item = {
        id: generateId('artist', artist.name),
        type: 'artist' as const,
        name: artist.name,
        subtext: "Artist"
    };
    const added = toggleFavorite(item);
    setIsFav(added);
  };

  if (loading) return <Loader fullScreen text="Loading artist profile..." />;
  if (!artist) return <div className="text-center text-slate-500 pt-20">Artist not found</div>;

  return (
    <div className="min-h-screen">
       {/* Hero Banner */}
       <div className="relative h-80 md:h-96 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
            <img 
                src={`https://picsum.photos/seed/${artist.name}hero/1200/600`} 
                alt={artist.name} 
                className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute bottom-0 left-0 w-full p-8 z-20 max-w-7xl mx-auto flex flex-col md:flex-row items-end md:items-center gap-6">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-2xl flex-shrink-0 bg-white">
                    <img 
                        src={`https://picsum.photos/seed/${artist.name}avatar/400`} 
                        alt={artist.name} 
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
                <div className="mb-4 md:mb-8 text-white w-full">
                    <div className="flex flex-col items-start">
                        {artist.genre && (
                          <span className="mb-2 px-3 py-1 bg-primary/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20 shadow-lg">
                            {artist.genre}
                          </span>
                        )}
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight shadow-black drop-shadow-lg">{artist.name}</h1>
                            </div>
                            <button 
                                onClick={handleFavorite}
                                className={`p-3 rounded-full backdrop-blur-md transition-all ${isFav ? 'bg-white text-red-500 shadow-xl' : 'bg-black/30 text-white hover:bg-white/20'}`}
                            >
                                <Heart className={`w-8 h-8 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Link to="/browse/artists/A" className="absolute top-8 left-8 z-30 flex items-center text-white/90 hover:text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-all border border-white/20">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Browse
            </Link>
       </div>

       <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Col: Bio */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">About</h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                        {artist.bio}
                    </p>
                </div>
            </div>

            {/* Right Col: Top Songs */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <Disc className="mr-3 text-primary" /> Popular Tracks
                </h2>
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