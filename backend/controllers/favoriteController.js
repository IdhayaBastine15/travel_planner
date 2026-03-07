const pool = require('../config/db');

async function getFavorites(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM favorite_places WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
}

async function addFavorite(req, res, next) {
  try {
    const { place_name, lat, lng, place_id } = req.body;
    const result = await pool.query(
      'INSERT INTO favorite_places (user_id,place_name,lat,lng,place_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, place_name, lat||null, lng||null, place_id||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function deleteFavorite(req, res, next) {
  try {
    const result = await pool.query('DELETE FROM favorite_places WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Favorite not found' });
    res.json({ message: 'Removed from favorites' });
  } catch (err) { next(err); }
}

module.exports = { getFavorites, addFavorite, deleteFavorite };
