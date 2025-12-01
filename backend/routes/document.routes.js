const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  getSharedDocument,
  revokeShare
} = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');

// Public route for shared documents
router.get('/shared/:token', getSharedDocument);

// Protected routes
router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(upload.single('file'), handleMulterError, uploadDocument);

router.route('/:id')
  .get(getDocument)
  .put(upload.single('file'), handleMulterError, updateDocument)
  .delete(deleteDocument);

router.route('/:id/share')
  .post(shareDocument)
  .delete(revokeShare);

module.exports = router;