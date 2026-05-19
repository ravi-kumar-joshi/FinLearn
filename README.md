# FinLearn Academy: Financial Literacy Hub
**A Gamified, Full-Stack Educational Ecosystem for Modern Finance**

---

## 🚀 Project Vision
**FinLearn** is a comprehensive educational platform designed to bridge the financial literacy gap. Unlike traditional learning management systems, FinLearn focuses on **bite-sized, high-retention modules** combined with a robust **gamification engine** that rewards consistent progress with XP, streaks, and verified certificates.

### Core Pillars
- **Personalized Onboarding:** A cinematic, multi-step flow that tailors the curriculum to user experience levels (Beginner to Expert) and specific goals (Wealth Building, Debt Freedom, etc.).
- **Gamified Learning:** Real-time XP tracking, leaderboard rankings, and learning streaks to drive daily engagement.
- **Verified Achievements:** A public certificate verification system allowing users to showcase their credentials securely.
- **Advanced Account Control:** A centralized settings hub for managing security (2FA), regional preferences, and notification granularities.

---

## ✨ Key Technical Features

### 🛠️ Advanced Profile & Settings Hub
A unified management console built with a tabbed interface and Framer Motion for fluid transitions:
- **Live Profile Updates:** Real-time avatar preview and base64 image uploading.
- **Security Center:** Comprehensive password management with field-level visibility toggles and placeholders for 2FA integration.
- **Notification Granularity:** Categorized toggles (Learning Activity, Financial Insights, Marketing) with persistent local state.
- **Regional Customization:** Support for multi-currency (INR, USD, etc.) and localized timezones.

### 🧭 Intelligent Onboarding Flow
A 7-step guided journey that captures user data to personalize the learning path:
- **Experience Leveling:** 🌱 Beginner to 🧠 Advanced selection with tailored card UI.
- **Goal Mapping:** Multi-select functionality to prioritize specific financial interests.
- **Path Preview:** Instant preview of the first 3 modules curated based on onboarding input.

### 🏆 Gamification Infrastructure
- **Real-time Polling:** The `useRealtimeXP` hook implements a safe polling mechanism with memory leak prevention to keep user stats (XP, levels) synchronized with the server.
- **Dynamic Leaderboard:** Automated fetching of global rankings and current user position.
- **Modular Progress:** `courses.js` logic manages per-lesson completion, module unlocking, and automated XP rewards.

### 🔒 Enterprise-Grade Backend
- **Resilient Connections:** MongoDB integration featuring graceful shutdown handling (`SIGINT`) and automated connection state monitoring.
- **Certificate Verification:** A public route (`/verify/:id`) leveraging `react-helmet-async` for SEO and OpenGraph optimization, ensuring certificates shared on LinkedIn show rich previews.
- **Seedable Demo Environment:** Dedicated scripts to populate the database with comprehensive course data for development and QA.

---

## 💻 Tech Stack Highlights

### Frontend
- **UI Core:** React 19 + Material UI (MUI) 6
- **Styling:** Tailwind CSS 4 + Bootstrap 5 (Grid)
- **Animations:** Framer Motion 12
- **State & Logic:** Custom Hooks + React Context
- **Data Fetching:** Abstraction over Fetch API with robust error handling

### Backend
- **Runtime:** Node.js + Express
- **Persistence:** MongoDB + Mongoose
- **Auth:** Passport.js (Google OAuth 2.0) + JWT (HttpOnly Cookies)
- **Security:** Bcrypt, Rate Limiting, and CORS protection

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
MONGO_URL=your_mongodb_connection_string
ACCESS_TOKEN_KEY=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
MAIL_USER=your_gmail
MAIL_PASSWORD=your_app_password
```

### 2. Installation
```bash
# Install Backend Dependencies
cd server && npm install

# Install Frontend Dependencies
cd ../client && npm install
```

### 3. Database Seeding
Populate your local database with demo courses to get started immediately:
```bash
cd server
npm run seed
```

---

## 📂 Project Structure

```bash
FullProject/
├── client/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Auth/           # Onboarding & Auth UI
│   │   │   └── Dashboard/      # Navigation & SideBar
│   │   ├── hooks/              # Real-time XP & General Hooks
│   │   ├── pages/              # Profile, Verify, Dashboard Pages
│   │   └── utils/              # API wrappers & HTTP utilities
└── server/
    ├── models/                 # Course & User Schema
    ├── routes/                 # Courses & Auth API
    ├── scripts/                # Seeding & Migration Tools
    └── utils/                  # DB Connection & Passport Logic
