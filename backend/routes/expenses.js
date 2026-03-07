const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
router.use(auth);
router.get('/', getExpenses);
router.post('/', addExpense);
module.exports = router;

const standaloneRouter = require('express').Router();
standaloneRouter.use(auth);
standaloneRouter.put('/:id', updateExpense);
standaloneRouter.delete('/:id', deleteExpense);
module.exports.standaloneRouter = standaloneRouter;
