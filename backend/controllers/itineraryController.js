const pool = require('../config/db');

async function getItinerary(req, res, next) {
  try {
    const { id: tripId } = req.params;
    const access = await pool.query('SELECT 1 FROM collaborations WHERE trip_id=$1 AND user_id=$2', [tripId, req.user.id]);
    if (access.rows.length === 0) return res.status(403).json({ error: 'Access denied' });
    const itinResult = await pool.query('SELECT * FROM itineraries WHERE trip_id=$1', [tripId]);
    if (itinResult.rows.length === 0) return res.status(404).json({ error: 'Itinerary not found' });
    const itinerary = itinResult.rows[0];
    const days = await pool.query('SELECT * FROM itinerary_days WHERE itinerary_id=$1 ORDER BY day_index', [itinerary.id]);
    const activities = await pool.query(
      'SELECT * FROM activities WHERE itinerary_id=$1 ORDER BY day_index, order_index',
      [itinerary.id]
    );
    const daysWithActivities = days.rows.map((day) => ({
      ...day,
      activities: activities.rows.filter((a) => a.day_index === day.day_index),
    }));
    res.json({ ...itinerary, days: daysWithActivities });
  } catch (err) { next(err); }
}

async function updateDayNotes(req, res, next) {
  try {
    const { id: tripId, dayIndex } = req.params;
    const access = await pool.query(
      "SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role IN ('owner','editor')",
      [tripId, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    const itin = await pool.query('SELECT id FROM itineraries WHERE trip_id=$1', [tripId]);
    if (itin.rows.length === 0) return res.status(404).json({ error: 'Itinerary not found' });
    const result = await pool.query(
      'UPDATE itinerary_days SET notes=$1 WHERE itinerary_id=$2 AND day_index=$3 RETURNING *',
      [req.body.notes, itin.rows[0].id, dayIndex]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { getItinerary, updateDayNotes };
