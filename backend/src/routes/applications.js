const express = require('express');
const {
  applyJob,
  getApplications,
  getApplicationCount,
  getJobState,
  cancelApplication,
  analyzeApplication,
  getJobApplications,
  updateApplicationStatus,
  saveJob,
  getSavedJobs
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { applyRules, statusRules, mongoIdParam } = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.post('/', authorize('candidate'), applyRules, validate, applyJob);
router.post('/:jobId/apply', authorize('candidate'), mongoIdParam('jobId'), validate, applyJob);
router.get('/', getApplications);
router.get('/count', authorize('candidate'), getApplicationCount);
router.get('/job-state/:jobId', authorize('candidate'), mongoIdParam('jobId'), validate, getJobState);
router.post('/:id/analyze', authorize('candidate'), mongoIdParam('id'), validate, analyzeApplication);
router.delete('/:id', authorize('candidate'), mongoIdParam('id'), validate, cancelApplication);
router.get('/saved', authorize('candidate'), getSavedJobs);
router.post('/saved', authorize('candidate'), applyRules, validate, saveJob);
router.post('/saved/:jobId', authorize('candidate'), mongoIdParam('jobId'), validate, saveJob);
router.get('/job/:jobId', authorize('recruiter', 'admin'), mongoIdParam('jobId'), validate, getJobApplications);
router.patch('/:id/status', authorize('recruiter', 'admin'), statusRules, validate, updateApplicationStatus);

module.exports = router;
