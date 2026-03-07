const pool = require('../config/db');

async function getComments(req, res, next) {
  try {
    const { id: activityId } = req.params;
    const access = await pool.query(
      `SELECT 1 FROM collaborations c JOIN itineraries it ON it.trip_id=c.trip_id
       JOIN activities a ON a.itinerary_id=it.id WHERE a.id=$1 AND c.user_id=$2`,
      [activityId, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Access denied' });
    const result = await pool.query(
      'SELECT c.*,u.username,u.avatar FROM comments c JOIN users u ON u.id=c.user_id WHERE c.activity_id=$1 ORDER BY c.created_at ASC',
      [activityId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

async function addComment(req, res, next) {
  try {
    const { id: activityId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });
    const access = await pool.query(
      `SELECT 1 FROM collaborations c JOIN itineraries it ON it.trip_id=c.trip_id
       JOIN activities a ON a.itinerary_id=it.id WHERE a.id=$1 AND c.user_id=$2`,
      [activityId, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Access denied' });
    const result = await pool.query('INSERT INTO comments (activity_id,user_id,content) VALUES ($1,$2,$3) RETURNING *', [activityId, req.user.id, content.trim()]);
    const withUser = await pool.query('SELECT c.*,u.username,u.avatar FROM comments c JOIN users u ON u.id=c.user_id WHERE c.id=$1', [result.rows[0].id]);
    res.status(201).json(withUser.rows[0]);
  } catch (err) { next(err); }
}

async function deleteComment(req, res, next) {
  try {
    const result = await pool.query('DELETE FROM comments WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found or not authorized' });
    res.json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
}

module.exports = { getComments, addComment, deleteComment };
