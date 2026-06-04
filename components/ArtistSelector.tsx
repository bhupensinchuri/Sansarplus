
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus } from 'lucide-react';

interface ArtistSelectorProps {
  selected: string[]; // We'll keep it as string[] but it can contain "Name (ID:123)" for duplicates
  onChange: (artists: string[]) => void;
  suggestions: { name: string; imageUrl?: string; bio?: string; id?: string | number }[];
  placeholder?: string;
  label?: string;
}

const ArtistSelector: React.FC<ArtistSelectorProps> = ({ 
  selected, 
  onChange, 
  suggestions, 
  placeholder = "Add artist...",
  label
}) => {
  const [input, setInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<{ name: string; imageUrl?: string; bio?: string; id?: string | number }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.trim()) {
      const lowerInput = input.toLowerCase();
      // Filter suggestions that contain the input AND are not already selected
      const filtered = suggestions.filter(s => {
        const nameMatch = s.name.toLowerCase().includes(lowerInput);
        const identifier = s.id ? `${s.name} (ID:${s.id})` : s.name;
        const isAlreadySelected = selected.includes(identifier) || selected.includes(s.name);
        return nameMatch && !isAlreadySelected;
      }).slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setFilteredSuggestions([]);
      setShowDropdown(false);
    }
  }, [input, suggestions, selected]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addArtist = (suggestion: { name: string; id?: string | number }) => {
    // If there are multiple artists with the same name in suggestions, we use the ID-based identifier
    const sameNameCount = suggestions.filter(s => s.name.toLowerCase() === suggestion.name.toLowerCase()).length;
    const identifier = (sameNameCount > 1 && suggestion.id) ? `${suggestion.name} (ID:${suggestion.id})` : suggestion.name;
    
    if (!selected.includes(identifier)) {
      onChange([...selected, identifier]);
    }
    setInput('');
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        const exactMatch = filteredSuggestions.find(s => s.name.toLowerCase() === input.trim().toLowerCase());
        if (exactMatch) {
          addArtist(exactMatch);
        } else {
          // Add as new artist name
          if (!selected.includes(input.trim())) {
            onChange([...selected, input.trim()]);
          }
          setInput('');
          setShowDropdown(false);
        }
      }
    } else if (e.key === 'Backspace' && !input && selected.length > 0) {
      removeArtist(selected[selected.length - 1]);
    }
  };

  const removeArtist = (identifier: string) => {
    onChange(selected.filter(item => item !== identifier));
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>}
      
      <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        {selected.map(artist => (
          <span key={artist} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-md font-medium border border-indigo-100">
            {artist}
            <button 
              type="button"
              onClick={() => removeArtist(artist)}
              className="text-indigo-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if(input) setShowDropdown(true); }}
          className="flex-1 min-w-[120px] outline-none text-sm p-1 text-slate-800 placeholder:text-slate-400"
          placeholder={selected.length === 0 ? placeholder : ""}
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addArtist(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
              >
                {suggestion.imageUrl ? (
                    <img src={suggestion.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Search className="w-4 h-4" />
                    </div>
                )}
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-700 text-sm truncate">{suggestion.name}</span>
                    {suggestion.bio && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{suggestion.bio}</span>
                    )}
                </div>
                {suggestion.id && (
                    <span className="ml-auto text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-mono">ID:{suggestion.id}</span>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
               <Plus className="w-4 h-4 text-primary" />
               <span>Add new artist: "<strong>{input}</strong>"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtistSelector;
