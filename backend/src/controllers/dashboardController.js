const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const {
  generateCareerInsights,
  getRecommendedJobs,
  hasGeminiKey,
  skillsOverlap
} = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { skillNames } = require('../utils/profileData');

const computeProfileCompletion = (user) => {
  const cp = user.candidateProfile || {};
  const sections = [
    { label: 'Name', complete: Boolean(user.name?.trim()), weight: 10 },
    { label: 'Contact details', complete: Boolean(user.profile?.phone || user.profile?.location), weight: 15 },
    { label: 'Skills', complete: Boolean(cp.skills?.length || cp.resume?.analysis?.skills?.length), weight: 20 },
    { label: 'Experience', complete: Boolean(cp.experience?.length || cp.resume?.analysis?.experience?.length), weight: 20 },
    { label: 'Education', complete: Boolean(cp.education?.length || cp.resume?.analysis?.education?.length), weight: 15 },
    { label: 'Projects', complete: Boolean(cp.projects?.length), weight: 10 },
    { label: 'Resume', complete: Boolean(cp.resume?.url), weight: 10 }
  ];
  return {
    percentage: sections.reduce((total, section) => total + (section.complete ? section.weight : 0), 0),
    completedSections: sections.filter((section) => section.complete).length,
    totalSections: sections.length,
    missingSections: sections.filter((section) => !section.complete).map((section) => section.label)
  };
};

const buildSkillFallbackRecommendations = (user, jobs) => {
  const candidateSkills = [
    ...skillNames(user.candidateProfile?.skills || []),
    ...(user.candidateProfile?.resume?.analysis?.skills || [])
  ];
  const results = jobs.map((job) => {
    const match = skillsOverlap(candidateSkills, job.skills || []);
    return {
      job,
      matchScore: match.score,
      matchingMethod: 'skill-overlap',
      matchDetails: {
        ...match,
        method: 'skill-overlap',
        explanation: `Skills-overlap estimate; ${match.matchingSkills.length} of ${(job.skills || []).length} listed skills match.`
      }
    };
  });
  return results.sort((left, right) => right.matchScore - left.matchScore).slice(0, 6);
};

const summarizeMissingSkills = (recommendations) => {
  const demand = new Map();
  recommendations.forEach(({ matchDetails }) => {
    (matchDetails.missingSkills || []).forEach((skill) => {
      const key = skill.trim();
      if (key) demand.set(key, (demand.get(key) || 0) + 1);
    });
  });
  return [...demand.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 6)
    .map(([skill, jobCount]) => ({ skill, jobCount }));
};

const dashboardApplicationStatus = (status) => {
  if (status === 'pending' || status === 'reviewed') return 'Applied';
  if (status === 'shortlisted') return 'Shortlisted';
  if (status === 'rejected') return 'Rejected';
  if (status === 'hired') return 'Selected';
  return status;
};

