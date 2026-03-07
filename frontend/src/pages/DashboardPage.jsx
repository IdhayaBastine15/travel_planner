import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrips } from '../contexts/TripContext';
import { deleteTrip, duplicateTrip } from '../api/trips';
import TripCard from '../components/Trips/TripCard';
import CreateTripModal from '../components/Trips/CreateTripModal';

export default function DashboardPage() {
  const { trips, loading, fetchTrips, addTrip, removeTrip } = useTrips();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip and all its data?')) return;
    try { await deleteTrip(id); removeTrip(id); } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  const handleDuplicate = async (id) => {
    try { const res = await duplicateTrip(id); addTrip(res.data); } catch (err) { alert(err.response?.data?.error || 'Failed to duplicate'); }
  };

  const filtered = trips.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-gray-900">My Trips</h1><p className="text-gray-500 text-sm">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p></div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={18} />New Trip</button>
      </div>
      <div className="relative mb-6"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trips..." className="input pl-9" /></div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-400">
          {search ? <p>No trips match your search.</p> : <div><p className="text-lg font-medium mb-2">No trips yet!</p><button onClick={() => setModalOpen(true)} className="btn-primary mt-2"><Plus size={16} />Create a trip</button></div>}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={handleDelete} onDuplicate={handleDuplicate} />)}
        </div>
      )}
      <CreateTripModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={addTrip} />
    </div>
  );
}
