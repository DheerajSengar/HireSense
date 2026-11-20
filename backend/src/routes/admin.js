const express = require('express');
const { getUsers, getAllJobs, getStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.get('/jobs', getAllJobs);
router.get('/stats', getStats);

module.exports = router;