const buildCandidateDashboard = async (userId) => {
  const [user, applicationStatusRows, recentApplications, appliedJobIds] = await Promise.all([
    User.findById(userId).select('+candidateProfile.matchingEmbedding +candidateProfile.matchingEmbeddingHash'),
    Application.aggregate([
      { $match: { candidate: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Application.find({ candidate: userId })
      .populate('job', 'title location workType employmentType')
      .sort({ createdAt: -1 })
      .limit(8),
    Application.distinct('job', { candidate: userId })
  ]);
  if (!user) throw new AppError('User not found', 404);

  const publishedJobs = await Job.find({
    status: 'published',
    _id: { $nin: appliedJobIds }
  })
    .select('+embedding +embeddingHash')
    .populate('recruiter', 'name recruiterProfile.company')
    .sort({ createdAt: -1 })
    .limit(30);

  let recommendations = [];
  let matching = {
    status: hasGeminiKey() ? 'ready' : 'fallback',
    message: hasGeminiKey()
      ? ''
      : 'Gemini embeddings are not configured. Match percentages use listed skill overlap until GEMINI_API_KEY is set.'
  };
  const hasCareerData = Boolean(
    skillNames(user.candidateProfile?.skills || []).length
    || user.candidateProfile?.resume?.analysis?.skills?.length
    || user.candidateProfile?.experience?.length
    || user.candidateProfile?.projects?.length
    || user.candidateProfile?.resume?.analysis?.experience?.length
  );

  if (!hasCareerData) {
    matching = {
      status: 'needs_profile',
      message: 'Add skills, experience, projects, or a resume to get personalized job matches.'
    };
  } else {
    try {
      recommendations = await getRecommendedJobs(user, publishedJobs);
      if (hasGeminiKey() && recommendations.some((item) => item.matchingMethod !== 'gemini-embedding')) {
        matching = {
          status: 'degraded',
          message: 'Some Gemini embeddings could not be generated. Those match percentages use listed skill overlap.'
        };
      }
    } catch (error) {
      console.error('Dashboard embedding recommendations failed:', error.code || 'UNKNOWN');
      recommendations = await buildSkillFallbackRecommendations(user, publishedJobs);
      matching = {
        status: 'degraded',
        message: 'Gemini semantic matching is temporarily unavailable. Match percentages use listed skill overlap.'
      };
    }
  }

  let careerInsights = {
    status: 'unavailable',
    message: 'Add GEMINI_API_KEY to backend/.env to generate AI skill gaps and career suggestions.',
    topMissingSkills: [],
    careerSuggestions: [],
    summary: ''
  };
  if (!hasGeminiKey()) {
    careerInsights.topMissingSkills = summarizeMissingSkills(recommendations);
  } else if (!hasCareerData) {
    careerInsights.status = 'needs_profile';
    careerInsights.message = 'Add skills, experience, projects, or a resume to generate personalized career suggestions.';
  } else {
    try {
      const generated = await generateCareerInsights(user, recommendations);
      careerInsights = { status: 'ready', ...generated, message: '' };
    } catch (error) {
      console.error('Dashboard career insights failed:', error.code || 'UNKNOWN');
      careerInsights.status = error.code === 'CONFIG' ? 'unavailable' : 'error';
      careerInsights.message = error.message || 'Gemini career suggestions are temporarily unavailable.';
      careerInsights.topMissingSkills = summarizeMissingSkills(recommendations);
    }
  }

  const statusCounts = {
    Applied: 0,
    Shortlisted: 0,
    Interview: 0,
    Selected: 0,
    Rejected: 0
  };
  applicationStatusRows.forEach(({ _id, count }) => {
    const status = dashboardApplicationStatus(_id);
    if (Object.prototype.hasOwnProperty.call(statusCounts, status)) statusCounts[status] += count;
  });

  const resume = user.candidateProfile?.resume;
  return {
    profile: {
      completion: computeProfileCompletion(user),
      name: user.name
    },
    resume: {
      status: resume?.url ? 'uploaded' : 'missing',
      url: resume?.url || null,
      uploadedAt: resume?.uploadedAt || null,
      score: user.candidateProfile?.resumeScore ?? resume?.analysis?.score ?? null,
      analysisProvider: resume?.analysis?.provider || null,
      strengths: resume?.analysis?.strengths || [],
      improvements: resume?.analysis?.improvements || []
    },
    jobs: {
      matching,
      recommended: recommendations.map(({ job, matchScore, matchingMethod, matchDetails }) => ({
        job: {
          id: job._id,
          title: job.title,
          description: job.description,
          location: job.location,
          workType: job.workType,
          employmentType: job.employmentType,
          experience: job.experience,
          salary: job.salary,
          skills: job.skills,
          company: job.recruiter?.recruiterProfile?.company || job.recruiter?.name || 'Hiring team'
        },
        matchPercentage: matchScore,
        matchingMethod,
        matchingSkills: matchDetails.matchingSkills,
        missingSkills: matchDetails.missingSkills
      }))
    },
    applications: {
      total: Object.values(statusCounts).reduce((total, count) => total + count, 0),
      statusCounts,
      recent: recentApplications.map((application) => ({
        id: application._id,
        status: dashboardApplicationStatus(application.status),
        appliedAt: application.createdAt,
        job: application.job ? {
          id: application.job._id,
          title: application.job.title,
          location: application.job.location
        } : null
      }))
    },
    insights: careerInsights
  };
};

const buildRecruiterDashboard = async (userId) => {
  const jobs = await Job.find({ recruiter: userId }).sort({ createdAt: -1 });

  const jobStats = await Promise.all(
    jobs.map(async (job) => {
      const applicationCount = await Application.countDocuments({ job: job._id });
      const pendingCount = await Application.countDocuments({ job: job._id, status: { $in: ['Applied', 'pending'] } });
      return {
        job,
        applicationCount,
        pendingCount
      };
    })
  );

  const totalApplications = await Application.countDocuments({ recruiter: userId });

  return {
    totalJobs: jobs.length,
    publishedJobs: jobs.filter((j) => j.status === 'published').length,
    totalApplications,
    jobs: jobStats
  };
};

const getCandidateDashboard = asyncHandler(async (req, res) => {
  const dashboard = await buildCandidateDashboard(req.user._id);
  res.json({ success: true, dashboard });
});

const getRecruiterDashboard = asyncHandler(async (req, res) => {
  const dashboard = await buildRecruiterDashboard(req.user._id);
  res.json({ success: true, dashboard });
});

const getDashboard = asyncHandler(async (req, res) => {
  if (req.user.role === 'recruiter') {
    const dashboard = await buildRecruiterDashboard(req.user._id);
    return res.json({ success: true, dashboard });
  }
  if (req.user.role === 'candidate') {
    const dashboard = await buildCandidateDashboard(req.user._id);
    return res.json({ success: true, dashboard });
  }
  throw new AppError('Dashboard not available for this role', 403);
});

module.exports = {
  getCandidateDashboard,
  getRecruiterDashboard,
  getDashboard
};
