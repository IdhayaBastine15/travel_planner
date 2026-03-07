import React, { useEffect, useState } from 'react';
import { Star, Trash2, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFavorites, deleteFavorite } from '../api/favorites';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFavorites()
      .then((r) => setFavorites(r.data))
      .catch(() => setError('Failed to load favorites'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this place from favorites?')) return;
    try {
      await deleteFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert('Failed to remove favorite');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <Loader2 size={32} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Star size={22} className="text-yellow-500 fill-yellow-400" />
        <h1 className="text-2xl font-bold text-gray-900">Favorite Places</h1>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      {favorites.length === 0 ? (
        <div className="card p-12 text-center">
          <Star size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No favorite places yet.</p>
          <p className="text-sm text-gray-400 mt-1">Save places from the map while planning your trips.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {favorites.map((fav) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center">
                    <MapPin size={16} className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{fav.place_name}</p>
                    {fav.lat && fav.lng && (
                      <p className="text-xs text-gray-400">{Number(fav.lat).toFixed(4)}, {Number(fav.lng).toFixed(4)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(fav.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
