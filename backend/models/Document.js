const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['education', 'identity', 'health', 'railway', 'others'],
    default: 'others'
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileData: {
    type: String, // Base64 encoded string
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isShared: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
    // ✅ REMOVED "index: true" - already defined in schema.index() below
  },
  shareExpiry: {
    type: Date
  },
  sharedWith: [{
    email: String,
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
documentSchema.index({ user: 1, category: 1 });
documentSchema.index({ shareToken: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Document', documentSchema);