```

---

## 👨‍💻 Development Team
- **Ravi Kumar** - Lead Developer (BCA 2025-2026)
- **College:** Rama Institute Of Higher Education

*This project is submitted in partial fulfillment of the requirements for the degree of Bachelor of Computer Application.*

---

## 🗄️ Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String (required, trim),
  email: String (required, unique, lowercase),
  password: String (hashed, optional for OAuth users),
  profileImage: String (base64 or URL),
  
  // Password Reset OTP
  password_otp: {
    otp: Number,
    time: Number (expiry timestamp),
    attempts: Number (max 5),
    last_attempt_time: Date,
    status: Boolean
  },
  
  // Email Change OTP
  email_otp: {
    otp: Number,
    time: Number,
    newEmail: String,
    attempts: Number,
    last_attempt_time: Date,
    status: Boolean
  },
  
  // Gamification
  xp: {
    totalXP: Number (default: 0),
    currentXP: Number (default: 0),
    level: Number (default: 1),
    maxXPForLevel: Number (default: 7500)
  },
  
  // Leaderboard Stats
  leaderboardStats: {
    completedCourses: Number,
    completionRate: Number (0-100),
    achievementCount: Number,
    streak: Number,
    rank: Number
  },
  
  // Onboarding
  onboarding: {
    completed: Boolean,
    experience: String (beginner/intermediate/advanced),
    goals: [String],
    timeCommitment: String,
    learningStyle: String,
    currentSituation: String,
    priority: String,
    completedAt: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

### Implemented Security Measures

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Minimum 6 characters requirement
   - Never stored or transmitted in plain text

2. **Token-Based Authentication**
   - JWT tokens with expiration (7 days access, 30 days refresh)
   - HTTP-only cookies (prevents XSS attacks)
   - SameSite cookie attribute (prevents CSRF)
   - Secure flag in production (HTTPS only)

3. **Rate Limiting**
   - 5 OTP attempts per 24 hours
   - Automatic reset after time window
   - Prevents brute force attacks

4. **Input Validation**
   - Email format validation
   - Required field checks
   - String trimming and sanitization
   - MongoDB injection prevention (via Mongoose)

5. **CORS Protection**
   - Configured allowed origins
   - Credentials flag for cross-origin requests
   - Environment-based configuration

6. **Session Security**
   - Express session for OAuth
   - 24-hour session expiry
   - Secure session secrets

---

## 📸 Screenshots

### Landing Page
![Landing Page](./client/public/1.png)
*Modern, responsive homepage with hero section and course previews*

### Dashboard
![Dashboard](./client/public/2.png)
*User dashboard showing XP progress, statistics, and course suggestions*

### Authentication
![Login](./client/public/3.png)
*Clean login interface with Google OAuth option*

### Financial Literacy Module
![Course Content](./client/public/FinancialLiteracy.png)
*Interactive course content with progress tracking*

---

## 📂 Project Structure

```
FullProject/
│
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   │   ├── favicon.ico
│   │   └── images...
│   │
│   ├── src/                         # Source files
│   │   ├── Components/              # Reusable components
│   │   │   ├── Auth/                # Authentication components
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgetPassword.jsx
│   │   │   │   ├── Verification.jsx
│   │   │   │   ├── NewPassword.jsx
│   │   │   │   ├── Onboarding.jsx
│   │   │   │   └── auth.css
│   │   │   │
│   │   │   ├── Dashboard/           # Dashboard widgets
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── SideBar.jsx
│   │   │   │   ├── CourseCard.jsx
│   │   │   │   ├── CourseSuggestions.jsx
│   │   │   │   ├── DailyStreak.jsx
│   │   │   │   ├── CompletedCourses.jsx
│   │   │   │   ├── BudgetCalculator.jsx
│   │   │   │   ├── InvestmentCalculator.jsx
│   │   │   │   ├── LoanCalculator.jsx
│   │   │   │   └── SavingsCalculator.jsx
│   │   │   │
│   │   │   └── Home/                # Landing page sections
│   │   │       ├── HeroSection.jsx
│   │   │       ├── AboutSection.jsx
│   │   │       ├── PricingSection.jsx
│   │   │       └── Footer.jsx
│   │   │
│   │   ├── pages/                   # Full page components
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── AllCourses.jsx
│   │   │   ├── Tools.jsx
│   │   │   └── Progress.jsx
│   │   │
│   │   ├── layouts/                 # Layout wrappers
│   │   │   ├── AuthLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useGeneral.js
│   │   │
│   │   ├── utils/                   # Helper functions
│   │   │   ├── apis.js              # API endpoints
│   │   │   ├── httpAction.js        # HTTP utilities
│   │   │   └── loginWithGoogle.js   # Google login helper
│   │   │
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   │
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   └── README.md
│
└── server/                          # Backend Express Application
    ├── controllers/                 # Business logic
    │   ├── login.js
    │   ├── register.js
    │   ├── getUserProfile.js
    │   ├── updateProfile.js
    │   ├── forgotPassword.js
    │   ├── verifyOtp.js
    │   ├── updatePassword.js
    │   ├── sendEmailOtp.js
    │   ├── verifyEmailOtp.js
    │   ├── saveOnboarding.js
    │   ├── skipOnboarding.js
    │   ├── getLeaderboard.js
    │   ├── uploadProfileImage.js
    │   └── logout.js
    │
    ├── middlewares/                 # Express middleware
    │   ├── auth.js                  # JWT verification
    │   ├── errorHandler.js          # Global error handling
    │   └── googleAuth.js            # Google OAuth handler
    │
    ├── models/                      # Mongoose schemas
    │   └── User.js                  # User model
    │
    ├── routes/                      # API routes
    │   └── auth.js                  # Authentication routes
    │
    ├── utils/                       # Utility functions
    │   ├── generateToken.js         # JWT token generation
    │   ├── getConnection.js         # MongoDB connection
    │   ├── googleStrategy.js        # Passport Google OAuth
    │   └── sendMail.js              # Email service
    │
    ├── server.js                    # Main server file
    ├── package.json                 # Backend dependencies
    └── .env                         # Environment variables (not in repo)
