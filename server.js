const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/questions', require('./routes/questions'));

// Serve static files
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Review system is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Review System API',
    version: '1.0.0',
    endpoints: {
      reviews: {
        submit: 'POST /api/reviews/submit',
        stats: 'GET /api/reviews/stats',
        recent: 'GET /api/reviews/recent',
        questions: 'GET /api/reviews/questions'
      },
      questions: {
        list: 'GET /api/questions',
        all: 'GET /api/questions/all',
        create: 'POST /api/questions',
        update: 'PUT /api/questions/:questionId',
        delete: 'DELETE /api/questions/:questionId',
        initialize: 'POST /api/questions/initialize'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API documentation: http://localhost:${PORT}/`);
}); 