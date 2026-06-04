import React, { useState, useRef } from 'react';
import { convertToNepali } from '../utils/nepaliConverter';
import { Copy, RefreshCw, Check, Keyboard, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';

const KEYBOARD_GROUPS = [
  {
    label: 'Vowels',
    chars: [
      { n: 'अ', r: 'a' }, { n: 'आ', r: 'aa' }, { n: 'इ', r: 'i' }, { n: 'ई', r: 'ee' },
      { n: 'उ', r: 'u' }, { n: 'ऊ', r: 'oo' }, { n: 'ए', r: 'e' }, { n: 'ऐ', r: 'ai' },
      { n: 'ओ', r: 'o' }, { n: 'औ', r: 'au' }, { n: 'अं', r: 'am' }, { n: 'अँ', r: 'an' }
    ]
  },
  {
    label: 'Matras (Signs)',
    chars: [
      { n: 'ा', r: 'aa' }, { n: 'ि', r: 'i' }, { n: 'ी', r: 'ee' }, { n: 'ु', r: 'u' },
      { n: 'ू', r: 'oo' }, { n: 'े', r: 'e' }, { n: 'ै', r: 'ai' }, { n: 'ो', r: 'o' },
      { n: 'ौ', r: 'au' }, { n: 'ं', r: 'am' }, { n: 'ँ', r: 'an' }, { n: 'ृ', r: 'ri' }
    ]
  },
  {
    label: 'Consonants (क-ङ)',
    chars: [
      { n: 'क', r: 'k' }, { n: 'ख', r: 'kh' }, { n: 'ग', r: 'g' }, { n: 'घ', r: 'gh' }, { n: 'ङ', r: 'ng' }
    ]
  },
  {
    label: 'Consonants (च-ञ)',
    chars: [
      { n: 'च', r: 'ch' }, { n: 'छ', r: 'chh' }, { n: 'ज', r: 'j' }, { n: 'झ', r: 'jh' }, { n: 'ञ', r: 'yn' }
    ]
  },
  {
    label: 'Consonants (ट-ण)',
    chars: [
      { n: 'ट', r: 'T' }, { n: 'ठ', r: 'Th' }, { n: 'ड', r: 'D' }, { n: 'ढ', r: 'Dh' }, { n: 'ण', r: 'N' }
    ]
  },
  {
    label: 'Consonants (त-न)',
    chars: [
      { n: 'त', r: 't' }, { n: 'थ', r: 'th' }, { n: 'द', r: 'd' }, { n: 'ध', r: 'dh' }, { n: 'न', r: 'n' }
    ]
  },
  {
    label: 'Consonants (प-म)',
    chars: [
      { n: 'प', r: 'p' }, { n: 'फ', r: 'ph' }, { n: 'ब', r: 'b' }, { n: 'भ', r: 'bh' }, { n: 'म', r: 'm' }
    ]
  },
  {
    label: 'Consonants (य-ह)',
    chars: [
      { n: 'य', r: 'y' }, { n: 'र', r: 'r' }, { n: 'ल', r: 'l' }, { n: 'व', r: 'v' },
      { n: 'श', r: 'sh' }, { n: 'ष', r: 'S' }, { n: 'स', r: 's' }, { n: 'ह', r: 'h' }
    ]
  },
  {
    label: 'Special / Compound',
    chars: [
      { n: 'क्ष', r: 'ksh' }, { n: 'त्र', r: 'tr' }, { n: 'ज्ञ', r: 'gy' }, { n: '।', r: '|' }
    ]
  },
  {
    label: 'Numbers',
    chars: [
      { n: '०', r: '0' }, { n: '१', r: '1' }, { n: '२', r: '2' }, { n: '३', r: '3' }, { n: '४', r: '4' },
      { n: '५', r: '5' }, { n: '६', r: '6' }, { n: '७', r: '7' }, { n: '८', r: '8' }, { n: '९', r: '9' }
    ]
  }
];

const TypeNepaliPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (val: string) => {
    setInput(val);
    const converted = convertToNepali(val);
    setOutput(converted);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleKeyClick = (roman: string) => {
    const newVal = input + roman;
    handleInputChange(newVal);
    // Maintain focus for easier typing/clicking mix
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
              <Keyboard className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Type in Nepali</h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Phonetic Converter & Virtual Keyboard</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
                onClick={handleClear}
                className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 px-4 py-2 bg-white border border-slate-200 rounded-xl transition-all flex items-center gap-2 hover:bg-red-50 hover:border-red-100"
            >
                <RefreshCw className="w-3 h-3" /> Clear
            </button>
            <button 
                onClick={handleCopy}
                className={`text-[10px] md:text-xs font-black uppercase tracking-widest px-5 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 ${
                    copied 
                    ? 'bg-emerald-500 text-white border border-emerald-500' 
                    : 'bg-primary text-white border border-primary hover:bg-primary/90'
                }`}
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Results'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Areas */}
        <div className="lg:col-span-7 space-y-6">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
              <div className="flex items-center justify-between px-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Type in Romanized English
                  </label>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded">Real-time Conversion</span>
              </div>
              <textarea
                ref={inputRef}
                className="w-full h-44 p-6 rounded-3xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none text-xl font-mono text-slate-700 placeholder:text-slate-300 resize-none transition-all leading-relaxed"
                placeholder="e.g. prabhuu tapaaiilai dhanyabaad cha..."
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                autoFocus
              ></textarea>
            </div>

            {/* Divider */}
            <div className="flex justify-center -my-4 relative z-10">
                <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 text-primary">
                    <ArrowDown className="w-6 h-6 animate-bounce" />
                </div>
            </div>

            {/* Output Section */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Nepali Unicode Output
                </label>
                <button onClick={handleCopy} className="text-[10px] font-bold text-primary hover:underline">One-click Copy</button>
              </div>
              <textarea
                readOnly
                className="w-full h-52 p-6 rounded-3xl border-2 border-slate-50 bg-slate-50/50 text-2xl md:text-3xl text-slate-900 resize-none font-sans leading-[1.8] focus:outline-none"
                value={output}
                placeholder="प्रभु तपाईंलाई धन्यवाद छ..."
              ></textarea>
            </div>

            {/* Tips/Legend */}
            <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                <h4 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 text-indigo-300">
                    <InfoIcon className="w-4 h-4" /> Typing Shortcuts
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { r: 'aa', n: 'आ' }, { r: 'T', n: 'ट' }, 
                        { r: 'D', n: 'ड' }, { r: 'N', n: 'ण' },
                        { r: 'sh', n: 'श' }, { r: 'S', n: 'ष' },
                        { r: 'ri', n: 'ऋ' }, { r: '|', n: '।' }
                    ].map(tip => (
                        <div key={tip.r} className="flex items-center justify-between bg-white/5 border border-white/10 p-2.5 rounded-xl">
                            <span className="font-mono text-indigo-200 text-sm">{tip.r}</span>
                            <span className="font-bold text-white text-lg">→ {tip.n}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Visual Keyboard */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <button 
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Keyboard className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Visual Keyboard</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Click characters to insert</p>
                        </div>
                    </div>
                    {showKeyboard ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {showKeyboard && (
                    <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar animate-in slide-in-from-top-4">
                        {KEYBOARD_GROUPS.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-3">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{group.label}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {group.chars.map((char, cIdx) => (
                                        <button
                                            key={cIdx}
                                            onClick={() => handleKeyClick(char.r)}
                                            className="group relative w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:border-primary hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                                        >
                                            <span className="text-lg font-bold">{char.n}</span>
                                            {/* Tooltip hint */}
                                            <span className="absolute -top-1 -right-1 bg-slate-100 text-slate-500 text-[8px] font-black px-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity uppercase border border-slate-200 group-hover:text-primary group-hover:border-primary/20">
                                                {char.r}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Visual Accent */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <Keyboard className="w-12 h-12 text-white/20 mb-6" />
                <h4 className="text-xl font-black mb-2 tracking-tight">Need Chords?</h4>
                <p className="text-indigo-100 text-sm leading-relaxed font-medium">Use this tool to type song lyrics in native script, then add them to our database with chords for others to use.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

const InfoIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default TypeNepaliPage;