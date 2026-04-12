import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Loader2 } from 'lucide-react';

export default function LocationSearch({ value = '', onChange, placeholder = 'Search location...' }) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  // Sync external value changes (e.g. when editing an existing activity)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const search = (text) => {
    setQuery(text);
    clearTimeout(timer.current);
    if (!text.trim() || text.length < 2) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      if (!apiKey) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=6&apiKey=${apiKey}`
        );
        const data = await res.json();
        setResults(data.features || []);
        setOpen(true);
      } catch (_) {}
      finally { setLoading(false); }
    }, 300);
  };

  const select = (feature) => {
    const { formatted, lat, lon, place_id, country, city } = feature.properties;
    const bbox = feature.bbox;
    setQuery(formatted);
    setOpen(false);
    setResults([]);
    onChange({ name: formatted, lat, lng: lon, place_id, country, city, bbox });
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    onChange({ name: '', lat: null, lng: null, place_id: null, country: null, city: null, bbox: null });
  };

  // Fallback: no API key → plain text input
  if (!apiKey) {
    return (
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange({ name: e.target.value, lat: null, lng: null, place_id: null }); }}
        placeholder={placeholder}
        className="input"
      />
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="input pl-9 pr-8"
        />
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
        {!loading && query && (
          <button type="button" onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {results.map((f, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => select(f)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors"
            >
              <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate leading-tight">{f.properties.formatted}</p>
                {f.properties.country && f.properties.city && (
                  <p className="text-xs text-gray-400 mt-0.5">{f.properties.country}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
