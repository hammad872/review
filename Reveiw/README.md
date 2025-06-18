# Review System with Star Ratings and Charts

A complete review system built with Node.js, MongoDB, and Shopify integration. Features configurable star rating questions with beautiful charts and statistics.

## Features

- ⭐ **Star Rating System**: 1-5 star ratings for each question
- 📊 **Interactive Charts**: Beautiful bar charts showing rating distributions
- 🔧 **Configurable Questions**: Questions can be managed from Shopify admin
- 📱 **Responsive Design**: Works perfectly on all devices
- 🎨 **Modern UI**: Beautiful, user-friendly interface
- 📈 **Real-time Statistics**: Live statistics and recent reviews
- 🔒 **Secure API**: Built with proper validation and error handling

## Database Structure

### Questions Collection
```javascript
{
  questionId: "question1",           // Unique identifier
  questionText: "How would you rate...", // Configurable question text
  order: 1,                         // Display order
  isActive: true,                   // Whether question is active
  category: "experience",           // Question category
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection
```javascript
{
  questions: [                      // Array of question ratings
    {
      questionId: "question1",
      questionText: "How would you rate...",
      rating: 5
    }
  ],
  comments: "Great experience!",    // Optional comments
  reviewerName: "John Doe",         // Optional name
  createdAt: Date,
  ipAddress: "192.168.1.1",        // For tracking
  userAgent: "Mozilla/5.0..."      // For analytics
}
```

## Setup Instructions

### 1. Backend Setup (Node.js + MongoDB)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Update `config.env` with your MongoDB connection string
   - The connection string is already configured for your cluster

3. **Initialize Default Questions**
   ```bash
   # Start the server
   npm start
   
   # In another terminal, initialize default questions
   curl -X POST http://localhost:3000/api/questions/initialize
   ```

4. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### 2. API Endpoints

#### Questions Management
- `GET /api/questions` - Get active questions
- `GET /api/questions/all` - Get all questions (including inactive)
- `POST /api/questions` - Create new question
- `PUT /api/questions/:questionId` - Update question
- `DELETE /api/questions/:questionId` - Delete question
- `POST /api/questions/initialize` - Initialize default questions

#### Reviews
- `POST /api/reviews/submit` - Submit a new review
- `GET /api/reviews/stats` - Get review statistics
- `GET /api/reviews/recent` - Get recent reviews
- `GET /api/reviews/questions` - Get questions for review form

### 3. Shopify Integration

1. **Upload the Liquid Section**
   - Copy the contents of `shopify-review-section.liquid`
   - In your Shopify admin, go to **Online Store > Themes**
   - Click **Actions > Edit code**
   - In the **Sections** folder, create a new file called `review-system.liquid`
   - Paste the Liquid code

2. **Add the Section to a Page**
   - Go to **Online Store > Themes**
   - Click **Customize** on your active theme
   - Navigate to the page where you want to add the review system
   - Click **Add section**
   - Select **Review System** from the list

3. **Configure the Section**
   - **API Base URL**: Set to your Node.js server URL (e.g., `https://your-domain.com`)
   - **Display Options**: Choose which tabs to show
   - **Content**: Customize all text labels and messages
   - **Styling**: Uses your theme's color scheme automatically

### 4. Managing Questions from Shopify Admin

You can manage questions through the API endpoints. Here are some examples:

#### Update Question Text
```bash
curl -X PUT http://localhost:3000/api/questions/question1 \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "How would you rate your overall experience with our Academy section?"
  }'
```

#### Add New Question
```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "question5",
    "questionText": "Would you recommend our Academy to others?",
    "order": 5,
    "category": "recommendation"
  }'
```

#### Deactivate Question
```bash
curl -X PUT http://localhost:3000/api/questions/question1 \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

## Default Questions

The system comes with 4 default questions:

1. **Question 1**: "How would you rate your overall experience with the Academy section?"
2. **Question 2**: "Was the content easy to follow and understand?"
3. **Question 3**: "Were the lessons useful for your career as a stylist?"
4. **Question 4**: "How satisfied are you with the page layout and structure?"

## Customization

### Styling
The Shopify section automatically uses your theme's color scheme:
- `{{ settings.color_primary }}` - Primary color
- `{{ settings.color_text }}` - Text color
- `{{ settings.color_background }}` - Background color
- `{{ settings.color_border }}` - Border color

### Text Customization
All text can be customized through the Shopify section settings:
- Section title and subtitle
- Tab labels
- Form labels and placeholders
- Success and error messages
- Statistics labels

### API Customization
You can modify the API endpoints in `routes/reviews.js` and `routes/questions.js` to add:
- Authentication
- Rate limiting
- Additional validation
- Custom analytics

## Security Features

- Input validation for all ratings (1-5 stars only)
- SQL injection protection through Mongoose
- CORS enabled for cross-origin requests
- IP address tracking for spam prevention
- User agent logging for analytics

## Performance

- Efficient MongoDB aggregation queries for statistics
- Chart.js for lightweight, responsive charts
- Lazy loading of statistics and recent reviews
- Optimized database indexes

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string in `config.env`
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **Questions Not Loading**
   - Run the initialization endpoint: `POST /api/questions/initialize`
   - Check if questions are marked as active

3. **Charts Not Displaying**
   - Ensure Chart.js is loaded (included via CDN)
   - Check browser console for JavaScript errors

4. **Shopify Section Not Working**
   - Verify the API URL is correct in section settings
   - Check if your server is accessible from the internet
   - Ensure CORS is properly configured

### Development Tips

- Use `npm run dev` for development with auto-restart
- Check server logs for detailed error messages
- Use browser developer tools to debug frontend issues
- Test API endpoints with tools like Postman or curl

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation at `http://localhost:3000/`
3. Check server logs for detailed error messages 