const Job = require('../models/Job');
const User = require('../models/User');
const { buildCandidateText, calculateMatchScore, explainJobMatch } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getJobMatch = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const candidate = await User.findById(req.user._id);
  if (!candidate) throw new AppError('User not found', 404);
  if (!buildCandidateText(candidate).trim()) {
    return res.json({
      success: true,
      ready: false,
      message: 'Add skills, experience, projects, or a resume to get a personalized job match.'
    });
  }
  const match = await calculateMatchScore(candidate, job);
  let explanation;
  try {
    explanation = await explainJobMatch(candidate, job, match);
  } catch (error) {
    if (error.code === 'CONFIG') throw new AppError(error.message, 503);
    if (error.code === 'EMPTY_PROFILE') throw new AppError(error.message, 400);
    if (error.code === 'RATE_LIMIT') throw new AppError(error.message, 429);
    if (error.code === 'AUTH') throw new AppError(error.message, 502);
    console.error('Gemini job match explanation failed:', error.code || 'UNKNOWN');
    throw new AppError(error.message || 'AI job-match explanation is temporarily unavailable.', 502);
  }

  res.json({
    success: true,
    ready: true,
    job: {
      id: job._id,
      title: job.title,
      skills: job.skills
    },
    matchScore: match.score,
    matchDetails: {
      matchingSkills: match.matchingSkills,
      missingSkills: match.missingSkills,
      explanation,
      matchingMethod: match.method
    }
  });
});

module.exports = { getJobMatch };
