# InterviewIQ AI - Production-Grade AI Interview Prep Platform

InterviewIQ AI is an industry-level, secure, and scalable AI-powered interview preparation platform built using MERN (MongoDB, Express, React, Node.js) and the Google Gemini Multimodal AI Engine.

---

## 🚀 Key Features

*   **Secure Authentication**: JWT-based authentication with bcrypt hashing, password change tokens, and Joi input validation schema guards.
*   **Resume Handling**: Automated PDF upload pipeline with secure metadata limits and text extraction capabilities.
*   **AI Mock Interview Engine**: Gemini-powered question generation and real-time answer grading using structured JSON schemas.
*   **Voice Answer Submission**: Multimodal speech-to-text processing; users can record answers which are transcribed and evaluated by Gemini.
*   **Analytics Dashboard**: High-performance MongoDB aggregation pipelines displaying performance metrics, timeline progress, category breakdowns, and strengths/weaknesses diagnosis.
*   **Smart Caching Layer**: Custom response interceptor middleware with TTL expiration rules to optimize database queries.

---

## 📂 Project Structure

```
├── client/                 # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/            # Axios HTTP client with Bearer Token interceptor
│   │   ├── context/        # Global Auth & Toast context providers
│   │   ├── pages/          # Landing, Dashboard, Login, Register views
│   │   └── components/     # Reusable uploader and UI widgets
├── server/                 # Express REST API (MVC Pattern)
│   ├── config/             # DB and configuration variables
│   ├── controllers/        # Controllers (Auth, Resume, AI, Session, Analytics)
│   ├── middleware/         # Security headers, sanitizers, error bounds, cache
│   ├── models/             # Mongoose Schemas (User, Interview)
│   ├── prompts/            # JSON response schemas and prompt templates
│   ├── routes/             # API routes
│   ├── services/           # PDF parsers, Gemini SDK, Cache service
│   ├── utils/              # Winston loggers, AppError builders
│   └── validations/        # Joi schema validations
└── package.json            # Root orchestrator scripts
```

---

## 🛠️ Setup Instructions

### 1. Prerequisites
Ensure you have the following installed on your system:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB database)
*   Google AI Studio [Gemini API Key](https://aistudio.google.com/)

### 2. Environment Variables Configuration
Create a `.env` file in the workspace root directory:
```env
# Server settings
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai_interview_db

# JWT settings
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=7d

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
AI_PROVIDER=gemini

# File uploads
MAX_FILE_SIZE_MB=5
UPLOAD_DIR=uploads

# Client URL (CORS)
CLIENT_URL=http://localhost:5173
```

### 3. Installation
Install all dependencies for both root, client, and server workspaces in one command:
```bash
npm run install:all
```

### 4. Running the Application
Launch both the backend server and React Vite client concurrently in development mode:
```bash
npm run dev
```

---

## 📡 API Reference Specifications

All API routes are prefixed with `/api/v1`.

### 🔐 Authentication Endpoints

#### `POST /auth/register`
*   **Description**: Register a new user profile.
*   **Payload**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "securepassword123",
      "targetRole": "Frontend Engineer"
    }
    ```

#### `POST /auth/login`
*   **Description**: Authenticate user and return JWT.
*   **Payload**:
    ```json
    {
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```

#### `GET /auth/me`
*   **Description**: Get current user profile details.
*   **Headers**: `Authorization: Bearer <token>`

---

### 📄 Resume Pipeline Endpoints

#### `POST /resumes/upload`
*   **Description**: Upload and parse PDF resume.
*   **Headers**: `Authorization: Bearer <token>`
*   **Payload**: Multipart Form-data (`key: resume`, type: `File (PDF)`)

---

### 📅 Mock Interview Session Endpoints

#### `POST /interviews/start`
*   **Description**: Start mock interview session and generate AI questions.
*   **Headers**: `Authorization: Bearer <token>`
*   **Payload**:
    ```json
    {
      "targetRole": "Node.js Developer",
      "difficulty": "Medium",
      "count": 5
    }
    ```

#### `POST /interviews/:id/submit-answer`
*   **Description**: Submit text answer and grade it.
*   **Headers**: `Authorization: Bearer <token>`
*   **Payload**:
    ```json
    {
      "questionId": "q-1",
      "userAnswer": "Middlewares are functions that have access to the request and response objects."
    }
    ```

#### `POST /interviews/:id/submit-voice-answer`
*   **Description**: Submit voice recording. Backend transcribes using Gemini speech-to-text, grades the response, and deletes files.
*   **Headers**: `Authorization: Bearer <token>`
*   **Payload**: Multipart Form-data (`key: audio`, type: `audio/webm` or similar), along with text field `questionId`.

#### `POST /interviews/:id/complete`
*   **Description**: Mark interview completed, average scores, and finalize feedback scorecard.
*   **Headers**: `Authorization: Bearer <token>`

#### `GET /interviews/history`
*   **Description**: Retrieve history list.
*   **Headers**: `Authorization: Bearer <token>`

#### `GET /interviews/:id`
*   **Description**: Retrieve detailed session scorecard.
*   **Headers**: `Authorization: Bearer <token>`

---

### 📊 Analytics Endpoints

#### `GET /analytics/dashboard`
*   **Description**: Retrieve aggregated stats. Cached for 5 minutes (invalidates on starting/completing interviews).
*   **Headers**: `Authorization: Bearer <token>`
