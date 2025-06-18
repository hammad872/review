const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Reviewer name
  reviewerName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Dynamic questions array - each question has an ID, text, and rating
  questions: [{
    questionId: {
      type: String,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  }],
  
  // Comments (optional)
  comments: {
    type: String,
    trim: true
  },
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // IP address for basic tracking
  ipAddress: String,
  
  // User agent for analytics
  userAgent: String
});

// Calculate average rating
reviewSchema.virtual('averageRating').get(function() {
  if (!this.questions || this.questions.length === 0) return 0;
  const ratings = this.questions.map(q => q.rating);
  return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema); 