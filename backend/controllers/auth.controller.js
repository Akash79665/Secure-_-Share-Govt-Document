const User = require('../models/User');
const { generateToken } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, aadhaarNumber, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !aadhaarNumber || !phone) {
      logger.warn('Registration attempt with missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { aadhaarNumber }] 
    });

    if (existingUser) {
      logger.warn(`Registration attempt with existing email/aadhaar: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User with this email or Aadhaar already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      aadhaarNumber,
      phone
    });

    // Generate OTP (always 123456 for testing)
    const otp = user.generateOTP();
    await user.save();

    // Log OTP to console
    console.log('\n' + '='.repeat(60));
    console.log('✅ USER REGISTERED - USE THIS OTP TO VERIFY:');
    console.log('='.repeat(60));
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔑 OTP: ${otp} (Always 123456 for testing)`);
    console.log(`⏰ Never expires (testing mode)`);
    console.log('='.repeat(60) + '\n');
    
    logger.info(`User registered: ${email}, OTP: ${otp}`);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Use OTP: 123456 to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        testOTP: '123456' // Send OTP in response for testing
      }
    });
    
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    logger.error(`Registration error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      logger.warn('OTP verification attempt with missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      logger.warn(`OTP verification attempt for non-existent user: ${email}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      logger.info(`OTP verification attempt for already verified user: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      logger.warn(`Invalid OTP attempt for user: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User verified successfully: ${email}`);
    console.log(`✅ User verified: ${email}\n`);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          aadhaarNumber: user.aadhaarNumber,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('❌ OTP Verification Error:', error.message);
    logger.error(`OTP verification error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Verification failed: ' + error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      });
    }

    // Generate new OTP (always 123456)
    const otp = user.generateOTP();
    await user.save();

    console.log('\n' + '='.repeat(60));
    console.log('🔄 OTP RESENT:');
    console.log('='.repeat(60));
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 OTP: ${otp} (Always 123456 for testing)`);
    console.log('='.repeat(60) + '\n');
    
    logger.info(`OTP resent: ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'OTP resent successfully. Use OTP: 123456',
      data: {
        testOTP: '123456'
      }
    });
  } catch (error) {
    logger.error(`Resend OTP error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP: ' + error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Login attempt with missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Login attempt for non-existent user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if verified
    if (!user.isVerified) {
      logger.warn(`Login attempt for unverified user: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Please verify your account first. Use OTP: 123456'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User logged in successfully: ${email}`);
    console.log(`✅ User logged in: ${email}\n`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          aadhaarNumber: user.aadhaarNumber,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    logger.error(`Login error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    next(error);
  }
};