
import React, { useEffect, useState } from 'react';
import { Target, Eye, Music2, Mail, MessageCircle, Facebook, Globe } from 'lucide-react';
import { getContactInfo } from '../utils/dataManager';
import { ContactInfo } from '../types';
import Loader from '../components/Loader';

const ContactPage: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      const data = await getContactInfo();
      setContactInfo(data);
      setLoading(false);
    };
    fetchInfo();
  }, []);

  const defaultInfo: ContactInfo = {
    missionTitle: "Our Mission",
    missionText: "To connect Nepali Christians globally through music by preserving our rich lyrical heritage. We strive to make worship accessible to everyone, everywhere, fostering spiritual growth and community through a unified digital platform.",
    visionTitle: "Our Vision",
    visionText: "To become the most comprehensive and trusted digital resource for Nepali Christian worship. We envision a future where every believer has instant access to the songs, hymns, and resources they need to praise God in spirit and in truth.",
    email: "contactsansarplus@gmail.com",
    whatsapp: "+1 330-285-6420",
    facebookUrl: "https://www.facebook.com/mysansarplus",
    footerTitle: "A Free Library for Everyone",
    footerText: "SansarPlus is and will always remain a free resource. Your support and prayers help us maintain and expand this library for generations to come."
  };

  const info = contactInfo || defaultInfo;

  if (loading) return <Loader fullScreen text="Loading profile..." />;

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-12 pb-24">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">About SansarPlus</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          The ultimate digital sanctuary for Nepali Christian worship resources.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Mission Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{info.missionTitle || 'Our Mission'}</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                {info.missionText}
            </p>
        </div>

        {/* Vision Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{info.visionTitle || 'Our Vision'}</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                {info.visionText}
            </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-4 text-center tracking-tight">Connect With Us</h2>
        <p className="text-center text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
            Have questions, feedback, or want to contribute lyrics? Reach out through any of our channels below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href={`mailto:${info.email}`} className="flex flex-col items-center p-8 bg-slate-50 rounded-3xl hover:bg-red-50 transition-all duration-300 border border-transparent hover:border-red-100 group">
                <div className="w-14 h-14 bg-white text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <Mail className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Email Us</h3>
                <p className="text-xs text-slate-400 font-bold break-all text-center">{info.email}</p>
            </a>

            <a href={`https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-8 bg-slate-50 rounded-3xl hover:bg-emerald-50 transition-all duration-300 border border-transparent hover:border-emerald-100 group">
                <div className="w-14 h-14 bg-white text-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <MessageCircle className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">WhatsApp</h3>
                <p className="text-xs text-slate-400 font-bold text-center">{info.whatsapp}</p>
            </a>

            <a href={info.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-8 bg-slate-50 rounded-3xl hover:bg-blue-50 transition-all duration-300 border border-transparent hover:border-blue-100 group">
                <div className="w-14 h-14 bg-white text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Facebook className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Facebook</h3>
                <p className="text-xs text-slate-400 font-bold text-center">SansarPlus Official</p>
            </a>
        </div>
      </div>

      {/* Footer Branding Box */}
      <div className="bg-slate-900 text-white rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
         <div className="relative z-10 space-y-6">
             <div className="inline-flex p-4 bg-white/10 rounded-3xl text-indigo-300 backdrop-blur-sm shadow-xl">
                <Music2 className="w-10 h-10" />
             </div>
             <h3 className="text-3xl font-black tracking-tight">{info.footerTitle || 'A Free Library for Everyone'}</h3>
             <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed whitespace-pre-wrap font-light">
                {info.footerText}
             </p>
         </div>
      </div>
    </div>
  );
};

export default ContactPage;
