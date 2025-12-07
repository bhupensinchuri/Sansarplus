
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../utils/dataManager';
import { useAuth, getCurrentUserRole } from '../utils/auth';
import { Edit2, Trash2, Plus, Check, X, Shield, Settings } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  
  // Admin State
  const isAuth = useAuth();
  const userRole = getCurrentUserRole();
  const isSuperAdmin = isAuth && userRole === 'SUPER_ADMIN';
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{original: string, current: string} | null>(null);

  useEffect(() => {
    refreshCategories();
  }, []);

  const refreshCategories = () => {
    setCategories(getCategories());
  };

  // Generate consistent colors based on string hash
  const getGradient = (str: string) => {
    const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const gradients = [
      'from-pink-500 to-rose-500', 'from-red-500 to-orange-500', 'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500', 'from-amber-500 to-yellow-500', 'from-emerald-500 to-teal-500',
      'from-indigo-500 to-violet-500', 'from-slate-600 to-slate-800', 'from-orange-500 to-amber-500',
      'from-lime-500 to-green-500', 'from-fuchsia-500 to-purple-600', 'from-rose-400 to-red-500'
    ];
    return gradients[Math.abs(hash) % gradients.length];
  };

  const handleAdd = () => {
      if(newCategory.trim()) {
          addCategory(newCategory.trim());
          setNewCategory('');
          refreshCategories();
      }
  };

  const handleUpdate = () => {
      if(editingCategory && editingCategory.current.trim()) {
          updateCategory(editingCategory.original, editingCategory.current.trim());
          setEditingCategory(null);
          refreshCategories();
      }
  };

  const handleDelete = (cat: string) => {
      if(window.confirm(`Are you sure you want to delete category "${cat}"?`)) {
          deleteCategory(cat);
          refreshCategories();
      }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 pb-32">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          
          {isSuperAdmin && (
              <button 
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center px-4 py-2 rounded-full font-bold text-sm transition-all ${isAdminMode ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                  {isAdminMode ? <Check className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                  {isAdminMode ? 'Done Editing' : 'Manage'}
              </button>
          )}
      </div>
      
      {isAdminMode && (
          <div className="mb-8 p-4 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Add New Category</h3>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Category Name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button onClick={handleAdd} className="bg-primary text-white px-6 rounded-lg font-bold hover:bg-primary/90">Add</button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((genre) => (
            <div key={genre} className="relative group">
                {editingCategory?.original === genre ? (
                    <div className="h-32 rounded-2xl bg-white border-2 border-primary p-4 flex flex-col justify-center items-center shadow-lg">
                        <input 
                            className="w-full text-center font-bold text-slate-800 border-b border-primary mb-2 focus:outline-none"
                            value={editingCategory.current}
                            onChange={(e) => setEditingCategory({...editingCategory, current: e.target.value})}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button onClick={handleUpdate} className="bg-green-500 text-white p-1 rounded hover:bg-green-600"><Check className="w-4 h-4"/></button>
                            <button onClick={() => setEditingCategory(null)} className="bg-slate-400 text-white p-1 rounded hover:bg-slate-500"><X className="w-4 h-4"/></button>
                        </div>
                    </div>
                ) : (
                  <Link
                    to={`/search/${encodeURIComponent(genre)}`}
                    className={`
                        block relative h-32 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105
                        bg-gradient-to-br ${getGradient(genre)}
                        ${isAdminMode ? 'opacity-90 hover:opacity-100 cursor-default' : ''}
                    `}
                    onClick={(e) => isAdminMode && e.preventDefault()} // Disable navigation in admin mode
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                       <span className="text-white text-xl font-bold tracking-wide text-center drop-shadow-md">{genre}</span>
                    </div>
                  </Link>
                )}
                
                {/* Admin Overlays */}
                {isAdminMode && !editingCategory && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm p-1 rounded-lg">
                        <button 
                            onClick={(e) => { e.preventDefault(); setEditingCategory({original: genre, current: genre}); }} 
                            className="p-1.5 bg-white text-slate-800 rounded hover:bg-primary hover:text-white transition-colors shadow-sm"
                        >
                            <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); handleDelete(genre); }} 
                            className="p-1.5 bg-white text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
