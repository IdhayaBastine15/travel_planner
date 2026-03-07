const router = require('express').Router();
const auth = require('../middleware/auth');
const { getFavorites, addFavorite, deleteFavorite } = require('../controllers/favoriteController');
router.use(auth);
router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:id', deleteFavorite);
module.exports = router;
