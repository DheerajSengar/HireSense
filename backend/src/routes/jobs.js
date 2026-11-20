const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
  getRecruiterJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { jobRules, mongoIdParam } = require('../middleware/validators');

const router = express.Router();

router.get('/', getJobs);
router.get('/recruiter/mine', protect, authorize('recruiter', 'admin'), getRecruiterJobs);
router.get('/:id', mongoIdParam('id'), validate, getJobById);

router.post('/', protect, authorize('recruiter', 'admin'), jobRules, validate, createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), mongoIdParam('id'), validate, updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), mongoIdParam('id'), validate, deleteJob);
router.patch('/:id/publish', protect, authorize('recruiter', 'admin'), mongoIdParam('id'), validate, publishJob);
router.patch('/:id/close', protect, authorize('recruiter', 'admin'), mongoIdParam('id'), validate, closeJob);

module.exports = router;
