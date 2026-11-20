const express = require('express');
const { getJobMatch } = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { mongoIdParam } = require('../middleware/validators');

const router = express.Router();

router.get('/:jobId', protect, authorize('candidate'), mongoIdParam('jobId'), validate, getJobMatch);

module.exports = router;
