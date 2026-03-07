const bcrypt = require('bcryptjs');
const Joi = require('joi');
const pool = require('../config/db');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { username, email, password } = value;
    const existing = await pool.query('SELECT id FROM users WHERE email=$1 OR username=$2', [email, username]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email or username already taken' });
    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3) RETURNING id,username,email,avatar,bio,created_at',
      [username, email, password_hash]
    );
    const user = result.rows[0];
    const accessToken = signAccessToken({ id: user.id, email: user.email, username: user.username });
    const refreshToken = signRefreshToken({ id: user.id });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, refreshToken, expiresAt]);
    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { email, password } = value;
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken = signAccessToken({ id: user.id, email: user.email, username: user.username });
    const refreshToken = signRefreshToken({ id: user.id });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, refreshToken, expiresAt]);
    const { password_hash, ...userSafe } = user;
    res.json({ user: userSafe, accessToken, refreshToken });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    let decoded;
    try { decoded = verifyRefreshToken(refreshToken); } catch { return res.status(401).json({ error: 'Invalid refresh token' }); }
    const stored = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token=$1 AND user_id=$2 AND expires_at > NOW()',
      [refreshToken, decoded.id]
    );
    if (stored.rows.length === 0) return res.status(401).json({ error: 'Refresh token not found or expired' });
    await pool.query('DELETE FROM refresh_tokens WHERE token=$1', [refreshToken]);
    const userResult = await pool.query('SELECT id,email,username FROM users WHERE id=$1', [decoded.id]);
    const user = userResult.rows[0];
    const newAccessToken = signAccessToken({ id: user.id, email: user.email, username: user.username });
    const newRefreshToken = signRefreshToken({ id: user.id });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, newRefreshToken, expiresAt]);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await pool.query('DELETE FROM refresh_tokens WHERE token=$1', [refreshToken]);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const result = await pool.query('SELECT id,username,email,avatar,bio,created_at FROM users WHERE id=$1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { register, login, refresh, logout, me };
