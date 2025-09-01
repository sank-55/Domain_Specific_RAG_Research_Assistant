🌐 ReadBuddy - Web Page Analysis & Research AI
https://img.shields.io/badge/Demo-Live-green
https://img.shields.io/badge/Node.js-18%252B-brightgreen
https://img.shields.io/badge/React-18-blue
https://img.shields.io/badge/MongoDB-5%252B-green
https://img.shields.io/badge/License-MIT-yellow

A futuristic AI-powered research assistant that processes web pages, extracts content, and provides intelligent answers to your questions using free APIs and advanced content analysis.

https://via.placeholder.com/800x400/2D3748/FFFFFF?text=RockyBot+Futuristic+Interface

What are the Problems we faced in Gathering Information ........


Information Overload

Too many sources (newspapers, blogs, TV, social media).

Hard to filter out noise vs. valuable insights.

Scattered Sources

Important news is spread across different platforms.

User has to manually open multiple sites or apps.

Lack of Context & Depth

Headlines often lack background or analysis.

Users need to dig through long articles to understand real implications.

Bias & Reliability Issues

Different outlets show bias.

Hard to verify credibility of sources quickly.

Time Consumption

Manually searching, reading, and comparing multiple sources is slow.

Professionals (students, journalists, researchers) need concise summaries.

No Personalization

Regular news feeds are generic.

People want summaries tailored to their interest (e.g., finance, healthcare, technology).

🔹 Why I Built the AI  Research Chatbot:

To aggregate news from multiple sources in one place.

To summarize lengthy articles into concise insights.

To provide contextual Q&A (instead of just headlines).

To reduce bias by showing information from different perspectives.

To save time for users by delivering instant, research-style summaries.

To allow interactive exploration — users can ask follow-up questions instead of passively scrolling.


✨ Features
🚀 Core Functionality
URL Processing: Extract and store content from multiple web pages simultaneously

Smart Q&A: Ask natural language questions about processed content

Real-time Analysis: Instant content processing and question answering

🎨 User Experience
Futuristic UI: Modern glassmorphism design with gradient backgrounds

Responsive Design: Works perfectly on desktop and mobile devices

Real-time Updates: Live processing status and instant answers

History Tracking: Maintains processed article history with timestamps

Source Referencing: Always cites original article sources

🔧 Technical Features
MongoDB Integration: Efficient content storage and retrieval

Cheerio Web Scraping: Robust content extraction from various websites

Free API Fallbacks: Multiple free knowledge sources

Error Resilience: Graceful degradation when services are unavailable

🛠️ Tech Stack
Frontend
React 19 with modern hooks

Tailwind CSS for styling

Axios for API communication

Glassmorphism UI design

Backend
Node.js with Express.js

MongoDB with Mongoose ODM

Cheerio for web scraping

Multiple Free APIs (Wikipedia, DuckDuckGo, etc.)

Development
ES Modules (Native JavaScript modules)

Environment Variables with dotenv

CORS Enabled for cross-origin requests

📦 Installation
Prerequisites
Node.js 18+

MongoDB 5+

npm or yarn

1. Clone the Repository
bash
git clone https://github.com/yourusername/rockybot.git
cd rockybot
2. Install Dependencies
bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
3. Environment Setup
Create a .env file in the Backend directory:

env
MONGO_URI=mongodb://localhost:27017
PORT=5005
# Optional: Add free API keys if you have them
OPENAI_API_KEY=your_openai_secret_api_key
4. Start the Application
bash
# Start backend server (from Backend directory)
npm run dev

# Start frontend (from Frontend directory, new terminal)
npm start
The application will be available at:

Frontend: http://localhost:3000

Backend: http://localhost:5005

🚀 Usage
1. Process Web Pages
Enter up to 3 URLs in the input fields

Click "⚡ Process URLs" to extract and store content

Watch real-time processing status

2. Ask Questions
Type your question in the input field

Click "🤖 Ask RockyBot" for instant answers

Review answers with source references

3. Manage History
View recently processed articles

Refresh history with the refresh button

Click article links to visit original sources

