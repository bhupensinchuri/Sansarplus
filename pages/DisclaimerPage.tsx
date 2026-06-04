import React from 'react';
import { ShieldAlert } from 'lucide-react';

const DisclaimerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Disclaimer</h1>
        </div>
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 prose prose-slate max-w-none">
          <h3 className="font-bold text-lg text-slate-900">1. Ownership and Copyright</h3>
          <p>All lyrics contained within SansarPlus are the property of their respective copyright owners. We do not own the lyrics hosted on this platform. This application serves as a digital repository and organizational tool for the benefit of the musical community.</p>

          <h3 className="font-bold text-lg text-slate-900">2. Purpose of the Collection</h3>
          <p>This collection is created for the sheer fun and pleasure of discovering the lyrics of various songs. It is intended to help users engage more deeply with the music they love and is not intended for any commercial use or financial profit.</p>

          <h3 className="font-bold text-lg text-slate-900">3. Permitted Use</h3>
          <p>The lyrics provided herein are meant to be used strictly for non-commercial purposes, including: For personal enjoyment, discovery, and memorization, For linguistic education or musical analysis, For use during worship and religious community gatherings.</p>

          <h3 className="font-bold text-lg text-slate-900">4. Fair Use and User Liability</h3>
          <p>These materials are made available for educational and personal purposes. If anyone makes use of these lyrics for purposes in excess of "fair use" (as defined by copyright law), they may be liable for copyright infringement. SansarPlus shall not be held responsible for any unauthorized or illegal use of the content by its users.</p>

          <h3 className="font-bold text-lg text-slate-900">5. Accuracy and Corrections</h3>
          <p>While we strive to provide accurate transcriptions in both Devanagari and Romanized scripts, SansarPlus does not guarantee that all content is 100% error-free. We welcome corrections from the community to help maintain the integrity of this vault.</p>

          <h3 className="font-bold text-lg text-slate-900">6. Removal Requests</h3>
          <p>We respect the intellectual property rights of all artists, songwriters, and publishers. If you are a copyright owner and wish to have your content removed from this app, please contact us directly, and we will honor your request promptly.</p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
