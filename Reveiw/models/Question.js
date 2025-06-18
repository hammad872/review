const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // Unique identifier for the question (e.g., "question1", "question2")
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // The actual question text that can be changed from Shopify admin
  questionText: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Question order for display
  order: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Whether the question is active
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Question category (optional)
  category: {
    type: String,
    default: 'general'
  },
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
questionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Question', questionSchema); 