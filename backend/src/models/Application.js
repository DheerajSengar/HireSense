const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'Applied'
  },
  coverLetter: {
    type: String
  },
  matchScore: {
    type: Number,
    default: 0
  },
  matchDetails: {
    matchingSkills: [String],
    missingSkills: [String],
    explanation: String
  },
  aiAnalysis: {
    generatedAt: Date,
    matchScore: Number,
    matchingMethod: String,
    strengths: [String],
    matchingSkills: [String],
    missingSkills: [String]
  },
  notes: [{
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
