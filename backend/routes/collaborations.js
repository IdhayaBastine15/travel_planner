const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getCollaborators, inviteCollaborator, changeRole, removeCollaborator } = require('../controllers/collaborationController');
router.use(auth);
router.get('/', getCollaborators);
router.post('/invite', inviteCollaborator);
router.patch('/:userId', changeRole);
router.delete('/:userId', removeCollaborator);
module.exports = router;
