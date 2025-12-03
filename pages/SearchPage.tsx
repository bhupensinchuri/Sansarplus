import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { searchMusic } from '../services/geminiService';
import { SearchResult } from '../types';
import Loader from '../components/Loader';
import { Mic2, Disc, Search } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearch = async () => {
      if (query) {
        setLoading(true);
        const data = await searchMusic(query);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]); // Clear results if no query
      }
    };
    fetchSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search/${encodeURIComponent(searchInput)}`);
    }
  };

  // Search Entry Mode (No Query URL)
  if (!query) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center -mt-20 h-[80vh]">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Search LyricVault</h1>
          <p className="text-slate-500">Find your favorite artists, songs, and lyrics.</p>
          
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              autoFocus
              type="text"
              placeholder="What do you want to listen to?"
              className="w-full bg-white border border-slate-200 rounded-full py-4 pl-12 pr-6 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg shadow-slate-200 transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Search className="absolute left-4 top-4.5 w-6 h-6 text-slate-400" />
          </form>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider w-full mb-2">Popular Searches</span>
            {['Taylor Swift', 'The Weeknd', 'Rock', 'Pop', '80s Hits'].map(term => (
              <button 
                key={term}
                onClick={() => navigate(`/search/${term}`)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm text-slate-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Search Results Mode
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Results for "<span className="text-primary">{query}</span>"
        </h1>
        {/* Quick re-search bar for convenience */}
         <form onSubmit={(e) => { e.preventDefault(); navigate(`/search/${encodeURIComponent(searchInput)}`); }} className="relative md:w-1/2">
            <input
              type="text"
              placeholder="Search again..."
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-primary shadow-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </form>
      </div>

      {loading ? (
        <Loader text="Searching database..." />
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xl font-semibold mb-2">No results found</p>
          <p>Try checking for typos or using different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item, idx) => (
            <Link
              key={idx}
              to={item.type === 'artist' 
                ? `/artist/${encodeURIComponent(item.name)}` 
                : `/lyrics/${encodeURIComponent(item.subtext)}/${encodeURIComponent(item.name)}`
              }
              className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md"
            >
              {/* Only show thumbnail for Artists */}
              {item.type === 'artist' ? (
                <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 mr-4">
                   <img 
                      src={`https://picsum.photos/seed/${item.name + item.type}/150`} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                   />
                </div>
              ) : (
                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-primary/20 transition-colors">
                     <Disc className="w-6 h-6 text-primary" />
                 </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                    {item.type === 'artist' ? <Mic2 className="w-3 h-3 text-secondary" /> : <Disc className="w-3 h-3 text-primary" />}
                    <span className="text-[10px] font-bold uppercase text-slate-400">{item.type}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{item.name}</h3>
                <p className="text-slate-500 text-sm truncate">{item.subtext}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;