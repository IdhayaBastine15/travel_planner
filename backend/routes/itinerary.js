const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getItinerary, updateDayNotes } = require('../controllers/itineraryController');
router.use(auth);
router.get('/', getItinerary);
router.patch('/days/:dayIndex/notes', updateDayNotes);
module.exports = router;
