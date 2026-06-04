import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSongsByLetter, getArtistsByLetter, ArtistWithRoles } from '../services/geminiService';
import Loader from '../components/Loader';
import AlphabetNav from '../components/AlphabetNav';
import { Music, Disc, ArrowRight, Mic2, PenTool, Filter, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BrowseProps {
  mode: 'songs' | 'artists';
}

type RoleFilter = 'all' | 'Singer' | 'Composer' | 'Lyricist';

const Browse: React.FC<BrowseProps> = ({ mode }) => {
  const { letter } = useParams<{ letter: string }>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const { t, language: appLanguage } = useLanguage();

  const fetchData = async () => {
    if (letter) {
      setLoading(true);
      const decodedLetter = decodeURIComponent(letter);
      if (mode === 'songs') {
        const results = await getSongsByLetter(decodedLetter);
        setData(results);
      } else {
        const results = await getArtistsByLetter(decodedLetter);
        setData(results);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setRoleFilter('all');

    const handleContentChange = () => fetchData();
    window.addEventListener('content-change', handleContentChange);
    return () => window.removeEventListener('content-change', handleContentChange);
  }, [letter, mode]);

  const getSongColorClass = (lang?: string) => {
      if (lang === 'hindi') return 'text-red-600';
      if (lang === 'english') return 'text-blue-600';
      return 'text-slate-800';
  };

  const filteredData = mode === 'artists' && roleFilter !== 'all'
    ? (data as ArtistWithRoles[]).filter(artist => artist.roles.includes(roleFilter))
    : data;

  const displayLetter = decodeURIComponent(letter || '');
  const titleText = mode === 'songs' ? t('Songs') : t('Artists');
  
  const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    switch(role) {
      case 'Singer': return <span className="bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 border border-pink-100"><Mic2 className="w-2.5 h-2.5" /> Singer</span>;
      case 'Composer': return <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 border border-indigo-100"><Music className="w-2.5 h-2.5" /> Composer</span>;
      case 'Lyricist': return <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 border border-purple-100"><PenTool className="w-2.5 h-2.5" /> Lyricist</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AlphabetNav mode={mode} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 gap-6">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="bg-primary/10 text-primary p-2 rounded-2xl text-2xl min-w-[3.5rem] text-center shadow-sm">{displayLetter}</span>
                    <span className="capitalize">{titleText}</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">{t('Discover popular')} {titleText.toLowerCase()} {t('starting with')} "{displayLetter}"</p>
            </div>
            
            {mode === 'artists' && !loading && data.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="px-3 text-slate-400">
                        <Filter className="w-4 h-4" />
                    </div>
                    {(['all', 'Singer', 'Composer', 'Lyricist'] as RoleFilter[]).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setRoleFilter(filter)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                roleFilter === filter 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {roleFilter === filter && <Check className="w-3 h-3" />}
                            {filter === 'all' ? 'All Roles' : filter + 's'}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {loading ? (
          <Loader text={`Fetching ${mode} starting with ${displayLetter}...`} />
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                {mode === 'songs' ? <Music className="text-slate-300 w-10 h-10" /> : <Mic2 className="text-slate-300 w-10 h-10" />}
            </div>
            <h3 className="text-2xl text-slate-400 font-bold mb-2">{t('No')} {titleText.toLowerCase()} {t('found')}</h3>
            <p className="text-slate-500">{roleFilter === 'all' ? t('Try selecting a different letter.') : `No ${roleFilter.toLowerCase()}s found starting with "${displayLetter}".`}</p>
          </div>
        ) : (
          <div className={mode === 'songs' ? "grid grid-cols-1 gap-2 max-w-4xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
            {filteredData.map((item, idx) => {
              const isSong = mode === 'songs';
              const title = isSong ? ((appLanguage === 'nepali' && item.title_nepali) ? item.title_nepali : item.title) : item.name;
              const subtitle = isSong ? item.artist : undefined;
              const language = isSong ? item.language : undefined;
              const imageUrl = !isSong ? item.imageUrl : undefined;
              const roles = !isSong ? item.roles : [];
              const note = isSong ? item.note : undefined;
              
              const link = isSong 
                ? `/l/${item.id}` 
                : `/artist/${encodeURIComponent(item.name)}`;

              const titleClass = isSong ? getSongColorClass(language) : 'text-slate-800';
              const isArtistUnknown = isSong && subtitle?.toLowerCase() === 'unknown';

              return (
                <Link 
                  key={idx} 
                  to={link}
                  className={`group flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/30 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ${isSong ? 'p-3 md:p-4' : 'p-4 hover:-translate-y-1'}`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    {/* Index Number for List View */}
                    {isSong && (
                        <span className="text-slate-300 font-bold w-6 text-xs mr-2 text-right group-hover:text-primary transition-colors">{idx + 1}</span>
                    )}

                    <div className={`rounded-2xl overflow-hidden flex-shrink-0 mr-4 shadow-inner border border-slate-100 flex items-center justify-center bg-slate-50 group-hover:bg-primary/5 transition-colors ${isSong ? 'w-10 h-10' : 'w-12 h-12'}`}>
                        {imageUrl ? (
                            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors ${isSong ? 'bg-primary/10' : 'bg-secondary/10 text-secondary/40 group-hover:text-secondary'}`}>
                                {isSong ? <Disc className="w-5 h-5" /> : <Mic2 className="w-6 h-6" />}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 pr-4 flex-1">
                      <h3 className={`font-bold truncate transition-colors text-base md:text-lg flex items-center gap-2 ${titleClass}`}>
                        {title}
                        {isSong && note && (
                            <span className="text-[10px] md:text-xs text-slate-400 font-normal italic shrink-0">({note})</span>
                        )}
                      </h3>
                      {isSong ? (
                        !isArtistUnknown && <p className="text-slate-400 text-xs font-bold uppercase tracking-wider truncate">{subtitle}</p>
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {roles.map((role: string) => <RoleBadge key={role} role={role} />)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-0 -rotate-45 shrink-0 ${isSong ? 'w-7 h-7' : 'w-8 h-8'}`}>
                    <ArrowRight className={isSong ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;