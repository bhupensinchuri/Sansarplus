import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllCustomSongs } from '../utils/dataManager';
import Loader from '../components/Loader';
import { ArrowLeft, Music, Disc, Grid } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DisplaySong {
  id: string;
  title: string;
  title_nepali?: string;
  artist: string;
  language?: string;
  note?: string;
}

const CategoryDetailsPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [songs, setSongs] = useState<DisplaySong[]>([]);
  const [loading, setLoading] = useState(true);
  const { language: appLanguage } = useLanguage();

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      if (!category) {
        setLoading(false);
        return;
      }

      const allSongs = await getAllCustomSongs();
      const decodedCategory = decodeURIComponent(category);

      const filtered = allSongs.filter(song => {
        if (song.categories && song.categories.includes(decodedCategory)) {
            return true;
        }
        if (song.category === decodedCategory) {
            return true;
        }
        return false;
      });

      filtered.sort((a, b) => a.title.localeCompare(b.title));

      setSongs(filtered.map(s => ({ 
          id: s.id,
          title: s.title, 
          title_nepali: s.title_nepali, 
          artist: s.artist, 
          language: s.language,
          note: s.note
      })));
      setLoading(false);
    };

    fetchSongs();
  }, [category]);

  const getSongColorClass = (lang?: string) => {
      if (lang === 'hindi') return 'text-red-600';
      if (lang === 'english') return 'text-blue-600';
      return 'text-slate-800';
  };

  if (loading) return <Loader fullScreen text="Loading songs..." />;

  const decodedCategory = category ? decodeURIComponent(category) : 'Unknown Category';

  const getGradient = (str: string) => {
    const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const gradients = [
      'from-pink-500 to-rose-500', 'from-red-500 to-orange-500', 'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500', 'from-amber-500 to-yellow-500', 'from-emerald-500 to-teal-500',
      'from-indigo-500 to-violet-500', 'from-slate-600 to-slate-800', 'from-orange-500 to-amber-500'
    ];
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`bg-gradient-to-r ${getGradient(decodedCategory)} text-white py-12 px-4 shadow-lg`}>
        <div className="max-w-4xl mx-auto">
            <Link to="/categories" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors font-medium">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Categories
            </Link>
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                    <Grid className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{decodedCategory}</h1>
                    <p className="text-white/90 font-medium text-lg">{songs.length} {songs.length === 1 ? 'Song' : 'Songs'}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
            {songs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Music className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg">No songs found in this category yet.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {songs.map((song, idx) => {
                        const displayTitle = (appLanguage === 'nepali' && song.title_nepali) ? song.title_nepali : song.title;
                        return (
                        <Link 
                            key={idx}
                            to={`/l/${song.id}`} // Updated to short URL
                            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-5">
                                <span className="text-slate-300 font-bold text-lg w-6 text-center group-hover:text-primary transition-colors">{idx + 1}</span>
                                <div>
                                    <h3 className={`text-lg font-bold transition-colors ${getSongColorClass(song.language)}`}>
                                        {displayTitle}
                                        {song.note && <span className="ml-1.5 text-xs text-slate-400 font-medium italic">({song.note})</span>}
                                    </h3>
                                    {song.artist && song.artist.trim().toLowerCase() !== 'unknown' && (
                                        <div className="flex items-center text-slate-500 text-sm mt-0.5">
                                            <Disc className="w-3 h-3 mr-1" />
                                            {song.artist}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </div>
                        </Link>
                    )})}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsPage;