
import React from 'react';
import { Target, Eye, Music2, Mail, MessageCircle, Facebook } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">About SansarPlus</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          We are dedicated to serving the Nepali Christian community through the power of digital worship resources.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Mission Card */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
                To connect Nepali Christians globally through music by preserving our rich lyrical heritage. We strive to make worship accessible to everyone, everywhere, fostering spiritual growth and community through a unified digital platform.
            </p>
        </div>

        {/* Vision Card */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
                To become the most comprehensive and trusted digital resource for Nepali Christian worship. We envision a future where every believer has instant access to the songs, hymns, and resources they need to praise God in spirit and in truth.
            </p>
        </div>
      </div>

      {/* Contact / Requests Section */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Get in Touch / Request Songs</h2>
        <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
            If you want to request a song or send lyrics to be added to our library, please contact us using the methods below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email */}
            <a href="mailto:contactsansarplus@gmail.com" className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100 group">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Email Us</h3>
                <p className="text-sm text-slate-500 break-all text-center">contactsansarplus@gmail.com</p>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/13302856420" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100 group">
                <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">WhatsApp</h3>
                <p className="text-sm text-slate-500">+1 330-285-6420</p>
            </a>

            {/* Facebook */}
            <a href="https://www.facebook.com/mysansarplus" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100 group">
                <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Facebook className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Facebook</h3>
                <p className="text-sm text-slate-500">SansarPlus Official</p>
            </a>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
         </div>
         <div className="relative z-10">
             <div className="inline-flex p-3 bg-white/10 rounded-full mb-6 text-indigo-300">
                <Music2 className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-bold mb-4">A Free Library for Everyone</h3>
             <p className="text-slate-300 max-w-2xl mx-auto mb-8">
                SansarPlus is and will always remain a free resource. Your support and prayers help us maintain and expand this library for generations to come.
             </p>
         </div>
      </div>
    </div>
  );
};

export default ContactPage;
