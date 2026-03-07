const pool = require('../config/db');
const { getDateRange } = require('../utils/helpers');

async function getTrips(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT t.*, u.username as owner_username,
        CASE WHEN t.owner_id=$1 THEN 'owner' ELSE c.role END as my_role
       FROM trips t
       JOIN users u ON u.id=t.owner_id
       LEFT JOIN collaborations c ON c.trip_id=t.id AND c.user_id=$1
       WHERE t.owner_id=$1 OR c.user_id=$1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

async function createTrip(req, res, next) {
  const client = await pool.connect();
  try {
    const { title, destination, start_date, end_date, description, budget, status } = req.body;
    await client.query('BEGIN');
    const tripResult = await client.query(
      `INSERT INTO trips (title,destination,start_date,end_date,description,owner_id,budget,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, destination, start_date, end_date, description || null, req.user.id, budget || 0, status || 'draft']
    );
    const trip = tripResult.rows[0];
    await client.query('INSERT INTO collaborations (trip_id,user_id,role) VALUES ($1,$2,$3)', [trip.id, req.user.id, 'owner']);
    const itinResult = await client.query('INSERT INTO itineraries (trip_id) VALUES ($1) RETURNING *', [trip.id]);
    const dates = getDateRange(start_date, end_date);
    for (let i = 0; i < dates.length; i++) {
      await client.query('INSERT INTO itinerary_days (itinerary_id,day_index,date) VALUES ($1,$2,$3)',
        [itinResult.rows[0].id, i, dates[i].toISOString().split('T')[0]]);
    }
    await client.query('COMMIT');
    res.status(201).json(trip);
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
}

async function getTrip(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT t.*, u.username as owner_username,
        CASE WHEN t.owner_id=$2 THEN 'owner' ELSE c.role END as my_role
       FROM trips t
       JOIN users u ON u.id=t.owner_id
       LEFT JOIN collaborations c ON c.trip_id=t.id AND c.user_id=$2
       WHERE t.id=$1 AND (t.owner_id=$2 OR c.user_id=$2)`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function updateTrip(req, res, next) {
  try {
    const access = await pool.query('SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (access.rows.length === 0 || !['owner', 'editor'].includes(access.rows[0].role))
      return res.status(403).json({ error: 'Forbidden' });
    const { title, destination, start_date, end_date, description, budget, status, is_public } = req.body;
    const result = await pool.query(
      `UPDATE trips SET
        title=COALESCE($1,title), destination=COALESCE($2,destination),
        start_date=COALESCE($3,start_date), end_date=COALESCE($4,end_date),
        description=COALESCE($5,description), budget=COALESCE($6,budget),
        status=COALESCE($7,status), is_public=COALESCE($8,is_public)
       WHERE id=$9 RETURNING *`,
      [title, destination, start_date, end_date, description, budget, status, is_public, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function deleteTrip(req, res, next) {
  try {
    const trip = await pool.query('SELECT owner_id FROM trips WHERE id=$1', [req.params.id]);
    if (trip.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
    if (trip.rows[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Only owner can delete trip' });
    await pool.query('DELETE FROM trips WHERE id=$1', [req.params.id]);
    res.json({ message: 'Trip deleted' });
  } catch (err) { next(err); }
}

async function duplicateTrip(req, res, next) {
  const client = await pool.connect();
  try {
    const original = await client.query('SELECT * FROM trips WHERE id=$1', [req.params.id]);
    if (original.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
    const t = original.rows[0];
    await client.query('BEGIN');
    const newTrip = await client.query(
      `INSERT INTO trips (title,destination,start_date,end_date,description,owner_id,budget,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'draft') RETURNING *`,
      [`${t.title} (copy)`, t.destination, t.start_date, t.end_date, t.description, req.user.id, t.budget]
    );
    const trip = newTrip.rows[0];
    await client.query('INSERT INTO collaborations (trip_id,user_id,role) VALUES ($1,$2,$3)', [trip.id, req.user.id, 'owner']);
    const itinResult = await client.query('INSERT INTO itineraries (trip_id) VALUES ($1) RETURNING *', [trip.id]);
    const newItin = itinResult.rows[0];
    const oldItin = await client.query('SELECT * FROM itineraries WHERE trip_id=$1', [t.id]);
    if (oldItin.rows.length > 0) {
      const oldDays = await client.query('SELECT * FROM itinerary_days WHERE itinerary_id=$1 ORDER BY day_index', [oldItin.rows[0].id]);
      for (const day of oldDays.rows) {
        await client.query('INSERT INTO itinerary_days (itinerary_id,day_index,date,notes) VALUES ($1,$2,$3,$4)',
          [newItin.id, day.day_index, day.date, day.notes]);
        const acts = await client.query('SELECT * FROM activities WHERE itinerary_id=$1 AND day_index=$2 ORDER BY order_index', [oldItin.rows[0].id, day.day_index]);
        for (const act of acts.rows) {
          await client.query(
            `INSERT INTO activities (itinerary_id,day_index,title,start_time,end_time,notes,cost,location_name,lat,lng,place_id,category,order_index)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
            [newItin.id, act.day_index, act.title, act.start_time, act.end_time, act.notes, act.cost, act.location_name, act.lat, act.lng, act.place_id, act.category, act.order_index]
          );
        }
      }
    }
    await client.query('COMMIT');
    res.status(201).json(trip);
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
}

module.exports = { getTrips, createTrip, getTrip, updateTrip, deleteTrip, duplicateTrip };