```

---

## 👨‍💻 Development Team

### Project Information
- **Course:** BCA
- **College:** Rama Institute Of Higher Education , Kiratpur
- **Academic Year:** 2025-2026
- **Project Type:** Full Stack Web Development

### Team Members
- **Ravi Kumar** - Lead Developer (Frontend & Backend)
<!-- - **[Team Member 2]** - Backend Developer (if applicable)
- **[Team Member 3]** - Frontend Developer (if applicable) -->

### Project Supervisor
- **[Supervisor Name]** - [Title]

---

## 🎓 Academic Declaration

This project is submitted in partial fulfillment of the requirements for the degree of **Bachelor of Computer Application** at **Rama Institute Of Higher Education**.

### Originality Statement
This is an original work developed by the undersigned student(s). All external sources, libraries, and code snippets used in this project have been properly acknowledged and cited.

### Acknowledgments
We would like to express our gratitude to:
- Our project supervisor for valuable guidance
- The department faculty for their support
- Online resources and documentation (React, Express, MongoDB)
- Open-source contributors whose libraries made this project possible

---

## 📚 References & Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Material-UI Components](https://mui.com/material-ui/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Tutorials & Guides
- JWT Authentication Best Practices
- OAuth 2.0 Implementation Guide
- MongoDB Schema Design Patterns
- React Hooks Documentation

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5050
```
**Solution:** Change port in `.env` file or kill the process
```bash
# Find process using port 5050
netstat -ano | findstr :5050

# Kill process
taskkill /PID <PID> /F
```

#### 3. Google OAuth Not Working
**Solution:** Verify callback URL in Google Cloud Console matches exactly:
`http://localhost:5050/auth/google/callback`

#### 4. Email Not Sending
**Solution:** 
- Enable "Less secure app access" in Gmail settings (for development)
- Or use App-Specific Password
- Check MAIL_USER and MAIL_PASSWORD in `.env`

---

## 🚀 Future Enhancements

### Planned Features
1. **Advanced Course Management**
   - Video lessons integration
   - Quizzes and assessments
   - Certificate generation

2. **Social Features**
   - Friend system
   - Discussion forums
   - Study groups

3. **Mobile Application**
   - React Native mobile app
   - Push notifications
   - Offline mode

4. **Premium Features**
   - Payment gateway integration
   - Subscription plans
   - Premium courses

5. **Analytics Dashboard**
   - Learning analytics
   - Performance insights
   - Personalized recommendations

6. **AI-Powered Features**
   - Chatbot for queries
   - Smart course recommendations
   - Adaptive learning paths

---

## 📄 License

This project is created for academic purposes. All rights reserved.

**Note:** This project is for educational purposes only. Commercial use requires proper licensing and permissions.

---

## 📞 Contact Information

For questions or support regarding this project:
- **Email:** [your.email@college.edu]
- **GitHub:** [your-github-profile]
- **LinkedIn:** [your-linkedin-profile]

---

## 🙏 Conclusion

The Financial Literacy Hub demonstrates proficiency in:
- Full-stack web development
- RESTful API design
- Database management
- Authentication and security
- Modern frontend frameworks
- Responsive design principles
- Software engineering best practices

This project showcases the ability to build a complete, production-ready web application that solves real-world problems.

---

**Last Updated:** March 2026  
**Version:** 1.0.0

---

*Thank you for reviewing our project!* 🎉
#   F i n L e a r n  
 