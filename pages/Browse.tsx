import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSongsByLetter, getArtistsByLetter } from '../services/geminiService';
import Loader from '../components/Loader';
import AlphabetNav from '../components/AlphabetNav';
import { Music, Disc, ArrowRight, Mic2 } from 'lucide-react';

interface BrowseProps {
  mode: 'songs' | 'artists';
}

const Browse: React.FC<BrowseProps> = ({ mode }) => {
  const { letter } = useParams<{ letter: string }>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (letter) {
        setLoading(true);
        if (mode === 'songs') {
          const results = await getSongsByLetter(letter);
          setData(results);
        } else {
          const results = await getArtistsByLetter(letter);
          setData(results);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [letter, mode]);

  return (
    <div className="min-h-screen">
      <AlphabetNav mode={mode} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="bg-primary/10 text-primary p-2 rounded-lg text-2xl min-w-[3rem] text-center">{letter}</span>
                    <span className="capitalize">{mode}</span>
                </h1>
                <p className="text-slate-500 mt-2">Discover popular {mode} starting with "{letter}"</p>
            </div>
            {mode === 'songs' ? <Music className="text-slate-200 w-12 h-12" /> : <Mic2 className="text-slate-200 w-12 h-12" />}
        </div>

        {loading ? (
          <Loader text={`Fetching ${mode} starting with ${letter}...`} />
        ) : data.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl text-slate-400 font-bold mb-2">No {mode} found</h3>
            <p className="text-slate-500">Try selecting a different letter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item, idx) => {
              const title = mode === 'songs' ? item.title : item;
              const subtitle = mode === 'songs' ? item.artist : 'Artist';
              const link = mode === 'songs' 
                ? `/lyrics/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`
                : `/artist/${encodeURIComponent(item)}`;

              return (
                <Link 
                  key={idx} 
                  to={link}
                  className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/30 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mr-4 flex-shrink-0 ${mode === 'songs' ? 'bg-primary/10' : 'bg-secondary/10 text-secondary group-hover:bg-secondary'}`}>
                      {mode === 'songs' ? <Disc className="w-5 h-5" /> : <Mic2 className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 pr-4">
                      <h3 className="text-slate-800 font-semibold truncate group-hover:text-primary transition-colors">{title}</h3>
                      {mode === 'songs' && <p className="text-slate-500 text-sm truncate">{subtitle}</p>}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0" />
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