const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { addActivity, updateActivity, deleteActivity, reorderActivity } = require('../controllers/activityController');
router.use(auth);
router.post('/', addActivity);
module.exports = router;

const standaloneRouter = require('express').Router();
standaloneRouter.use(auth);
standaloneRouter.put('/:id', updateActivity);
standaloneRouter.delete('/:id', deleteActivity);
standaloneRouter.patch('/:id/reorder', reorderActivity);
module.exports.standaloneRouter = standaloneRouter;
