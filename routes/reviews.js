const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Question = require('../models/Question');
const crypto = require('crypto');
let adminToken = null;

// Submit a new review
router.post('/submit', async (req, res) => {
  try {
    const { questions, comments, reviewerName } = req.body;

    // Validate reviewer name
    if (!reviewerName || typeof reviewerName !== 'string' || reviewerName.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reviewer name is required and must not be empty' 
      });
    }

    // Validate questions array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Questions array is required and must not be empty' 
      });
    }

    // Validate each question
    for (let question of questions) {
      if (!question.questionId || !question.questionText || !question.rating) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each question must have questionId, questionText, and rating' 
        });
      }
      
      if (question.rating < 1 || question.rating > 5 || !Number.isInteger(question.rating)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ratings must be integers between 1 and 5' 
        });
      }
    }

    const review = new Review({
      questions,
      comments,
      reviewerName: reviewerName.trim(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get review statistics for charts
router.get('/stats', async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    
    if (totalReviews === 0) {
      // Get active questions to return empty stats structure
      const activeQuestions = await Question.find({ isActive: true }).sort({ order: 1 });
      
      const emptyStats = {
        totalReviews: 0,
        questions: activeQuestions.map(q => ({
          questionId: q.questionId,
          questionText: q.questionText,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }))
      };

      return res.json({
        success: true,
        data: emptyStats
      });
    }

    // Get all active questions
    const activeQuestions = await Question.find({ isActive: true }).sort({ order: 1 });
    
    // Calculate statistics for each question
    const questionStats = [];
    
    for (const question of activeQuestions) {
      // Calculate average rating for this question
      const avgResult = await Review.aggregate([
        { $unwind: '$questions' },
        { $match: { 'questions.questionId': question.questionId } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$questions.rating' }
          }
        }
      ]);

      // Calculate rating distribution for this question
      const distributionResult = await Review.aggregate([
        { $unwind: '$questions' },
        { $match: { 'questions.questionId': question.questionId } },
        {
          $group: {
            _id: null,
            rating1: { $sum: { $cond: [{ $eq: ['$questions.rating', 1] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ['$questions.rating', 2] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ['$questions.rating', 3] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ['$questions.rating', 4] }, 1, 0] } },
            rating5: { $sum: { $cond: [{ $eq: ['$questions.rating', 5] }, 1, 0] } }
          }
        }
      ]);

      const avgRating = avgResult.length > 0 ? Math.round(avgResult[0].avgRating * 10) / 10 : 0;
      const distribution = distributionResult.length > 0 ? distributionResult[0] : { rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 };

      questionStats.push({
        questionId: question.questionId,
        questionText: question.questionText,
        averageRating: avgRating,
        ratingDistribution: {
          1: distribution.rating1,
          2: distribution.rating2,
          3: distribution.rating3,
          4: distribution.rating4,
          5: distribution.rating5
        }
      });
    }

    res.json({
      success: true,
      data: {
        totalReviews,
        questions: questionStats
      }
    });

  } catch (error) {
    console.error('Error getting review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get recent reviews
router.get('/recent', async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-ipAddress -userAgent');

    // Handle cases where old reviews might not have reviewerName
    const processedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      if (!reviewObj.reviewerName) {
        reviewObj.reviewerName = 'Anonymous';
      }
      return reviewObj;
    });

    res.json({
      success: true,
      data: processedReviews
    });

  } catch (error) {
    console.error('Error getting recent reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get questions for the review form
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin login endpoint
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'asAS0909@') {
    adminToken = crypto.randomBytes(32).toString('hex');
    return res.json({ success: true, token: adminToken });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

function adminAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token || token !== adminToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
}

// Delete a review by ID (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    await Review.deleteOne({ _id: id });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = { router, adminAuth }; 