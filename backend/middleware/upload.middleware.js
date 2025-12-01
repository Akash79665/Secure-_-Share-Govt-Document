const multer = require('multer');
const logger = require('../config/logger');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    logger.info(`File upload accepted: ${file.originalname}`);
    cb(null, true);
  } else {
    logger.warn(`File upload rejected: ${file.originalname} - Invalid type: ${file.mimetype}`);
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      logger.warn(`File size limit exceeded`);
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    logger.error(`Multer error: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    logger.error(`Upload error: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError
};