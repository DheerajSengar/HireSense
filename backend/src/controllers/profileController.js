const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { analyzeResume, improveProfile } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { normalizeSkills, validateProfileArray } = require('../utils/profileData');

const PROFILE_LINK_FIELDS = ['linkedin', 'github', 'website'];
const PROFILE_TEXT_LIMITS = {
  headline: 160,
  summary: 2000,
  phone: 40,
  location: 120,
  linkedin: 500,
  github: 500,
  website: 500
};

const normalizeLink = (value, field) => {
  if (!value) return '';
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new AppError(`${field} must be a valid URL.`, 400);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new AppError(`${field} must use http or https.`, 400);
  }
  return parsed.toString();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' && ['application/pdf', 'application/octet-stream'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Upload a PDF resume only.', 400));
    }
  }
});

const removeResumeFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Failed to remove resume file:', error.message);
  }
};

const getResumeAnalysisError = (error) => {
  if (error.code === 'CONFIG') return new AppError(error.message, 503);
  if (error.code === 'RATE_LIMIT') return new AppError(error.message, 429);
  if (error.code === 'AUTH') return new AppError(error.message, 502);
  if (error.code === 'EMPTY_RESUME') return new AppError(error.message, 400);
  if (error.code === 'INVALID_RESPONSE') return new AppError(error.message, 502);
  return new AppError('Gemini resume analysis is temporarily unavailable. Please try again.', 502);
};

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  let user;
  try {
    const dataBuffer = await fs.promises.readFile(req.file.path);
    if (dataBuffer.length < 5 || dataBuffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new AppError('The uploaded file is not a valid PDF. Please choose a PDF resume.', 400);
    }
    let parsed;
    try {
      parsed = await pdfParse(dataBuffer, { max: 31 });
    } catch {
      throw new AppError('Could not read this PDF. Please upload a valid, text-based PDF resume.', 400);
    }
    if (parsed.numpages > 30) {
      throw new AppError('Resume PDFs must have 30 pages or fewer.', 400);
    }
    const resumeText = (parsed.text || '').replace(/\u0000/g, '').trim();
    if (resumeText.length < 40) {
      throw new AppError('No readable resume text was found. Upload a text-based PDF rather than a scanned image.', 400);
    }
    if (resumeText.length > 20000) {
      throw new AppError('This resume contains too much text to analyze. Please upload a shorter PDF (20,000 extracted characters or fewer).', 400);
    }

    let analysis;
    try {
      analysis = await analyzeResume(resumeText);
    } catch (error) {
      throw getResumeAnalysisError(error);
    }

    user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found', 404);
    const previousResumePath = user.candidateProfile.resume?.url
      ? path.resolve(process.cwd(), user.candidateProfile.resume.url.replace(/^\/uploads\//, 'uploads/'))
      : null;
    const resumeDirectory = path.resolve(process.cwd(), 'uploads', 'resumes') + path.sep;
    const previousPathIsManaged = previousResumePath?.startsWith(resumeDirectory);
    const relativeUrl = `/uploads/resumes/${path.basename(req.file.path)}`;

    user.candidateProfile.resume = {
      url: relativeUrl,
      uploadedAt: new Date(),
      analysis
    };
    user.candidateProfile.resumeScore = analysis.score;

    if (analysis.skills && analysis.skills.length > 0) {
      const existing = normalizeSkills(user.candidateProfile.skills || []);
      user.candidateProfile.skills = normalizeSkills([
        ...existing,
        ...analysis.skills.map((name) => ({ name }))
      ]);
    }

    if (analysis.experience && analysis.experience.length > 0 && (!user.candidateProfile.experience || user.candidateProfile.experience.length === 0)) {
      user.candidateProfile.experience = analysis.experience.map((exp) => ({
        company: exp.company || '',
        position: exp.position || '',
        description: exp.description || '',
        current: false
      }));
    }

    if (analysis.education && analysis.education.length > 0 && (!user.candidateProfile.education || user.candidateProfile.education.length === 0)) {
      user.candidateProfile.education = analysis.education.map((edu) => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || ''
      }));
    }

    await user.save();
    if (previousPathIsManaged && previousResumePath !== path.resolve(req.file.path)) {
      await removeResumeFile(previousResumePath);
    }

    res.json({
      success: true,
      resume: user.candidateProfile.resume,
      analysis,
      skills: normalizeSkills(user.candidateProfile.skills || [])
    });
  } catch (error) {
    await removeResumeFile(req.file.path);
    throw error;
  }
});

const updateCandidateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.trim().length > 120) {
      throw new AppError('Name is required and must be 120 characters or fewer.', 400);
    }
    user.name = req.body.name.trim();
  }

  if (req.body.profile !== undefined) {
    if (!req.body.profile || typeof req.body.profile !== 'object' || Array.isArray(req.body.profile)) {
      throw new AppError('Profile details must be an object.', 400);
    }
    PROFILE_LINK_FIELDS.forEach((field) => {
      if (req.body.profile[field] !== undefined) {
        if (typeof req.body.profile[field] !== 'string') throw new AppError(`${field} must be text.`, 400);
        user.profile[field] = normalizeLink(req.body.profile[field].trim(), field);
      }
    });
    Object.entries(PROFILE_TEXT_LIMITS).forEach(([field, limit]) => {
      if (['linkedin', 'github', 'website'].includes(field) || req.body.profile[field] === undefined) return;
      const value = req.body.profile[field];
      if (typeof value !== 'string' || value.trim().length > limit) {
        throw new AppError(`${field} must be text and ${limit} characters or fewer.`, 400);
      }
      user.profile[field] = value.trim();
    });
  }

  if (req.body.skills !== undefined) {
    try {
      user.candidateProfile.skills = normalizeSkills(req.body.skills);
    } catch (error) {
      throw new AppError(error.message, 400);
    }
  }
  if (req.body.education !== undefined) {
    try {
      user.candidateProfile.education = validateProfileArray(req.body.education, 'Education', [
        ['institution', 160], ['degree', 120], ['field', 120]
      ]);
    } catch (error) {
      throw new AppError(error.message, 400);
    }
  }
  if (req.body.experience !== undefined) {
    try {
      user.candidateProfile.experience = validateProfileArray(req.body.experience, 'Experience', [
        ['company', 160], ['position', 160], ['description', 2000]
      ]);
    } catch (error) {
      throw new AppError(error.message, 400);
    }
  }
  if (req.body.projects !== undefined) {
    try {
      const projects = validateProfileArray(req.body.projects, 'Projects', [
        ['title', 160], ['description', 2000], ['link', 500]
      ]);
      user.candidateProfile.projects = projects.map((project, index) => {
        const source = req.body.projects[index];
        if (source.technologies != null && (!Array.isArray(source.technologies) || source.technologies.length > 50 || source.technologies.some((item) => typeof item !== 'string' || item.trim().length > 80))) {
          throw new TypeError('Project technologies must be a list of up to 50 names, each 80 characters or fewer.');
        }
        return {
          ...project,
          technologies: (source.technologies || []).map((item) => item.trim()).filter(Boolean)
        };
      });
      user.candidateProfile.projects.forEach((project) => {
        if (project.link) project.link = normalizeLink(project.link, 'Project link');
      });
    } catch (error) {
      throw new AppError(error.message, 400);
    }
  }

  await user.save();

  res.json({
    success: true,
    profile: {
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      candidateProfile: user.candidateProfile
    }
  });
});

const getCandidateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);
  res.json({
    success: true,
    profile: {
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      candidateProfile: {
        ...user.candidateProfile.toObject(),
        skills: normalizeSkills(user.candidateProfile.skills || [])
      }
    }
  });
});

const improveCandidateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  try {
    const suggestions = await improveProfile(user);
    res.json({ success: true, suggestions });
  } catch (error) {
    if (error.code === 'CONFIG') throw new AppError(error.message, 503);
    if (error.code === 'EMPTY_PROFILE') throw new AppError(error.message, 400);
    if (error.code === 'RATE_LIMIT') throw new AppError(error.message, 429);
    if (error.code === 'AUTH') throw new AppError(error.message, 502);
    console.error('AI profile improvement failed:', error.code || 'UNKNOWN');
    throw new AppError(error.message || 'AI profile suggestions are temporarily unavailable.', 502);
  }
});

module.exports = {
  uploadResume,
  updateCandidateProfile,
  getCandidateProfile,
  improveCandidateProfile,
  upload
};
