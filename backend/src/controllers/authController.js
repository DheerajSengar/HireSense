const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const googleClient = new OAuth2Client();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  const allowedRoles = ['candidate', 'recruiter'];
  const userRole = role && allowedRoles.includes(role) ? role : 'candidate';

  const user = await User.create({
    name,
    email,
    password,
    role: userRole
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

const googleLogin = asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google sign-in is not configured on the server', 503);
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error('Google sign-in credential verification failed:', error.message);
    throw new AppError('Google sign-in could not be verified. Please try again.', 401);
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new AppError('Google did not provide a verified email address', 401);
  }

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email }]
  }).select('+googleId');

  if (user?.googleId && user.googleId !== payload.sub) {
    throw new AppError('This account is linked to a different Google account', 409);
  }

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email,
      email: payload.email,
      googleId: payload.sub
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    await user.save();
  }

  const token = generateToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.name) user.name = req.body.name;
  if (req.body.phone !== undefined) user.profile.phone = req.body.phone;
  if (req.body.location !== undefined) user.profile.location = req.body.location;
  if (req.body.linkedin !== undefined) user.profile.linkedin = req.body.linkedin;
  if (req.body.github !== undefined) user.profile.github = req.body.github;
  if (req.body.website !== undefined) user.profile.website = req.body.website;

  if (req.body.company !== undefined) user.recruiterProfile.company = req.body.company;
  if (req.body.position !== undefined) user.recruiterProfile.position = req.body.position;
  if (req.body.companyWebsite !== undefined) user.recruiterProfile.companyWebsite = req.body.companyWebsite;

  await user.save();

  res.json({
    success: true,
    user
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('No user found with that email', 404);
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const response = {
    success: true,
    message: 'Password reset token generated'
  };

  if (process.env.NODE_ENV === 'development') {
    response.resetToken = resetToken;
  }

  res.json(response);
});

const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    message: 'Password reset successful'
  });
});

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
};
