# Antler - AI-Powered Document Analysis Application

Antler is a comprehensive Node.js-based application that provides AI-powered document analysis and file upload capabilities. The application integrates with MongoDB for database storage, Redis for caching, and Cloudinary for file management, offering a robust platform for AI-based document processing.

## Live Demo

Access the live application: [https://antler-aiml.onrender.com](https://antler-aiml.onrender.com)

## Features

- **AI-Powered Document Analysis**:
  - Extract key entities (names, dates, topics)
  - Generate section-by-section summaries
  - Evaluate document sentiment
  - Chain-of-prompts approach for enhanced analysis

- **File Management**:
  - Upload documents (PDF, TXT) for analysis
  - Secure file storage with Cloudinary integration
  - Multer middleware for handling file uploads

- **Performance Optimization**:
  - Redis caching for improved response times
  - Rate limiting to prevent API abuse
  - Scheduled tasks using Node-Cron

- **Security & Integration**:
  - CORS support for secure cross-origin requests
  - Environment variable management with dotenv
  - Secure API key handling

## Project Structure

```
Antler/
├── .env                     # Environment variables (not included in repo)
├── .gitignore               # Ignored files and folders
├── package.json             # Project metadata and dependencies
├── server.js                # Main entry point of the application
├── cloudinary/              
│   └── cloudinary.js        # Cloudinary configuration
├── config/
│   └── db.js                # Database connection setup
├── controller/
│   ├── ai.controller.js     # Controller logic for AI-based APIs
│   └── upload.controller.js # Controller logic for file uploads
├── middleware/              
│   └── (empty)              # Placeholder for custom middleware
├── models/
│   └── upload.model.js      # Mongoose schema for uploaded files
├── public/
│   └── images/              # Directory for uploaded files
├── redis/
│   └── redis.connection.js  # Redis connection setup
├── routes/
│   ├── ai.routes.js         # API routes for AI-based operations
│   └── upload.routes.js     # API routes for file uploads
└── client/                  # React frontend application
    ├── src/
    │   ├── components/      # UI components
    │   ├── pages/           # Page components
    │   └── utils/           # Utility functions
    └── public/              # Static assets
```

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for document storage
- **Mongoose**: MongoDB object modeling
- **Redis**: In-memory data store for caching
- **Cloudinary**: Cloud-based image and file management
- **Multer**: Middleware for handling file uploads
- **dotenv**: Environment variable management
- **express-rate-limit**: Rate limiting middleware
- **CORS**: Cross-origin resource sharing
- **Node-Cron**: Task scheduling


### AI Integration
- **OpenAI API**: For AI-powered document analysis
- **Chain-of-Prompts**: Sequential prompt architecture for comprehensive analysis

## Prerequisites

- Node.js (v16 or later)
- MongoDB (local or cloud instance)
- Redis (local or cloud instance)
- npm (Node Package Manager)
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shaniyadav99/antler-aiml.git
   cd antler-aiml
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```ini
   PORT=5000
   MONGODB_URI_PRODUCTION=<your-mongodb-connection-string>
   REDIS_HOST=<your-redis-host>
   REDIS_PORT=<your-redis-port>
   REDIS_PASS=<your-redis-password>
   AI_KEY=<your-openai-api-key>
   FRONTEND_URL=<your-frontend-url>
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   ```

5. Start the development server:
   ```bash
   # Run backend
   npm run dev
   
   # In a separate terminal, run frontend
   cd client
   npm start
   ```

## API Endpoints

### Document Analysis

**POST** `/api/analyze`
- **Description**: Analyze uploaded documents using AI
- **Request Body**:
  ```json
  {
    "fileUrl": "URL of the uploaded document",
    "fileName": "Name of the file"
  }
  ```
- **Response**:
  - 200 OK: Analysis results including entities, summaries, and sentiment
  - 400 Bad Request: Invalid input
  - 500 Internal Server Error: API or server error

### File Upload

**POST** `/api/upload`
- **Description**: Upload a document for analysis
- **Request**: Multipart form-data with a file field named `file`
- **Response**:
  - 201 Created: File uploaded successfully with URL
  - 400 Bad Request: Invalid file type or missing file
  - 500 Internal Server Error: Upload error

### AI Processing

**POST** `/api/process`
- **Description**: Process text using the OpenAI API
- **Request Body**:
  ```json
  {
    "message": "Text to be processed"
  }
  ```
- **Response**:
  - 200 OK: AI-generated response
  - 429 Too Many Requests: Rate limit exceeded
  - 500 Internal Server Error: API or server error

## AI Prompt Design & Rationale

Antler uses a chain-of-prompts approach for document analysis, with each prompt building on the results of the previous one:

### 1. Entity Extraction Prompt
```
Extract key entities from the following document:
- People: List all names of individuals mentioned
- Organizations: List all companies, institutions, or groups
- Dates: List all dates or time periods mentioned
- Locations: List all geographical locations
- Topics: Identify 3-5 main topics discussed

Document: {document_text}
```

**Rationale**: This prompt is designed to be specific about what types of entities to extract, which helps the AI focus on relevant information rather than returning everything. The categorization makes the results more structured and easier to display in the UI.

### 2. Section Summary Prompt
```
Based on the entities identified ({entities}), provide a concise one-sentence summary for each major section of the following document. Identify section breaks by headings, paragraph groups, or topic shifts.

Document: {document_text}
```

**Rationale**: By feeding the entities from the first prompt, we give the AI context about what's important in the document. This helps it focus on the most relevant content when creating summaries. The one-sentence constraint ensures brevity.

### 3. Sentiment Analysis Prompt
```
Analyze the overall sentiment of this document based on the extracted entities ({entities}) and section summaries ({summaries}). Provide:
1. A sentiment score from -10 (extremely negative) to +10 (extremely positive)
2. Three supporting quotes from the document
3. A brief explanation of your assessment

Document: {document_text}
```

**Rationale**: This prompt builds on both previous results to provide context for sentiment analysis. The numerical scale gives a quantifiable result that's easy to visualize. Requesting supporting quotes adds evidence to the assessment, making it more trustworthy.

## Error Handling & Fallbacks

The application implements several strategies to ensure reliability:

1. **Exponential Backoff**: If an AI API call fails, the system retries up to 2 times with increasing time intervals between attempts.

2. **Fallback Analysis**: If the advanced analysis chain fails, the system falls back to a simpler, single-prompt analysis.

3. **Partial Results**: The UI can display partial results if some parts of the analysis chain succeed while others fail.

4. **Friendly Error Messages**: Users receive clear, non-technical explanations when errors occur, while detailed logs are maintained for debugging.

5. **Redis Caching**: Previously analyzed documents are cached to reduce API calls and provide faster responses for repeated analyses.

## Deployment

The application is deployed on Render and can be accessed at:
[https://antler-aiml.onrender.com](https://antler-aiml.onrender.com)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- The MongoDB, Redis, and Cloudinary teams for their excellent services
- All contributors who have helped improve this project