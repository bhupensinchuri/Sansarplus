import React from 'react';
import { Mail, MessageSquare, MapPin } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <p className="text-slate-600">Have questions, suggestions, or just want to say hello? We'd love to hear from you!</p>
            
            <div className="flex items-center space-x-4 text-slate-700">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                </div>
                <span>support@sansarplus.com</span>
            </div>
             <div className="flex items-center space-x-4 text-slate-700">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span>Kathmandu, Nepal</span>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" /> Send Message
            </h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input type="text" className="w-full rounded-lg border border-slate-300 p-2.5 focus:border-primary focus:ring-primary focus:outline-none" placeholder="Your name" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" className="w-full rounded-lg border border-slate-300 p-2.5 focus:border-primary focus:ring-primary focus:outline-none" placeholder="you@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea rows={4} className="w-full rounded-lg border border-slate-300 p-2.5 focus:border-primary focus:ring-primary focus:outline-none" placeholder="How can we help?"></textarea>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors">
                    Send Message
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;