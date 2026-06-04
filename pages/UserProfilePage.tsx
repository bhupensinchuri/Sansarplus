
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUser, AdminUser } from '../utils/auth';
import { User, Camera, Upload, Save } from 'lucide-react';

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Willow', 'Bailey', 'Bandit', 'Jasper', 'Sassy', 'Shadow', 'Misty', 'Leo'];

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/user-login');
      return;
    }
    setUser(currentUser);
    setName(currentUser.name || '');
    setCurrentAvatar(currentUser.profilePicture || '');
  }, [navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
          alert("File size too large. Please upload an image under 2MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresetAvatar = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=transparent`;
    setCurrentAvatar(url);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const success = await updateUser(user.username, {
        name: name,
        profilePicture: currentAvatar
    });

    if (success) {
        setSaving(false);
        alert("Profile updated successfully!");
    } else {
        setSaving(false);
        alert("Failed to update profile.");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center text-white relative">
            <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
            <p className="opacity-80">Customize your presence on SansarPlus</p>
            
            {/* Avatar Preview */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg relative group">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        {currentAvatar ? (
                            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-slate-300" />
                        )}
                    </div>
                    {/* Camera overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-16 pb-8 px-8 space-y-8">
            
            {/* 1. Basic Info */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your Name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                    <input 
                        type="text" 
                        value={user.username}
                        disabled
                        className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl p-3 cursor-not-allowed"
                    />
                </div>
            </div>

            {/* 2. Choose Avatar */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Choose an Avatar</label>
                <div className="flex flex-wrap gap-3 justify-center">
                    {AVATAR_SEEDS.map(seed => (
                        <button 
                            key={seed}
                            onClick={() => selectPresetAvatar(seed)}
                            className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 hover:border-primary transition-all hover:scale-110"
                        >
                            <img 
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e0e7ff`} 
                                alt={seed}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Upload Custom */}
            <div>
                 <label className="block text-sm font-bold text-slate-700 mb-3">Or Upload Your Own</label>
                 <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">PNG, JPG or GIF (MAX. 2MB)</p>
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </label>
                </div> 
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center shadow-lg shadow-primary/20"
                >
                    {saving ? 'Saving...' : (
                        <>
                            <Save className="w-5 h-5 mr-2" /> Save Changes
                        </>
                    )}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
