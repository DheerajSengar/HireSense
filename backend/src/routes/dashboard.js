const express = require('express');
const {
  getDashboard,
  getCandidateDashboard,
  getRecruiterDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getDashboard);
router.get('/candidate', authorize('candidate'), getCandidateDashboard);
router.get('/recruiter', authorize('recruiter', 'admin'), getRecruiterDashboard);

module.exports = router;
