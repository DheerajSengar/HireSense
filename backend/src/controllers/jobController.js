const Job = require('../models/Job');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
    recruiter: req.user._id
  });

  res.status(201).json({
    success: true,
    job
  });
});

const getJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { status: 'published' };

  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  if (req.query.skills) {
    const skillsList = req.query.skills.split(',').map((s) => s.trim());
    query.skills = { $in: skillsList };
  }

  if (req.query.location) {
    query.location = { $regex: req.query.location, $options: 'i' };
  }

  if (req.query.workType) {
    query.workType = req.query.workType;
  }

  if (req.query.employmentType) {
    query.employmentType = req.query.employmentType;
  }

  if (req.query.experience) {
    query.experience = req.query.experience;
  }

  let sortOption = { createdAt: -1 };
  if (req.query.sort === 'oldest') sortOption = { createdAt: 1 };
  if (req.query.sort === 'salary') sortOption = { 'salary.max': -1 };
  if (req.query.sort === 'title') sortOption = { title: 1 };

  const jobs = await Job.find(query)
    .populate('recruiter', 'name email recruiterProfile')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const total = await Job.countDocuments(query);

  res.json({
    success: true,
    jobs,
    pagination: {
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    }
  });
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('recruiter', 'name email recruiterProfile');

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  job.views += 1;
  await job.save();

  res.json({
    success: true,
    job
  });
});

const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    job
  });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  await Application.deleteMany({ job: req.params.id });
  await job.deleteOne();

  res.json({
    success: true,
    message: 'Job deleted successfully'
  });
});

const publishJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  job.status = 'published';
  await job.save();

  res.json({ success: true, job });
});

const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  job.status = 'closed';
  await job.save();

  res.json({ success: true, job });
});

const getRecruiterJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    jobs
  });
});

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
  getRecruiterJobs
};