🎯 Example Questions
RockyBot can answer various types of questions:

Factual: "What are the main points of this article?"

Comparative: "How do these articles differ on this topic?"

Analytical: "What trends are mentioned across these sources?"

Specific: "What statistics are provided about climate change?"

🔍 How It Works
Content Processing Pipeline
URL Validation: Checks and normalizes input URLs

Content Extraction: Uses Cheerio to scrape and clean web content

Text Processing: Removes ads, navigation, and irrelevant content

Storage: Saves content to MongoDB with metadata

Indexing: Creates searchable content indices

Question Answering System
Question Analysis: Parses and understands user questions

API Routing: Routes to appropriate free APIs (Wikipedia, DuckDuckGo)

Content Matching: Finds relevant sections in processed articles

Response Generation: Creates comprehensive, sourced answers

Fallback Handling: Uses smart analysis when APIs are unavailable

📊 API Endpoints
Backend Routes
POST /api/news/process - Process multiple URLs

POST /api/news/ask - Ask questions about processed content

GET /api/news/history - Get processing history

Request Examples
javascript
// Process URLs
const response = await fetch('/api/news/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    urls: ['https://example.com/article1', 'https://example.com/article2'] 
  })
});

// Ask question
const response = await fetch('/api/news/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    question: 'What are the key findings?' 
  })
});
🏗️ Project Structure
text
rockybot/
├── Backend/
│   ├── routes/
│   │   └── Research.js          # Main API routes
│   ├── models/
│   │   └── Article.js           # MongoDB schema
│   ├── utils/
│   │   └── extractText.js       # Web content extraction
│   ├── server.js               # Express server
│   └── package.json
├── Frontend/
│   ├── src/
│   │   └── App.jsx             # Main React component
│   └── package.json
└── README.md
🌟 Why RockyBot?
✅ Advantages
Cost-Free: No paid API subscriptions required

Privacy-Focused: Your data stays on your servers

Customizable: Easy to extend with new APIs and features

Reliable: Multiple fallback mechanisms ensure uptime

Modern: Built with latest web technologies

🎯 Use Cases
Academic Research: Analyze multiple sources quickly

Content Monitoring: Track and compare web content

News Analysis: Understand complex topics across sources

Learning Tool: Explore topics through multiple perspectives

🔧 Configuration
Environment Variables
Variable	Description	Default
MONGO_URI	MongoDB connection string	mongodb://localhost:27017
PORT	Server port	5005
NEWS_API_KEY	Optional News API key	(none)
Customization Options
Modify content extraction rules in extractText.js

Add new free APIs in Research.js

Customize UI themes in React components

Adjust rate limiting and timeout settings

🚨 Troubleshooting
Common Issues
URL Processing Fails

Check internet connection

Verify URLs are accessible

Some sites may block scraping

MongoDB Connection Issues

Ensure MongoDB is running

Check connection string in .env

API Rate Limiting

System automatically handles free API limits

Uses fallback analysis when APIs are busy

Getting Help
Check the browser console for error details

Review server logs for backend issues

Ensure all dependencies are installed

Verify environment variables are set

📈 Performance
Processes 3 URLs in under 10 seconds

Answers questions in 1-3 seconds

Supports up to 50 articles in history

Efficient MongoDB indexing for fast queries

🤝 Contributing
We welcome contributions! Please see our contributing guidelines:

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

Development Setup
bash
# Install all dependencies
npm run setup

# Run tests
npm test

# Build for production
npm run build
📄 License
This project is licensed under the MIT License - see the LICENSE.md file for details.

🙏 Acknowledgments


🚀 Future Roadmap
Browser Extension for one-click analysis

PDF Processing support

Advanced NLP for better understanding

Multi-language Support

API Rate Limit Dashboard

Export Functionality (PDF, CSV)

Collaborative Features for teams


#### My API limit is exhausted put Your API in .env file 

⭐ Star this repo if you find it useful!

https://via.placeholder.com/800x200/1a202c/FFFFFF?text=RockyBot+-+Intelligent+Web+Content+Analysis
