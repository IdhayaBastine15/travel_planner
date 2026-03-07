const pool = require('../config/db');

async function addActivity(req, res, next) {
  try {
    const { id: tripId, dayIndex } = req.params;
    const access = await pool.query(
      "SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role IN ('owner','editor')",
      [tripId, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    const itin = await pool.query('SELECT id FROM itineraries WHERE trip_id=$1', [tripId]);
    if (itin.rows.length === 0) return res.status(404).json({ error: 'Itinerary not found' });
    const itineraryId = itin.rows[0].id;
    const { title, start_time, end_time, notes, cost, location_name, lat, lng, place_id, category } = req.body;
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX(order_index),-1)+1 as next_order FROM activities WHERE itinerary_id=$1 AND day_index=$2',
      [itineraryId, dayIndex]
    );
    const result = await pool.query(
      `INSERT INTO activities (itinerary_id,day_index,title,start_time,end_time,notes,cost,location_name,lat,lng,place_id,category,order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [itineraryId, dayIndex, title, start_time||null, end_time||null, notes||null, cost||0, location_name||null, lat||null, lng||null, place_id||null, category||'other', orderResult.rows[0].next_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function updateActivity(req, res, next) {
  try {
    const actResult = await pool.query(
      'SELECT a.*,it.trip_id FROM activities a JOIN itineraries it ON it.id=a.itinerary_id WHERE a.id=$1',
      [req.params.id]
    );
    if (actResult.rows.length === 0) return res.status(404).json({ error: 'Activity not found' });
    const access = await pool.query(
      "SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role IN ('owner','editor')",
      [actResult.rows[0].trip_id, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    const { title, start_time, end_time, notes, cost, location_name, lat, lng, place_id, category } = req.body;
    const result = await pool.query(
      `UPDATE activities SET
        title=COALESCE($1,title), start_time=COALESCE($2,start_time), end_time=COALESCE($3,end_time),
        notes=COALESCE($4,notes), cost=COALESCE($5,cost), location_name=COALESCE($6,location_name),
        lat=COALESCE($7,lat), lng=COALESCE($8,lng), place_id=COALESCE($9,place_id), category=COALESCE($10,category)
       WHERE id=$11 RETURNING *`,
      [title, start_time, end_time, notes, cost, location_name, lat, lng, place_id, category, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function deleteActivity(req, res, next) {
  try {
    const actResult = await pool.query(
      'SELECT it.trip_id FROM activities a JOIN itineraries it ON it.id=a.itinerary_id WHERE a.id=$1',
      [req.params.id]
    );
    if (actResult.rows.length === 0) return res.status(404).json({ error: 'Activity not found' });
    const access = await pool.query(
      "SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role IN ('owner','editor')",
      [actResult.rows[0].trip_id, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('DELETE FROM activities WHERE id=$1', [req.params.id]);
    res.json({ message: 'Activity deleted' });
  } catch (err) { next(err); }
}

async function reorderActivity(req, res, next) {
  try {
    const actResult = await pool.query(
      'SELECT it.trip_id FROM activities a JOIN itineraries it ON it.id=a.itinerary_id WHERE a.id=$1',
      [req.params.id]
    );
    if (actResult.rows.length === 0) return res.status(404).json({ error: 'Activity not found' });
    const access = await pool.query(
      "SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role IN ('owner','editor')",
      [actResult.rows[0].trip_id, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    const result = await pool.query('UPDATE activities SET order_index=$1 WHERE id=$2 RETURNING *', [req.body.order_index, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { addActivity, updateActivity, deleteActivity, reorderActivity };
