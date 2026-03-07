const router = require('express').Router();
const auth = require('../middleware/auth');
const { register, login, refresh, logout, me } = require('../controllers/authController');
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', auth, me);
module.exports = router;
