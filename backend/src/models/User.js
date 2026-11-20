const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  yearsExperience: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [function() { return !this.googleId; }, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    select: false
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  profile: {
    headline: {
      type: String,
      trim: true,
      maxlength: 160
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    website: String
  },
  candidateProfile: {
    skills: {
      type: [skillSchema],
      default: []
    },
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      current: Boolean
    }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      link: String
    }],
    resume: {
      url: String,
      uploadedAt: Date,
      analysis: {
        score: Number,
        provider: String,
        skills: [String],
        experience: [{
          company: String,
          position: String,
          duration: String,
          description: String
        }],
        projects: [{
          title: String,
          description: String,
          technologies: [String]
        }],
        education: [{
          institution: String,
          degree: String,
          field: String,
          year: String
        }],
        strengths: [String],
        weaknesses: [String],
        missingSkills: [{
          skill: String,
          reason: String
        }],
        keywordSuggestions: [{
          keyword: String,
          reason: String
        }],
        improvements: [String],
        improvementSuggestions: [{
          section: String,
          suggestion: String
        }]
      }
    },
    resumeScore: Number,
    matchingEmbedding: {
      type: [Number],
      select: false
    },
    matchingEmbeddingHash: {
      type: String,
      select: false
    },
    aiInsights: {
      inputHash: String,
      summary: String,
      topMissingSkills: [{
        skill: String,
        reason: String
      }],
      careerSuggestions: [{
        title: String,
        reason: String,
        nextStep: String
      }],
      generatedAt: Date
    }
  },
  recruiterProfile: {
    company: String,
    position: String,
    companyWebsite: String
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

userSchema.pre('init', function(document) {
  const skills = document.candidateProfile?.skills;
  if (Array.isArray(skills)) {
    document.candidateProfile.skills = skills.map((skill) => (
      typeof skill === 'string'
        ? { name: skill, proficiency: 'beginner', yearsExperience: 0 }
        : skill
    ));
  }
});

userSchema.pre('validate', function(next) {
  if (this.candidateProfile?.skills?.length) {
    this.candidateProfile.skills = this.candidateProfile.skills.map((skill) => (
      typeof skill === 'string'
        ? { name: skill, proficiency: 'beginner', yearsExperience: 0 }
        : skill
    ));
  }
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!enteredPassword || !this.password) {
    return false;
  }
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
