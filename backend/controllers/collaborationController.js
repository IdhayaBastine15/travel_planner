const pool = require('../config/db');

async function getCollaborators(req, res, next) {
  try {
    const access = await pool.query('SELECT 1 FROM collaborations WHERE trip_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (access.rows.length === 0) return res.status(403).json({ error: 'Access denied' });
    const result = await pool.query(
      'SELECT c.role,u.id,u.username,u.email,u.avatar FROM collaborations c JOIN users u ON u.id=c.user_id WHERE c.trip_id=$1 ORDER BY c.role',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

async function inviteCollaborator(req, res, next) {
  try {
    const { id: tripId } = req.params;
    const { email, role } = req.body;
    const access = await pool.query("SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role='owner'", [tripId, req.user.id]);
    if (access.rows.length === 0) return res.status(403).json({ error: 'Only owner can invite' });
    const invitee = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (invitee.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const inviteeId = invitee.rows[0].id;
    if (inviteeId === req.user.id) return res.status(400).json({ error: 'Cannot invite yourself' });
    await pool.query(
      'INSERT INTO collaborations (trip_id,user_id,role) VALUES ($1,$2,$3) ON CONFLICT (trip_id,user_id) DO UPDATE SET role=$3',
      [tripId, inviteeId, role||'viewer']
    );
    res.json({ message: 'Collaborator invited' });
  } catch (err) { next(err); }
}

async function changeRole(req, res, next) {
  try {
    const { id: tripId, userId: targetUserId } = req.params;
    const access = await pool.query("SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role='owner'", [tripId, req.user.id]);
    if (access.rows.length === 0) return res.status(403).json({ error: 'Only owner can change roles' });
    if (targetUserId === req.user.id) return res.status(400).json({ error: 'Cannot change your own role' });
    const result = await pool.query('UPDATE collaborations SET role=$1 WHERE trip_id=$2 AND user_id=$3 RETURNING *', [req.body.role, tripId, targetUserId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Collaborator not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function removeCollaborator(req, res, next) {
  try {
    const { id: tripId, userId: targetUserId } = req.params;
    const access = await pool.query("SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role='owner'", [tripId, req.user.id]);
    if (access.rows.length === 0 && targetUserId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const target = await pool.query("SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role='owner'", [tripId, targetUserId]);
    if (target.rows.length > 0) return res.status(400).json({ error: 'Cannot remove the trip owner' });
    await pool.query('DELETE FROM collaborations WHERE trip_id=$1 AND user_id=$2', [tripId, targetUserId]);
    res.json({ message: 'Collaborator removed' });
  } catch (err) { next(err); }
}

module.exports = { getCollaborators, inviteCollaborator, changeRole, removeCollaborator };
