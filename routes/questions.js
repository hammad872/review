const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { adminAuth } = require('./reviews');

// Get all active questions
router.get('/', async (req, res) => {
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

// Get all questions (including inactive)
router.get('/all', async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error('Error getting all questions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a new question
router.post('/', async (req, res) => {
  try {
    const { questionId, questionText, order, category } = req.body;

    if (!questionId || !questionText) {
      return res.status(400).json({
        success: false,
        message: 'Question ID and text are required'
      });
    }

    // Check if question ID already exists
    const existingQuestion = await Question.findOne({ questionId });
    if (existingQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Question ID already exists'
      });
    }

    const question = new Question({
      questionId,
      questionText,
      order: order || 0,
      category: category || 'general'
    });

    await question.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });

  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a question
router.put('/:questionId', adminAuth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { questionText, order, isActive, category } = req.body;

    const question = await Question.findOne({ questionId });
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update fields
    if (questionText !== undefined) question.questionText = questionText;
    if (order !== undefined) question.order = order;
    if (isActive !== undefined) question.isActive = isActive;
    if (category !== undefined) question.category = category;

    await question.save();

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a question
router.delete('/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findOne({ questionId });
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await Question.deleteOne({ questionId });

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Initialize default questions (for first-time setup)
router.post('/initialize', async (req, res) => {
  try {
    const defaultQuestions = [
      {
        questionId: 'question1',
        questionText: 'How would you rate your overall experience with the Academy section?',
        order: 1,
        category: 'experience'
      },
      {
        questionId: 'question2',
        questionText: 'Was the content easy to follow and understand?',
        order: 2,
        category: 'content'
      },
      {
        questionId: 'question3',
        questionText: 'Were the lessons useful for your career as a stylist?',
        order: 3,
        category: 'career'
      },
      {
        questionId: 'question4',
        questionText: 'How satisfied are you with the page layout and structure?',
        order: 4,
        category: 'layout'
      }
    ];

    const createdQuestions = [];
    
    for (const questionData of defaultQuestions) {
      const existingQuestion = await Question.findOne({ questionId: questionData.questionId });
      if (!existingQuestion) {
        const question = new Question(questionData);
        await question.save();
        createdQuestions.push(question);
      }
    }

    res.json({
      success: true,
      message: 'Default questions initialized',
      data: createdQuestions
    });

  } catch (error) {
    console.error('Error initializing questions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 