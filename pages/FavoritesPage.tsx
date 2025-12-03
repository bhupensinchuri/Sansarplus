import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, FavoriteItem } from '../utils/storage';
import { Heart, Mic2, Disc, ArrowRight } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-red-100 rounded-full">
           <Heart className="w-8 h-8 text-red-500 fill-current" />
        </div>
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Your Favorites</h1>
           <p className="text-slate-500">Saved songs and artists</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200">
           <Heart className="w-16 h-16 text-slate-200 mb-4" />
           <h2 className="text-xl font-bold text-slate-900 mb-2">No favorites yet</h2>
           <p className="text-slate-500 mb-6">Start browsing and click the heart icon to save what you love.</p>
           <Link to="/" className="px-6 py-3 bg-primary text-white rounded-full font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all">
             Explore Music
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((item, idx) => (
            <Link
              key={idx}
              to={item.type === 'artist' 
                ? `/artist/${encodeURIComponent(item.name)}` 
                : `/lyrics/${encodeURIComponent(item.subtext)}/${encodeURIComponent(item.name)}`
              }
              className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md"
            >
               <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4 transition-colors ${item.type === 'artist' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                  {item.type === 'artist' ? <Mic2 className="w-6 h-6" /> : <Disc className="w-6 h-6" />}
               </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{item.type}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{item.name}</h3>
                <p className="text-slate-500 text-sm truncate">{item.subtext}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;