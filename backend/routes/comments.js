const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
router.use(auth);
router.get('/', getComments);
router.post('/', addComment);
module.exports = router;

const standaloneRouter = require('express').Router();
standaloneRouter.use(auth);
standaloneRouter.delete('/:id', deleteComment);
module.exports.standaloneRouter = standaloneRouter;
