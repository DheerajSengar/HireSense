const express = require('express');
const {
  uploadResume,
  updateCandidateProfile,
  getCandidateProfile,
  improveCandidateProfile,
  upload
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('candidate'));

router.get('/', getCandidateProfile);
router.put('/', updateCandidateProfile);
router.post('/improve', improveCandidateProfile);
router.post('/resume', upload.single('resume'), uploadResume);

module.exports = router;
