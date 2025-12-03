import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSongLyrics } from '../services/geminiService';
import { LyricsData } from '../types';
import Loader from '../components/Loader';
import { User, Heart, Music, PenTool, Copy, Check, ArrowRight, ZoomIn, ZoomOut, Flag, X } from 'lucide-react';
import { isFavorite, toggleFavorite, generateId } from '../utils/storage';

const LyricsPage: React.FC = () => {
  const { artist, song } = useParams<{ artist: string; song: string }>();
  const [data, setData] = useState<LyricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState<'nepali' | 'roman'>('nepali');
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default font size in px
  
  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('lyrics');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (artist && song) {
        setLoading(true);
        // Fetch Lyrics
        const result = await getSongLyrics(artist, song);
        setData(result);
        setIsFav(isFavorite(generateId('song', song, artist)));
        setLoading(false);
      }
    };
    fetchData();
  }, [artist, song]);

  const handleFavorite = () => {
    if (!data || !artist || !song) return;
    const item = {
        id: generateId('song', song, artist),
        type: 'song' as const,
        name: song,
        subtext: artist
    };
    const added = toggleFavorite(item);
    setIsFav(added);
  };

  const handleCopy = () => {
    if (!data) return;
    const textToCopy = activeTab === 'nepali' 
        ? (data.lyrics_nepali || data.lyrics || "") 
        : (data.lyrics_roman || "");
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 4, 48)); // Max 48px
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 2, 14)); // Min 14px
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
        setFeedbackSubmitted(true);
        setTimeout(() => {
            setFeedbackSubmitted(false);
            setIsFeedbackOpen(false);
            setFeedbackText('');
            setFeedbackType('lyrics');
        }, 2000);
    }, 500);
  };

  // Social Sharing Links
  const currentUrl = window.location.href;
  const shareTitle = `Check out "${song}" by ${artist} on SansarPlus`;
  
  const socialLinks = [
    {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`,
        color: 'hover:bg-[#25D366] hover:text-white text-[#25D366] bg-[#25D366]/10',
        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
    },
    {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        color: 'hover:bg-[#1877F2] hover:text-white text-[#1877F2] bg-[#1877F2]/10',
        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.411h3.085l-.005 3.633-3.08 3.667v7.98h-4.843Z"/></svg>
    },
    {
        name: 'X',
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentUrl)}`,
        color: 'hover:bg-black hover:text-white text-black bg-gray-100',
        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    },
  ];

  if (loading) return <Loader fullScreen text="Loading lyrics..." />;
  if (!data || !artist || !song) return <div className="text-slate-500 text-center pt-20">Lyrics not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header - Minimalist */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
          <div className="space-y-3 text-center md:text-left">
             <Link 
                to={`/artist/${encodeURIComponent(artist)}`} 
                className="inline-flex items-center text-primary font-bold tracking-wide uppercase text-xs md:text-sm hover:text-primary/80 transition-colors no-print"
             >
                <User className="w-4 h-4 mr-2" /> {artist}
             </Link>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">{song}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
         
         {/* 1. Lyrics (Main Content) */}
         <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-sm print:border-none print:p-0 print:shadow-none min-h-[400px]">
             
             {/* Quick Actions Toolbar inside Lyrics Card */}
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 no-print gap-4 sm:gap-0">
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('nepali')}
                      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'nepali' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Nepali
                    </button>
                    <button
                      onClick={() => setActiveTab('roman')}
                      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'roman' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Romanized
                    </button>
                </div>

                <div className="flex space-x-1 self-end sm:self-auto bg-slate-50 p-1 rounded-lg">
                    <button 
                        onClick={handleZoomOut}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                     <button 
                        onClick={handleZoomIn}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <div className="w-px bg-slate-200 mx-1 h-6 self-center"></div>
                    <button 
                        onClick={handleCopy}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copy Lyrics"
                    >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
             </div>

             <div 
                className="whitespace-pre-wrap font-sans leading-loose text-slate-700 tracking-wide lyrics-scroll"
                style={{ fontSize: `${fontSize}px` }}
             >
                 {activeTab === 'nepali' 
                    ? (data.lyrics_nepali || data.lyrics || "Lyrics available in Romanized version only.") 
                    : (data.lyrics_roman || "Romanized lyrics not available.")}
             </div>
             
             {/* Footer in lyrics card for print */}
             <div className="mt-8 pt-8 border-t border-slate-100 text-slate-400 text-sm hidden print-block">
                 <p>Generated by SansarPlus.com - Nepali Christian Lyrics</p>
             </div>
         </div>

         {/* 2. Song Credits */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm no-print">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Song Credits</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between group py-1 border-b border-slate-50 pb-2">
                    <div className="flex items-center text-slate-500">
                         <Music className="w-4 h-4 mr-2.5 text-slate-400" />
                         <span className="text-sm font-semibold">Composer</span>
                    </div>
                    <div className="text-right max-w-[50%] truncate">
                        {data.composer && data.composer !== "Unknown" ? (
                          <Link 
                            to={`/search/Songs by ${encodeURIComponent(data.composer)}`}
                            className="text-primary hover:text-primary/80 font-medium hover:underline transition-all text-sm"
                            title={`Search songs by ${data.composer}`}
                          >
                            {data.composer}
                          </Link>
                        ) : <span className="text-slate-400 text-sm italic">Unknown</span>}
                    </div>
                </div>
                 <div className="flex items-center justify-between group py-1">
                    <div className="flex items-center text-slate-500">
                         <PenTool className="w-4 h-4 mr-2.5 text-slate-400" />
                         <span className="text-sm font-semibold">Lyrics</span>
                    </div>
                    <div className="text-right max-w-[50%] truncate">
                         {data.lyricist && data.lyricist !== "Unknown" ? (
                          <Link 
                            to={`/search/Songs written by ${encodeURIComponent(data.lyricist)}`}
                            className="text-primary hover:text-primary/80 font-medium hover:underline transition-all text-sm"
                            title={`Search songs written by ${data.lyricist}`}
                          >
                            {data.lyricist}
                          </Link>
                        ) : <span className="text-slate-400 text-sm italic">Unknown</span>}
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Artist Navigation */}
         <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-1.5 rounded-2xl border border-indigo-50/50 shadow-sm no-print">
            <Link 
                to={`/artist/${encodeURIComponent(artist)}`}
                className="flex items-center justify-between w-full p-4 bg-white/60 hover:bg-white rounded-xl transition-all group"
            >
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">More from</p>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{artist}</p>
                    </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
        </div>

        {/* 4. Tools (Favorites, Share, Feedback) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
            <button 
                onClick={handleFavorite}
                className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-bold transition-all ${
                    isFav 
                    ? 'bg-red-50 text-red-500 border border-red-100 shadow-sm' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
            >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                <span>{isFav ? 'Saved to Favorites' : 'Add to Favorites'}</span>
            </button>

            {/* Social Share Row */}
            <div className="mt-5 pt-4 border-t border-slate-100">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Share to Socials</p>
                 <div className="flex justify-center gap-3">
                    {socialLinks.map((link) => (
                        <a 
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 ${link.color}`}
                            title={`Share on ${link.name}`}
                        >
                            {link.icon}
                        </a>
                    ))}
                 </div>
            </div>

            {/* Report Issue Button */}
            <div className="mt-6 text-center">
                <button 
                    onClick={() => setIsFeedbackOpen(true)}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center mx-auto space-x-1"
                >
                    <Flag className="w-3 h-3" />
                    <span>Report an issue with this song</span>
                </button>
            </div>
        </div>

      </div>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Report Issue</h3>
                    <button onClick={() => setIsFeedbackOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {feedbackSubmitted ? (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800">Thank You!</h4>
                        <p className="text-slate-500 text-sm mt-1">Your feedback has been received and will be reviewed.</p>
                    </div>
                ) : (
                    <form onSubmit={submitFeedback} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
                            <select 
                                value={feedbackType} 
                                onChange={(e) => setFeedbackType(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary outline-none"
                            >
                                <option value="lyrics">Wrong Lyrics</option>
                                <option value="credits">Wrong Credits</option>
                                <option value="typo">Typos / Formatting</option>
                                <option value="other">Other Suggestion</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                            <textarea 
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                rows={4} 
                                placeholder="Please describe the issue..."
                                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary outline-none resize-none"
                                required
                            ></textarea>
                        </div>
                        <div className="pt-2 flex space-x-3">
                            <button 
                                type="button" 
                                onClick={() => setIsFeedbackOpen(false)}
                                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                Submit Report
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default LyricsPage;
