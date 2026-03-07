import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Download, Map as MapIcon, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getItinerary } from '../api/itinerary';
import { getTrip } from '../api/trips';
import DayCard from '../components/Itinerary/DayCard';
import TripMap from '../components/Map/TripMap';
import { useSocket } from '../hooks/useSocket';

export default function ItineraryPage() {
  const { id: tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [presence, setPresence] = useState([]);
  const printRef = useRef();

  const canEdit = ['owner','editor'].includes(trip?.my_role);
  const allActivities = itinerary?.days?.flatMap((d) => d.activities || []) || [];

  const { emit } = useSocket(tripId, {
    activity_added: (data) => { if (data.tripId === tripId) setItinerary((p) => p ? { ...p, days: p.days.map((d) => d.day_index === data.dayIndex ? { ...d, activities: [...(d.activities||[]), data.activity] } : d) } : p); },
    activity_updated: (data) => { if (data.tripId === tripId) setItinerary((p) => p ? { ...p, days: p.days.map((d) => ({ ...d, activities: d.activities?.map((a) => a.id === data.activity.id ? data.activity : a) })) } : p); },
    activity_deleted: (data) => { if (data.tripId === tripId) setItinerary((p) => p ? { ...p, days: p.days.map((d) => ({ ...d, activities: d.activities?.filter((a) => a.id !== data.activityId) })) } : p); },
    user_presence: (data) => { if (data.tripId === tripId) setPresence(data.users); },
  });

  useEffect(() => {
    Promise.all([getTrip(tripId), getItinerary(tripId)])
      .then(([t, i]) => { setTrip(t.data); setItinerary(i.data); })
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleActivityAdded = (activity, dayIndex) => setItinerary((p) => ({ ...p, days: p.days.map((d) => d.day_index === dayIndex ? { ...d, activities: [...(d.activities||[]), activity] } : d) }));
  const handleActivityUpdated = (updated) => setItinerary((p) => ({ ...p, days: p.days.map((d) => ({ ...d, activities: d.activities?.map((a) => a.id === updated.id ? updated : a) })) }));
  const handleActivityDeleted = (activityId, dayIndex) => setItinerary((p) => ({ ...p, days: p.days.map((d) => d.day_index === dayIndex ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) } : d) }));

  const handleExport = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');
    const canvas = await html2canvas(printRef.current, { scale: 1.5, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${trip?.title || 'itinerary'}.pdf`);
  };

  if (loading) return <div className="flex justify-center items-center min-h-96"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">{trip?.title} — Itinerary</h1><p className="text-sm text-gray-500">{itinerary?.days?.length || 0} days</p></div>
        <div className="flex items-center gap-2">
          {presence.length > 0 && <div className="flex items-center gap-1"><Users size={14} className="text-gray-400" /><div className="flex -space-x-1">{presence.slice(0,5).map((u) => <div key={u.userId} title={u.username} className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{u.username?.[0]?.toUpperCase()}</div>)}</div></div>}
          <button onClick={() => setShowMap(!showMap)} className="btn-secondary text-sm"><MapIcon size={15} />{showMap ? 'Hide Map' : 'Show Map'}</button>
          <button onClick={handleExport} className="btn-secondary text-sm no-print"><Download size={15} />Export PDF</button>
        </div>
      </div>
      {showMap && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden"><TripMap activities={allActivities} /></motion.div>}
      <div ref={printRef} className="space-y-4">
        {itinerary?.days?.map((day) => <DayCard key={day.id} day={day} canEdit={canEdit} tripId={tripId} onActivityAdded={handleActivityAdded} onActivityUpdated={handleActivityUpdated} onActivityDeleted={handleActivityDeleted} socketEmit={emit} />)}
      </div>
    </div>
  );
}
