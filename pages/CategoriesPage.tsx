
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../utils/dataManager';
import { useAuth } from '../utils/auth';
import { Edit2, Trash2, Check, X, Settings } from 'lucide-react';
import { Category } from '../types';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Admin State
  const { user, isAuth } = useAuth();
  const isSuperAdmin = isAuth && user?.role === 'SUPER_ADMIN';
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryImg, setNewCategoryImg] = useState('');
  const [editingCategory, setEditingCategory] = useState<{original: string, current: string, imageUrl: string} | null>(null);

  useEffect(() => {
    refreshCategories();

    const handleContentChange = () => {
        refreshCategories();
    };
    window.addEventListener('content-change', handleContentChange);
    return () => {
        window.removeEventListener('content-change', handleContentChange);
    };
  }, []);

  const refreshCategories = async () => {
    setCategories(await getCategories());
  };

  // Filter categories to hide 'Devotional' and 'Contemporary'
  const filteredCategories = categories.filter(cat => 
    !['devotional', 'contemporary'].includes(cat.name.toLowerCase())
  );

  // Generate consistent colors based on string hash (Fallback)
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

  const handleAdd = async () => {
      if(newCategory.trim()) {
          const result = await addCategory(newCategory.trim(), newCategoryImg.trim());
          if (result.success) {
              setNewCategory('');
              setNewCategoryImg('');
              refreshCategories();
          } else {
              alert("Error adding category: " + result.error);
          }
      }
  };

  const handleUpdate = async () => {
      if(editingCategory && editingCategory.current.trim()) {
          await updateCategory(editingCategory.original, editingCategory.current.trim(), editingCategory.imageUrl.trim());
          setEditingCategory(null);
          refreshCategories();
      }
  };

  const handleDelete = async (cat: string) => {
      if(window.confirm(`Are you sure you want to delete category "${cat}"?`)) {
          await deleteCategory(cat);
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
              <div className="flex flex-col md:flex-row gap-2">
                  <input 
                    type="text" 
                    className="flex-1 p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Category Name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="flex-1 p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Background Image URL (Optional)"
                    value={newCategoryImg}
                    onChange={(e) => setNewCategoryImg(e.target.value)}
                  />
                  <button onClick={handleAdd} className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90">Add</button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredCategories.map((cat) => (
            <div key={cat.name} className="relative group">
                {editingCategory?.original === cat.name ? (
                    <div className="h-48 rounded-2xl bg-white border-2 border-primary p-4 flex flex-col justify-center items-center shadow-lg space-y-2 z-10 relative">
                        <input 
                            className="w-full text-center font-bold text-slate-800 border-b border-primary mb-1 focus:outline-none"
                            value={editingCategory.current}
                            onChange={(e) => setEditingCategory({...editingCategory, current: e.target.value})}
                            placeholder="Name"
                            autoFocus
                        />
                        <input 
                            className="w-full text-center text-xs text-slate-500 border-b border-slate-300 mb-2 focus:outline-none"
                            value={editingCategory.imageUrl}
                            onChange={(e) => setEditingCategory({...editingCategory, imageUrl: e.target.value})}
                            placeholder="Image URL"
                        />
                        <div className="flex gap-2">
                            <button onClick={handleUpdate} className="bg-green-500 text-white p-1 rounded hover:bg-green-600"><Check className="w-4 h-4"/></button>
                            <button onClick={() => setEditingCategory(null)} className="bg-slate-400 text-white p-1 rounded hover:bg-slate-500"><X className="w-4 h-4"/></button>
                        </div>
                    </div>
                ) : (
                  <Link
                    to={`/category/${encodeURIComponent(cat.name)}`}
                    className={`
                        block relative h-32 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105
                        ${!cat.imageUrl ? `bg-gradient-to-br ${getGradient(cat.name)}` : ''}
                        ${isAdminMode ? 'opacity-90 hover:opacity-100 cursor-default' : ''}
                    `}
                    style={cat.imageUrl ? { backgroundImage: `url(${cat.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                    onClick={(e) => isAdminMode && e.preventDefault()} // Disable navigation in admin mode
                  >
                    {/* Dark overlay if image present */}
                    {cat.imageUrl && <div className="absolute inset-0 bg-black/40"></div>}

                    <div className="absolute inset-0 flex items-center justify-center p-4">
                       {/* Title text overlay removed site-wide as per request */}
                    </div>
                  </Link>
                )}
                
                {/* Admin Overlays */}
                {isAdminMode && !editingCategory && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm p-1 rounded-lg z-20">
                        <button 
                            onClick={(e) => { e.preventDefault(); setEditingCategory({original: cat.name, current: cat.name, imageUrl: cat.imageUrl || ''}); }} 
                            className="p-1.5 bg-white text-slate-800 rounded hover:bg-primary hover:text-white transition-colors shadow-sm"
                        >
                            <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); handleDelete(cat.name); }} 
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
