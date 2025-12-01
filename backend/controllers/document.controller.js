const Document = require('../models/Document');
const logger = require('../config/logger');
const crypto = require('crypto');
const { sendShareNotification } = require('../utils/email.util');

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;

    if (!req.file) {
      logger.warn('Document upload attempt without file');
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    if (!title || !category) {
      logger.warn('Document upload attempt with missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide title and category'
      });
    }

    // Convert file to base64
    const fileData = req.file.buffer.toString('base64');

    // Create document
    const document = await Document.create({
      user: req.user.id,
      title,
      category,
      description,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileData
    });

    logger.info(`Document uploaded by user ${req.user.email}: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: document._id,
        title: document.title,
        category: document.category,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    logger.error(`Document upload error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    
    let query = { user: req.user.id };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const documents = await Document.find(query)
      .select('-fileData') // Exclude file data for list view
      .sort({ createdAt: -1 });

    logger.info(`Documents retrieved for user ${req.user.email}: ${documents.length} documents`);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    logger.error(`Get documents error: ${error.message}`);
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      logger.warn(`Document not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check ownership
    if (document.user.toString() !== req.user.id) {
      logger.warn(`Unauthorized document access attempt by ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this document'
      });
    }

    logger.info(`Document retrieved: ${document.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error(`Get document error: ${error.message}`);
    next(error);
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res, next) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      logger.warn(`Document not found for update: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check ownership
    if (document.user.toString() !== req.user.id) {
      logger.warn(`Unauthorized document update attempt by ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this document'
      });
    }

    const { title, category, description } = req.body;
    
    // Update fields
    if (title) document.title = title;
    if (category) document.category = category;
    if (description !== undefined) document.description = description;

    // If new file uploaded
    if (req.file) {
      document.fileName = req.file.originalname;
      document.fileType = req.file.mimetype;
      document.fileSize = req.file.size;
      document.fileData = req.file.buffer.toString('base64');
    }

    await document.save();

    logger.info(`Document updated: ${document.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: {
        id: document._id,
        title: document.title,
        category: document.category,
        description: document.description,
        fileName: document.fileName,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    logger.error(`Update document error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      logger.warn(`Document not found for deletion: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check ownership
    if (document.user.toString() !== req.user.id) {
      logger.warn(`Unauthorized document deletion attempt by ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }

    await document.deleteOne();

    logger.info(`Document deleted: ${document.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete document error: ${error.message}`);
    next(error);
  }
};

// @desc    Share document
// @route   POST /api/documents/:id/share
// @access  Private
exports.shareDocument = async (req, res, next) => {
  try {
    const { email, expiryHours } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check ownership
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this document'
      });
    }

    // Generate share token
    const shareToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiry (default 24 hours)
    const hours = expiryHours || 24;
    const shareExpiry = new Date(Date.now() + hours * 60 * 60 * 1000);

    document.isShared = true;
    document.shareToken = shareToken;
    document.shareExpiry = shareExpiry;

    // Add to shared with list if email provided
    if (email) {
      document.sharedWith.push({ email });
    }

    await document.save();

    // Generate share link
    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${shareToken}`;

    // Send email notification if email provided
    if (email) {
      try {
        await sendShareNotification(email, req.user.name, document.title, shareLink);
      } catch (emailError) {
        logger.error(`Failed to send share notification: ${emailError.message}`);
      }
    }

    logger.info(`Document shared: ${document.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Document shared successfully',
      data: {
        shareLink,
        expiresAt: shareExpiry
      }
    });
  } catch (error) {
    logger.error(`Share document error: ${error.message}`);
    next(error);
  }
};

// @desc    Get shared document
// @route   GET /api/documents/shared/:token
// @access  Public
exports.getSharedDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ 
      shareToken: req.params.token,
      isShared: true
    }).populate('user', 'name email');

    if (!document) {
      logger.warn(`Shared document not found: ${req.params.token}`);
      return res.status(404).json({
        success: false,
        message: 'Document not found or link expired'
      });
    }

    // Check if expired
    if (document.shareExpiry && new Date() > document.shareExpiry) {
      logger.warn(`Expired share link accessed: ${req.params.token}`);
      return res.status(410).json({
        success: false,
        message: 'Share link has expired'
      });
    }

    logger.info(`Shared document accessed: ${document.title}`);

    res.status(200).json({
      success: true,
      data: {
        title: document.title,
        category: document.category,
        description: document.description,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        fileData: document.fileData,
        sharedBy: document.user.name,
        sharedAt: document.createdAt
      }
    });
  } catch (error) {
    logger.error(`Get shared document error: ${error.message}`);
    next(error);
  }
};

// @desc    Revoke document share
// @route   DELETE /api/documents/:id/share
// @access  Private
exports.revokeShare = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check ownership
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    document.isShared = false;
    document.shareToken = undefined;
    document.shareExpiry = undefined;
    await document.save();

    logger.info(`Document share revoked: ${document.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Share link revoked successfully'
    });
  } catch (error) {
    logger.error(`Revoke share error: ${error.message}`);
    next(error);
  }
};