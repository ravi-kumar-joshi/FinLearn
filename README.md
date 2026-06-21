# FinLearn

<div align="center">

![FinLearn](https://img.shields.io/badge/FinLearn-Financial%20Literacy-blue)
![React](https://img.shields.io/badge/React-19.2.6-61DAFB)
![Node](https://img.shields.io/badge/Node-18+-339933)
![License](https://img.shields.io/badge/License-MIT-green)

*A gamified financial literacy platform making financial education engaging through interactive courses, XP systems, and AI assistance.*

[Features](#-features) • [Installation](#-installation) • [API](#-api-endpoints) • [Contributing](#-contributing)

</div>

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/FinLearn.git
cd FinLearn

# Install dependencies
cd server && npm install
cd ../client && npm install

# Setup environment variables (see below)
# Start the application
cd server && npm run dev    # Terminal 1
cd ../client && npm run dev  # Terminal 2
```

## ✨ Features

- **Interactive Learning** - Structured courses on budgeting, investing, saving, and debt management
- **Gamification System** - XP rewards, level progression, daily streaks, and achievement badges
- **Financial Tools** - 7 real-time calculators (budget, investment, loan, SIP, inflation, emergency fund)
- **AI-Powered Chatbot** - FinBot provides personalized finance guidance using Google Generative AI
- **Verified Certificates** - Shareable certificates with unique verification IDs
- **Admin Dashboard** - Complete course and user management interface

## 🛠 Tech Stack

### Frontend
- React 19.2.6 + Vite 7.1.9
- Tailwind CSS 4.1.17 + Material UI 6.5.0
- Redux Toolkit 2.11.1 + React Router 7.10.1
- Framer Motion 12.38.0 + Chart.js 4.5.1

### Backend
- Express.js 4.21.2 + Node.js 18+
- MongoDB 6+ + Mongoose 8.12.1
- Passport.js 0.7.0 + JWT 9.0.2
- Google Generative AI 0.24.1 + Nodemailer 6.10.0

## 📦 Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB v6 or higher (local or MongoDB Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FinLearn.git
   cd FinLearn
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables** (see below)

5. **Start MongoDB** (if using local instance)

## 🔐 Environment Variables

### Server Configuration (`server/.env`)
```env
# Database
MONGO_URL=mongodb://localhost:27017/finlearn

# Server
PORT=5050
NODE_ENV=development

# Authentication
ACCESS_TOKEN_KEY=your_access_token_secret
REFRESH_TOKEN_KEY=your_refresh_token_secret
SESSION_SECRET=your_session_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# AI Integration
GOOGLE_AI_API_KEY=your_google_ai_api_key

# CORS
ORIGIN=http://localhost:5173
```

### Client Configuration (`client/.env.local`)
```env
VITE_API_URL=http://localhost:5050
```

## 🏃 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend Server
cd server
npm run dev

# Terminal 2 - Frontend Server
cd client
npm run dev
```

- **Backend**: http://localhost:5050
- **Frontend**: http://localhost:5173

### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start backend
cd server
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /user/register` - Create new account
- `POST /user/login` - User login
- `GET /user/profile` - Get user profile
- `POST /user/logout` - User logout

### Courses
- `GET /courses` - List all courses
- `GET /courses/:id` - Get course details
- `PUT /courses/:id/lesson/:lessonId/complete` - Complete lesson
- `PUT /courses/:id/module/:moduleId/complete` - Complete module

### Chatbot
- `POST /api/chat` - Send message to FinBot

### Certificates
- `GET /certificates/verify/:id` - Verify certificate

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm install -g vercel
vercel
```

### Backend (Heroku/Render)
```bash
cd server
npm install --production
# Deploy to your preferred platform
```

### Database (MongoDB Atlas)
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your server IP addresses
3. Add connection string to environment variables

## 📁 Project Structure

```
FinLearn/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── Components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main application
│   └── package.json
├── server/                 # Express Backend
│   ├── controllers/        # Route handlers
│   ├── models/             # Database schemas
│   ├── routes/             # API routes
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

- **GitHub**: [yourusername/FinLearn](https://github.com/yourusername/FinLearn)
- **Issues**: [Report Bug](https://github.com/yourusername/FinLearn/issues)

---

<div align="center">

**Built with ❤️ for Financial Literacy**

</div>
