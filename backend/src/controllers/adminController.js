const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.role) {
    query.role = req.query.role;
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    users,
    pagination: {
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    }
  });
});

const getAllJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }

  const jobs = await Job.find(query)
    .populate('recruiter', 'name email')
    .sort({ createdAt: -1 })
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

const getStats = asyncHandler(async (req, res) => {
  const [userCount, jobCount, applicationCount, candidates, recruiters, publishedJobs] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments({ status: 'published' })
  ]);

  res.json({
    success: true,
    stats: {
      users: userCount,
      candidates,
      recruiters,
      jobs: jobCount,
      publishedJobs,
      applications: applicationCount
    }
  });
});

module.exports = {
  getUsers,
  getAllJobs,
  getStats
};
