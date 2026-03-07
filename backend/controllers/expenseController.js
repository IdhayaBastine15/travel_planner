const pool = require('../config/db');

async function getExpenses(req, res, next) {
  try {
    const { id: tripId } = req.params;
    const access = await pool.query('SELECT 1 FROM collaborations WHERE trip_id=$1 AND user_id=$2', [tripId, req.user.id]);
    if (access.rows.length === 0) return res.status(403).json({ error: 'Access denied' });
    const expenses = await pool.query(
      'SELECT e.*,u.username FROM expenses e JOIN users u ON u.id=e.user_id WHERE e.trip_id=$1 ORDER BY e.date DESC,e.created_at DESC',
      [tripId]
    );
    const totals = await pool.query('SELECT category,SUM(amount) as total FROM expenses WHERE trip_id=$1 GROUP BY category', [tripId]);
    const grandTotal = await pool.query('SELECT COALESCE(SUM(amount),0) as grand_total FROM expenses WHERE trip_id=$1', [tripId]);
    res.json({ expenses: expenses.rows, totals_by_category: totals.rows, grand_total: parseFloat(grandTotal.rows[0].grand_total) });
  } catch (err) { next(err); }
}

async function addExpense(req, res, next) {
  try {
    const { id: tripId } = req.params;
    const access = await pool.query(
      "SELECT role FROM collaborations WHERE trip_id=$1 AND user_id=$2 AND role IN ('owner','editor')",
      [tripId, req.user.id]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    const { amount, category, date, description } = req.body;
    const result = await pool.query(
      'INSERT INTO expenses (trip_id,user_id,amount,category,date,description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [tripId, req.user.id, amount, category||'other', date, description||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function updateExpense(req, res, next) {
  try {
    const exp = await pool.query('SELECT * FROM expenses WHERE id=$1', [req.params.id]);
    if (exp.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    if (exp.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const { amount, category, date, description } = req.body;
    const result = await pool.query(
      'UPDATE expenses SET amount=COALESCE($1,amount),category=COALESCE($2,category),date=COALESCE($3,date),description=COALESCE($4,description) WHERE id=$5 RETURNING *',
      [amount, category, date, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function deleteExpense(req, res, next) {
  try {
    const exp = await pool.query('SELECT * FROM expenses WHERE id=$1', [req.params.id]);
    if (exp.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    if (exp.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('DELETE FROM expenses WHERE id=$1', [req.params.id]);
    res.json({ message: 'Expense deleted' });
  } catch (err) { next(err); }
}

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense };
