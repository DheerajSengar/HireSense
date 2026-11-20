const { body, param } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['candidate', 'recruiter']).withMessage('Invalid role')
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const googleLoginRules = [
  body('credential').isString().notEmpty().withMessage('Google credential is required')
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Valid email is required')
];

const resetPasswordRules = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const jobRules = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('experience').isIn(['Entry', 'Mid', 'Senior', 'Lead', 'Executive']).withMessage('Invalid experience level'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('workType').isIn(['Remote', 'Hybrid', 'Onsite']).withMessage('Invalid work type'),
  body('employmentType').isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid employment type')
];

const applyRules = [
  body('jobId').optional().isMongoId().withMessage('Valid job ID is required'),
  body('coverLetter').optional().isString()
];

const statusRules = [
  body('status').isIn(['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected']).withMessage('Invalid status')
];

const mongoIdParam = (name) => [
  param(name).isMongoId().withMessage(`Valid ${name} is required`)
];

module.exports = {
  registerRules,
  loginRules,
  googleLoginRules,
  forgotPasswordRules,
  resetPasswordRules,
  jobRules,
  applyRules,
  statusRules,
  mongoIdParam
};
