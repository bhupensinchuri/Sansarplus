import React from 'react';
import { Link } from 'react-router-dom';

const GENRES = [
  { name: 'Pop', color: 'from-pink-500 to-rose-500' },
  { name: 'Rock', color: 'from-red-500 to-orange-500' },
  { name: 'Hip Hop', color: 'from-purple-500 to-indigo-500' },
  { name: 'R&B', color: 'from-blue-500 to-cyan-500' },
  { name: 'Country', color: 'from-amber-500 to-yellow-500' },
  { name: 'Electronic', color: 'from-emerald-500 to-teal-500' },
  { name: 'Jazz', color: 'from-indigo-500 to-violet-500' },
  { name: 'Classical', color: 'from-slate-600 to-slate-800' },
  { name: 'Latin', color: 'from-orange-500 to-amber-500' },
  { name: 'Indie', color: 'from-lime-500 to-green-500' },
];

const CategoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Music Categories</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {GENRES.map((genre) => (
          <Link
            key={genre.name}
            to={`/search/${genre.name}`}
            className={`
                relative h-32 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 group
                bg-gradient-to-br ${genre.color}
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
               <span className="text-white text-xl font-bold tracking-wide group-hover:scale-110 transition-transform">{genre.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;