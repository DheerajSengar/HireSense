const Application = require('../models/Application');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const User = require('../models/User');
const { analyzeApplicationMatch, calculateMatchScore } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const presentApplicationStatus = (status) => {
  if (status === 'pending' || status === 'reviewed') return 'Applied';
  if (status === 'shortlisted') return 'Shortlisted';
  if (status === 'rejected') return 'Rejected';
  if (status === 'hired') return 'Selected';
  return status;
};

const applyJob = asyncHandler(async (req, res) => {
  const jobId = req.body.jobId || req.params.jobId;
  const { coverLetter } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.status !== 'published') {
    throw new AppError('This job is not accepting applications', 400);
  }

  const existingApplication = await Application.exists({ job: jobId, candidate: req.user._id });
  if (existingApplication) {
    throw new AppError('Already applied to this job', 409);
  }

  const candidate = await User.findById(req.user._id);
  if (!candidate) throw new AppError('User not found', 404);
  const matchResult = await calculateMatchScore(candidate, job);
  let application;
  try {
    application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      recruiter: job.recruiter,
      coverLetter,
      status: 'Applied',
      matchScore: matchResult.score,
      matchDetails: {
        matchingSkills: matchResult.matchingSkills,
        missingSkills: matchResult.missingSkills,
        explanation: matchResult.explanation
      }
    });
    const updateResult = await Job.updateOne({ _id: job._id }, { $addToSet: { applications: application._id } });
    if (!updateResult.matchedCount) throw new AppError('Job not found', 404);
  } catch (error) {
    if (application) await application.deleteOne();
    if (error.code === 11000) {
      throw new AppError('Already applied to this job', 409);
    }
    throw error;
  }

  res.status(201).json({
    success: true,
    application
  });
});

const getApplications = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'recruiter' || req.user.role === 'admin'
      ? { recruiter: req.user._id }
      : { candidate: req.user._id };

  const applications = await Application.find(filter)
    .populate({
      path: 'job',
      select: 'title location salary workType employmentType status recruiter',
      populate: { path: 'recruiter', select: 'name recruiterProfile.company' }
    })
    .populate('candidate', 'name email candidateProfile')
    .populate('recruiter', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    applications: applications.map((application) => {
      const data = application.toObject();
      data.canCancel = req.user.role === 'candidate' && ['Applied', 'pending'].includes(data.status);
      data.status = presentApplicationStatus(data.status);
      return data;
    })
  });
});

const getApplicationCount = asyncHandler(async (req, res) => {
  const count = await Application.countDocuments({ candidate: req.user._id });
  res.json({ success: true, count });
});

const getJobState = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;
  const [application, saved] = await Promise.all([
    Application.findOne({ job: jobId, candidate: req.user._id }).select('_id'),
    SavedJob.exists({ job: jobId, candidate: req.user._id })
  ]);
  res.json({
    success: true,
    applied: Boolean(application),
    applicationId: application?._id || null,
    saved: Boolean(saved)
  });
});

const cancelApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    candidate: req.user._id
  });
  if (!application) throw new AppError('Application not found', 404);
  if (!['Applied', 'pending'].includes(application.status)) {
    throw new AppError('Only applications that have not progressed beyond Applied can be cancelled.', 400);
  }

  await Promise.all([
    application.deleteOne(),
    Job.updateOne({ _id: application.job }, { $pull: { applications: application._id } })
  ]);
  res.json({ success: true, message: 'Application cancelled.' });
});

const analyzeApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    candidate: req.user._id
  }).populate({
    path: 'job',
    populate: { path: 'recruiter', select: 'name recruiterProfile.company' }
  });
  if (!application || !application.job) throw new AppError('Application or job not found', 404);
  const candidate = await User.findById(req.user._id);
  if (!candidate) throw new AppError('User not found', 404);

  try {
    application.aiAnalysis = await analyzeApplicationMatch(candidate, application.job);
    await application.save();
  } catch (error) {
    if (error.code === 'CONFIG') throw new AppError(error.message, 503);
    if (error.code === 'EMPTY_PROFILE') throw new AppError(error.message, 400);
    if (error.code === 'RATE_LIMIT') throw new AppError(error.message, 429);
    if (error.code === 'AUTH') throw new AppError(error.message, 502);
    console.error('AI application analysis failed:', error.code || 'UNKNOWN');
    throw new AppError(error.message || 'AI application analysis is temporarily unavailable.', 502);
  }

  res.json({ success: true, analysis: application.aiAnalysis });
});

const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate('candidate', 'name email candidateProfile')
    .sort({ matchScore: -1, createdAt: -1 });

  res.json({
    success: true,
    applications: applications.map((application) => {
      const data = application.toObject();
      data.status = presentApplicationStatus(data.status);
      return data;
    })
  });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const application = await Application.findById(req.params.id);
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const job = await Job.findById(application.job);
  if (!job) throw new AppError('Job not found', 404);
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  application.status = status;
  await application.save();

  res.json({
    success: true,
    application
  });
});

const saveJob = asyncHandler(async (req, res) => {
  const jobId = req.body.jobId || req.params.jobId;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const existing = await SavedJob.findOne({
    job: jobId,
    candidate: req.user._id
  });

  if (existing) {
    await existing.deleteOne();
    return res.json({
      success: true,
      saved: false,
      message: 'Job removed from saved list'
    });
  }

  await SavedJob.create({
    job: jobId,
    candidate: req.user._id
  });

  res.status(201).json({
    success: true,
    saved: true,
    message: 'Job saved successfully'
  });
});

const getSavedJobs = asyncHandler(async (req, res) => {
  const savedJobs = await SavedJob.find({ candidate: req.user._id })
    .populate('job')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    savedJobs
  });
});

module.exports = {
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
};
