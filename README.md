<div align="center">

# FinLearn

### A Gamified Financial Literacy Web Application

> *FinLearn teaches the basics of personal finance through interactive courses, gamified features, and an AI-powered chatbot — making financial education actually fun.*

---

**Built With:** React 19 · Express.js · MongoDB · Tailwind CSS · Passport.js · OpenAI

[Features](#4-key-features--implementation) · [Screenshots](#screenshots) · [Tech Stack](#2-tech-stack--system-requirements) · [API Docs](#6-api-documentation) · [Deployment](#8-deployment)

</div>

---

## 📑 TABLE OF CONTENTS

| # | Section | Description |
|---|---------|-------------|
| 1 | [Introduction & Project Overview](#1-introduction--project-overview) | Purpose, problem statement, and objectives |
| 2 | [Tech Stack & System Requirements](#2-tech-stack--system-requirements) | Languages, frameworks, libraries, and hardware |
| 3 | [System Design & Methodology](#3-system-design--methodology) | Architecture, file structure, and key modules |
| 4 | [Key Features & Implementation](#4-key-features--implementation) | Core functionalities and internal workings |
| 5 | [Database Design](#5-database-design) | Schema overview and entity relationships |
| 6 | [API Documentation](#6-api-documentation) | REST endpoint reference |
| 7 | [Security Measures](#7-security-measures) | Authentication, authorization, and data protection |
| 8 | [Deployment](#8-deployment) | Hosting and environment configuration |
| 9 | [Screenshots](#screenshots) | Application interface walkthrough |
| 10 | [User Flow](#user-flow) | End-to-end user journey |
| 11 | [Conclusion & Future Scope](#11-conclusion--future-scope) | Technical conclusion and enhancement roadmap |
| 12 | [Bibliography / References](#12-bibliography--references) | Frameworks, documentation, and academic sources |

---

## 1. INTRODUCTION & PROJECT OVERVIEW

### 1.1 Problem Statement

Most young adults today have no idea how to manage their money. They start earning without knowing the basics — budgeting, saving, investing, or even how credit works. According to the **Reserve Bank of India's National Strategy for Financial Education (NSFE) 2020-2025**, only **27% of Indian adults** are financially literate. Traditional finance courses are either too expensive, too boring, or just not accessible to most people. We needed something that actually makes learning about money engaging and practical.

### 1.2 Proposed Solution

**FinLearn** is a full-stack web application that makes learning about personal finance engaging and practical. It combines structured courses on topics like budgeting, saving, investing, and debt management with gamified features — think XP points, levels, streaks, and badges — to keep users motivated. Here's what makes it different:

| What It Does | How It Works |
|-------------|-------------|
| **Structured Learning** | Modular courses on Budgeting, Savings, Investing, Debt Management, Retirement, and Tax — organized from beginner to advanced |
| **Gamification** | XP system, level progression, daily streaks, achievement badges, and a global leaderboard that keeps you coming back |
| **Financial Tools** | Seven real-time calculators (Budget, Investment, Loan, Savings, SIP, Inflation, Emergency Fund) so you can apply what you learn right away |
| **AI Chatbot (FinBot)** | An AI assistant that answers your finance questions and suggests courses based on what you're learning |
| **Verified Certificates** | Unique verification IDs (`FL-{course}-{user}`) with one-click sharing to LinkedIn, Twitter/X, Facebook, and WhatsApp |

### 1.3 What We Set Out to Build

1. A self-paced financial education platform with real course content — not just slides, but actual lessons with multimedia and quizzes.
2. A gamification system (XP, levels, streaks, badges) that makes learning about money feel less like a chore and more like a game.
3. Practical financial calculators that work in real time, so users can plan their budget, calculate EMIs, or estimate investment returns while they learn.
4. An AI chatbot (FinBot) that acts like a personal finance tutor — answering questions and recommending courses as you go.
5. An admin panel for managing courses, users, and platform analytics.
6. Shareable certificates with unique verification IDs that users can proudly post on LinkedIn or WhatsApp.

---

## 2. TECH STACK & SYSTEM REQUIREMENTS

### 2.1 Technology Stack

#### Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.2.x | Component-based UI rendering with hooks |
| **Build Tool** | Vite | 7.x | Development server with HMR and production bundling |
| **Routing** | React Router DOM | 7.x | Client-side SPA navigation with nested routes |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS framework with JIT compilation |
| **UI Library** | Material UI (MUI) | 6.x | Pre-built accessible components |
| **UI Primitives** | shadcn/ui + Radix UI | 4.x / 1.4.x | Accessible, unstyled component primitives |
| **Animation** | Framer Motion | 12.x | Declarative animations, gestures, and layout transitions |
| **Charts** | Recharts / Chart.js | 3.x / 4.x | Data visualization for analytics dashboards |
| **State Management** | Redux Toolkit | 2.x | Centralized state for complex application flows |
| **Form Handling** | Formik + Yup | 2.4.x / 1.7.x | Form state management and schema-based validation |
| **HTTP Client** | Axios + Fetch API | 1.7.x | API communication with credential-based cookies |
| **Notifications** | React Hot Toast | 2.x | Non-intrusive toast-based user feedback |
| **Icons** | Lucide React | 0.556.x | Consistent, tree-shakeable SVG icon system |
| **Markdown** | react-markdown + KaTeX | 10.x / 0.16.x | Markdown rendering with LaTeX math support |

#### Backend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Express.js | 4.x | REST API server and middleware pipeline |
| **Runtime** | Node.js | 18+ | Server-side JavaScript execution environment |
| **Database** | MongoDB | 6+ | NoSQL document-oriented database |
| **ODM** | Mongoose | 8.x | Schema-based object modeling for MongoDB |
| **Authentication** | Passport.js | 0.7.x | Pluggable authentication middleware |
| **OAuth** | passport-google-oauth20 | 2.x | Google OAuth 2.0 strategy |
| **Token Management** | jsonwebtoken (JWT) | 9.x | Signed token generation and verification |
| **Password Hashing** | bcrypt | 5.x | Salted password hashing (10 rounds) |
| **Session Management** | express-session | 1.18.x | Server-side session middleware |
| **Email Service** | Nodemailer | 6.x | SMTP-based OTP and verification emails |
| **AI Integration** | OpenAI SDK (OpenRouter) | 6.x | Conversational AI for FinBot |
| **PDF Generation** | PDFKit / jsPDF / html2canvas | Various | Certificate PDF rendering |
| **Cookie Parsing** | cookie-parser | 1.4.x | HTTP cookie extraction middleware |
| **CORS** | cors | 2.8.x | Cross-Origin Resource Sharing middleware |

### 2.2 System Requirements

| Requirement | Minimum Specification |
|-------------|----------------------|
| **Operating System** | Windows 10+, macOS 12+, or Ubuntu 20.04+ |
| **Node.js** | v18.0.0 or higher |
| **MongoDB** | v6.0+ (local instance or MongoDB Atlas cloud) |
| **RAM** | 4 GB minimum; 8 GB recommended |
| **Storage** | 500 MB for node_modules and database |
| **Browser** | Chrome 90+, Firefox 90+, Edge 90+, Safari 15+ |
| **Network** | Internet connection for OAuth, AI API, and email services |

### 2.3 Environment Variables

Configured in `server/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URL` | MongoDB connection string | Yes |
| `PORT` | Server listening port (default: `5050`) | No |
| `NODE_ENV` | Environment mode (`development` / `production`) | Yes |
| `ACCESS_TOKEN_KEY` | Secret key for signing JWT access tokens | Yes |
| `REFRESH_TOKEN_KEY` | Secret key for signing JWT refresh tokens | Yes |
| `SESSION_SECRET` | Express-session cookie signing secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client identifier | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret | Yes |
| `MAIL_USER` | SMTP sender email address | Yes |
| `MAIL_PASSWORD` | SMTP sender email password / app password | Yes |
| `OPENROUTER_API_KEY` | API key for the OpenRouter AI gateway | Yes |
| `ORIGIN` | Allowed CORS origin URL | Yes |

---

## 3. SYSTEM DESIGN & METHODOLOGY

### 3.1 How It's Built

FinLearn uses a straightforward **client-server architecture** where the frontend and backend are completely separate. The React app handles everything the user sees, the Express API handles the business logic, and MongoDB stores all the data:

```
┌────────────────────────────────────┐         ┌────────────────────────────────────┐
│         CLIENT (React SPA)         │         │        SERVER (Express.js)         │
│  ──────────────────────────────    │         │  ──────────────────────────────    │
│  • React 19 + Vite 7              │         │  • RESTful API (Express 4.x)       │
│  • React Router (BrowserRouter)   │◄───────►│  • JWT + Passport.js OAuth        │
│  • Tailwind CSS + MUI 6           │  HTTPS  │  • Middleware chain                 │
│  • Framer Motion animations       │  /JSON  │  • Mongoose ODM (schema layer)     │
│  • Context API + Redux Toolkit    │         │  • Centralized error handling       │
│  • Dev server: localhost:5173     │         │  • Production: localhost:5050       │
└────────────────────────────────────┘         └──────────────────┬─────────────────┘
                                                                   │
                                                                   ▼
                                                   ┌───────────────────────────────┐
                                                   │      MongoDB Database         │
                                                   │  ─────────────────────────    │
                                                   │  • Users (auth + profile)     │
                                                   │  • Courses (content + quiz)   │
                                                   │  • UserProgress (tracking)    │
                                                   │  • ChatSessions (AI memory)   │
                                                   └───────────────────────────────┘
```

### 3.2 Design Patterns We Used

Here are the main patterns and approaches we followed to keep the codebase clean and maintainable:

| Pattern | Where Applied | Benefit |
|---------|--------------|---------|
| **MVC-inspired** | Backend (Models → Controllers → Routes) | Clean separation of data, logic, and routing |
| **Component-Based** | Frontend (React functional components) | Reusable, testable UI building blocks |
| **Context Provider** | `CourseContext` wraps course pages | Eliminates prop drilling for deep component trees |
| **Middleware Chain** | `auth` → `adminOnly` → controller | Composable request processing pipeline |
| **Repository** | Mongoose models with indexes | Abstracts database operations with validation |
| **Route Guard** | `Super` component on protected routes | Centralized authentication + onboarding checks |
| **Custom Hooks** | `useRealtimeXP`, `useSidebarOpen` | Encapsulated, reusable stateful logic |

### 3.3 Project Directory Structure

```
FullProject/
│
├── client/                              # ── React Frontend (Vite) ──
│   ├── public/                          #    Static assets (images, favicons, manifests)
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Auth/                   #    Login, Register, OTP, Onboarding, Super (route guard)
│   │   │   ├── Chatbot/                #    FinBot AI conversational chat interface
│   │   │   ├── Dashboard/              #    Navbar, SideBar, CourseCard, XP Bar, Quiz, LessonView
│   │   │   ├── FinTools/               #    7 financial calculators (Budget, SIP, Loan, etc.)
│   │   │   ├── Home/                   #    Landing page sections (Hero, About, Testimonials)
│   │   │   ├── Shared/                 #    Reusable UI components across modules
│   │   │   └── ui/                     #    Base UI primitives (shadcn/ui)
│   │   ├── admin/                      #    Separate admin SPA (admin.html entry point)
│   │   │   ├── components/             #    Admin sidebar, topbar, data tables
│   │   │   ├── pages/                  #    Dashboard, Courses, Users management views
│   │   │   └── services/               #    Admin-specific API service layer
│   │   ├── context/                    #    React Context providers (CourseContext)
│   │   ├── hooks/                      #    Custom hooks (useRealtimeXP, useSidebarOpen, useGeneral)
│   │   ├── layouts/                    #    AuthLayout, AdminLayout, MainLayout wrappers
│   │   ├── pages/                      #    Route-level page components (14 pages)
│   │   ├── utils/                      #    API config, HTTP client, gamification + financial utils
│   │   ├── App.jsx                     #    Root router configuration with all routes
│   │   └── main.jsx                    #    Application entry point with providers
│   ├── admin.html                      #    Admin panel HTML entry point
│   ├── index.html                      #    Main application HTML entry point
│   ├── vite.config.js                  #    Vite config (React + Tailwind + multi-entry build)
│   └── vercel.json                     #    Vercel deployment rewrites configuration
│
├── server/                              # ── Node.js + Express Backend ──
│   ├── controllers/                    #    Route handler functions (18 controllers)
│   │   ├── login.js                    #    Email/password authentication
│   │   ├── register.js                 #    User registration with bcrypt hashing
│   │   ├── chatController.js           #    FinBot AI integration via OpenRouter
│   │   ├── getLeaderboard.js           #    Ranked user leaderboard with pagination
│   │   ├── forgotPassword.js           #    Password reset initiation (OTP generation)
│   │   ├── verifyOtp.js               #    OTP code verification
│   │   └── ... (12 more controllers)   #    Profile, onboarding, email OTP, etc.
│   ├── middlewares/                    #    Request processing middleware
│   │   ├── auth.js                     #    JWT access token verification
│   │   ├── admin.js                    #    Admin role authorization
│   │   ├── optionalAuth.js            #    Non-blocking auth for public routes
│   │   ├── errorHandler.js            #    Centralized error handling
│   │   └── googleAuth.js              #    Google OAuth callback processing
│   ├── models/                         #    Mongoose schema definitions
│   │   ├── User.js                     #    User (auth, profile, XP, onboarding, OTP)
│   │   ├── Course.js                   #    Course → Module → Lesson hierarchy
│   │   ├── UserProgress.js             #    Per-user course progress tracking
│   │   └── ChatSession.js              #    FinBot conversation history
│   ├── routes/                         #    Express route definitions
│   │   ├── auth.js                     #    16 authentication & profile endpoints
│   │   ├── courses.js                  #    Course CRUD and progress tracking
│   │   ├── admin.js                    #    Admin-only management endpoints
│   │   ├── chat.js                     #    Chatbot message endpoint
│   │   └── certificateRoutes.js        #    Certificate issuance and verification
│   ├── utils/                          #    Utility and helper modules
│   │   ├── generateToken.js            #    JWT access + refresh token generation
│   │   ├── googleStrategy.js           #    Passport.js Google OAuth configuration
│   │   ├── certificateVerify.js        #    Verification ID generation and lookup
│   │   ├── sendMail.js                 #    Nodemailer email dispatch
│   │   └── getConnection.js            #    MongoDB connection establishment
│   ├── scripts/                        #    Database seeding utilities
│   │   ├── seedAdmin.js                #    Create initial admin user
│   │   └── seedDemoCourses.js          #    Populate demo course content
│   └── src/
│       ├── app.js                      #    Express app configuration (CORS, sessions, routes)
│       └── server.js                   #    Database connection + HTTP server startup
│
└── README.md                            #    This documentation file
```

### 3.4 Two Separate Builds (User App + Admin Panel)

We set up Vite to produce **two separate builds** — one for regular users and one for admins. This way the admin panel has its own HTML entry point and doesn't share routes or authentication with the main app:

| Entry Point | Router | Purpose |
|-------------|--------|---------|
| `index.html` | `BrowserRouter` | Main user-facing SPA with all public and protected routes |
| `admin.html` | `HashRouter` | Isolated admin panel SPA with independent authentication |

This keeps things clean — the admin panel is its own thing and won't accidentally mess with the user-facing app.

---

## 4. KEY FEATURES & IMPLEMENTATION

### 4.1 Authentication (Login, Register, Google Sign-In)

**Files:** `server/controllers/login.js`, `register.js`, `middlewares/auth.js`

Here's how authentication works in FinLearn:

1. **Sign Up**: When a user registers, their password gets hashed with `bcrypt` (10 salt rounds — solid security without killing performance). We also validate the email format with regex.
2. **Login**: If the credentials check out, the server sends back two JWT tokens — an **access token** (expires in 7 days) and a **refresh token** (expires in 30 days). Both are stored in `HttpOnly` cookies, which means JavaScript can't touch them (great for security).
3. **Staying Logged In**: Every request to a protected route goes through the `auth` middleware, which grabs the access token from cookies, verifies it, and attaches the user's ID to `req.id` so controllers know who's making the request.
4. **Route Protection**: On the frontend, the `Super` component acts as a bouncer. It checks if you're actually logged in (and have completed onboarding) before letting you see dashboard pages. If not, it sends you back to login.
5. **Google OAuth**: Users can also sign in with Google. The `passport-google-oauth20` strategy handles the OAuth flow, and the callback creates a new account or logs in an existing one. New Google users get redirected to onboarding; returning users go straight to the dashboard.

### 4.2 Onboarding (First-Time Setup)

**Files:** `server/controllers/saveOnboarding.js`, `skipOnboarding.js`, `Components/Auth/Onboarding.jsx`

When new users sign up, we walk them through a quick onboarding flow to understand their needs. They answer a few questions:

- **Experience Level** — Beginner, Intermediate, or Advanced
- **Learning Goals** — Array of financial objectives (e.g., "build emergency fund", "start investing")
- **Time Commitment** — Weekly availability (1–2 hours, 3–5 hours, 6+ hours)
- **Learning Style** — Visual, Reading, Interactive, or Video preference
- **Current Financial Situation** — Free-text description
- **Priority Focus** — Primary area of financial interest

This data is stored in the `User.onboarding` subdocument and used to personalize course recommendations on your dashboard.

### 4.3 Courses, Modules, and Lessons

**Files:** `server/models/Course.js`, `server/routes/courses.js`

Courses in FinLearn are organized in a simple hierarchy — each course has modules, and each module has lessons:

```
Course
 ├── Module 1 (XP: 100, Order: 1)
 │    ├── Lesson 1.1 (XP: 20, Duration: 15 min, Content: HTML/Markdown)
 │    ├── Lesson 1.2 (XP: 20, Video URL, Resources)
 │    └── Quiz (Multiple-choice questions with explanations)
 ├── Module 2 (XP: 100, Order: 2)  [Locked until Module 1 quiz passed]
 │    └── ...
 └── Module N
```

**Progress Tracking** — Every user gets a `UserProgress` document that tracks which lessons they've finished, how much XP they've earned, quiz scores, and overall progress percentage. We auto-create this the first time someone visits a course, so there's no manual enrollment step.

### 4.4 Gamification (XP, Levels, Streaks, Badges)

**Files:** `client/src/utils/gamificationUtils.js`, `client/src/hooks/useRealtimeXP.js`

This is what makes FinLearn actually addictive (in a good way):

| Mechanic | Implementation Details |
|----------|----------------------|
| **XP System** | Lesson completion: **50 XP** · Correct quiz answer: **100 XP** · Perfect quiz score: **200 XP** |
| **Level Progression** | `Level = floor(totalXP / 1000) + 1` · Animated progress bar shows `currentXP % 1000` as percentage |
| **Streak Tracking** | Daily active tracking with multipliers: 3-day (1.25×), 5-day (1.5×), 7-day (2.0×) |
| **Achievement Badges** | 7 badge types: Perfect Score, Expert (80%+), Learner (60%+), On Fire! (7-day streak), Legend (30-day), Course Master (5 courses), Speed Runner (2-day course completion) |
| **Difficulty Scaling** | Beginner (1× XP), Intermediate (1.5× XP), Advanced (2× XP) |
| **Real-time Polling** | `useRealtimeXP` polls user profile every **5 seconds**; `useRealtimeLeaderboard` polls every **8 seconds** |

### 4.5 Leaderboard

**Files:** `server/controllers/getLeaderboard.js`

The leaderboard ranks users by total XP (default), level, or streak count. It supports pagination (up to 100 users per page) and shows where you stand compared to everyone else. The frontend polls for updates every 8 seconds, so rankings stay current while you're learning.

### 4.6 Financial Calculators (The Practical Stuff)

**Files:** `client/src/Components/FinTools/`

We built seven calculators so users can actually apply what they learn. All of them work in real time with Indian Rupee (₹) formatting and visual breakdowns:

| # | Calculator | Purpose | Key Computations |
|---|-----------|---------|-----------------|
| 1 | **Budget Calculator** | Monthly income vs. expense planning | Balance, savings rate, expense ratio, category-wise breakdown |
| 2 | **Investment Calculator** | Lump-sum investment growth projection | Compound interest with configurable rate and tenure |
| 3 | **Loan Calculator** | EMI and total interest computation | EMI formula: `P × r × (1+r)^n / ((1+r)^n − 1)` |
| 4 | **Savings Calculator** | Goal-based savings plan | Required monthly contribution for target amount |
| 5 | **SIP Calculator** | Systematic Investment Plan returns | Future value of periodic investments with compounding |
| 6 | **Inflation Calculator** | Purchasing power erosion over time | Real value adjustment using inflation rate |
| 7 | **Emergency Fund Calculator** | Recommended emergency reserve | Monthly expenses × coverage months |

All calculators use a shared `financialUtils.js` helper for INR formatting (`₹X.XX Cr`, `₹X.XX L`, `₹X.X K`) and generating custom slider styles.

### 4.7 FinBot — The AI Chatbot

**Files:** `server/controllers/chatController.js`, `client/src/Components/Chatbot/Finbotpage.jsx`

FinBot is basically a finance tutor that lives inside the app:

- **How It Works**: It uses the OpenAI SDK connected through OpenRouter. We keep the last 6 messages in a MongoDB `ChatSession` document so it remembers the conversation context.
- **What It Does**: Answers finance questions in plain English (or Hinglish if that's what you're using), recommends FinLearn courses, and includes disclaimers when giving financial advice. It won't predict stock prices — that's by design.
- **The UI**: Full-screen chat with quick-question suggestion chips, typing indicators, auto-scroll, and session persistence so your conversation is still there when you come back.
- **When Things Go Wrong**: If the API rate-limits us (429) or the key is invalid (401), we show a friendly message instead of crashing.

### 4.8 Certificates & Verification

**Files:** `server/utils/certificateVerify.js`, `server/routes/certificateRoutes.js`, `client/src/utils/certificateShare.js`

When someone finishes all modules in a course, they get a certificate with a unique verification ID in the format `FL-{courseId_last6}-{userId_last6}` (for example, `FL-A1B2C3-D4E5F6`).

- Anyone can verify a certificate by hitting `GET /certificates/verify/:verifyId` — it returns the student's name, course name, XP earned, and completion date.
- Users can share their certificates directly to LinkedIn, Twitter/X, Facebook, or WhatsApp with pre-written captions and the verification link baked in. On mobile, it uses the native share sheet.

### 4.9 Admin Panel

**Files:** `client/src/admin/`, `server/routes/admin.js`

We built a separate admin panel (accessible via `admin.html`) so admins can manage the platform without touching the user-facing app:

| Feature | Capabilities |
|---------|-------------|
| **Course CRUD** | Create, read, update, and delete courses with slug uniqueness validation |
| **User Management** | View all users, adjust XP (add/deduct), ban/unban accounts, reset user progress |
| **Dashboard Analytics** | Platform-wide enrollment metrics, user activity overview, course performance |
| **Authorization** | All routes go through `auth` + `adminOnly` middleware — if you're not an admin, you can't even see these endpoints |

---

## 5. DATABASE DESIGN

### 5.1 How the Data Connects

Here's a visual overview of how our four main collections relate to each other:

```
┌──────────────────┐         1:N          ┌───────────────────────┐
│      User         │─────────────────────►│    UserProgress        │
│                   │                      │                       │
│  _id (ObjectId)   │                      │  userId (ref → User)  │
│  name             │                      │  courseId (ref→Course)│
│  email (unique)   │                      │  overallProgress (%)  │
│  password (hash)  │                      │  totalXPEarned        │
│  profileImage     │                      │  isCompleted          │
│  xp {             │                      │  certificateIssued    │
│    totalXP        │                      │  verificationId       │
│    currentXP      │                      │  completedAt          │
│    level          │                      │  modules [            │
│    maxXPForLevel  │                      │    ├─ moduleId        │
│  }                │                      │    ├─ completed       │
│  onboarding {}    │                      │    ├─ quizScore       │
│  leaderboardStats │                      │    ├─ quizPassed      │
│  isAdmin          │                      │    └─ lessons [       │
│  status           │                      │       ├─ lessonId     │
│  createdAt        │                      │       ├─ completed    │
│  updatedAt        │                      │       ├─ xpEarned    │
└──────────────────┘                      │       └─ score        │
                                          │    ]                  │
┌──────────────────┐                      │  ]                    │
│     Course        │   1:N               └───────────────────────┘
│                   │───────────┐
│  _id (ObjectId)   │           │
│  title            │           │
│  slug (unique)    │           │
│  category         │           │
│  difficulty       │           │
│  instructor       │           │
│  totalEnrollments │           │
│  modules [        │           │
│    ├─ title       │           │
│    ├─ order       │           │
│    ├─ xpReward    │           │
│    └─ lessons [   │           │
│       ├─ title    │           │
│       ├─ content  │           │
│       ├─ videoUrl │           │
│       ├─ xpReward │           │
│       └─ quiz {}  │           │
│    ]              │           │
│  ]                │           │
└──────────────────┘           │
                               ▼
┌──────────────────┐    ┌──────────────────┐
│  ChatSession      │    │  ModuleProgress   │ (embedded in UserProgress)
│                   │    │                   │
│  sessionId        │    │  moduleId         │
│  messages [       │    │  unlocked         │
│    ├─ role        │    │  completed        │
│    ├─ content     │    │  completedAt      │
│    └─ timestamp   │    │  xpEarned         │
│  ]                │    │  quizScore        │
│  createdAt        │    │  quizPassed       │
│  updatedAt        │    └──────────────────┘
└──────────────────┘
```

### 5.2 Indexes (Making Queries Fast)

| Collection | Index | Type | Purpose |
|-----------|-------|------|---------|
| `users` | `email` | Unique | Prevent duplicate registrations |
| `courses` | `slug` | Unique | URL-friendly course identification |
| `userprogresses` | `{ userId, courseId }` | Compound Unique | One progress record per user per course |
| `userprogresses` | `verificationId` | Sparse Unique | Certificate verification lookups |

---

## 6. API DOCUMENTATION

### 6.1 Authentication & Profile Routes (`/user`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/user/register` | ✗ | Create a new user account |
| `POST` | `/user/login` | ✗ | Authenticate; returns JWT cookies |
| `GET` | `/user/logout` | ✗ | Clear authentication cookies |
| `GET` | `/user/access` | ✓ | Verify JWT validity and return auth status |
| `GET` | `/user/profile` | ✓ | Fetch the authenticated user's profile |
| `PUT` | `/user/profile` | ✓ | Update user profile fields |
| `POST` | `/user/profile/image` | ✓ | Upload or update profile image |
| `POST` | `/user/password/forget` | ✗ | Initiate password reset (sends OTP via email) |
| `POST` | `/user/otp/verify` | ✗ | Verify a one-time password |
| `GET` | `/user/otp/exp` | ✓ | Get current OTP expiry time |
| `POST` | `/user/password/update` | ✓ | Update password after OTP verification |
| `POST` | `/user/profile/email/send-otp` | ✓ | Send OTP for email address change |
| `POST` | `/user/profile/email/verify-otp` | ✓ | Verify OTP for email address change |
| `POST` | `/user/onboarding` | ✓ | Save onboarding preferences |
| `POST` | `/user/onboarding/skip` | ✓ | Skip the onboarding flow |
| `GET` | `/user/leaderboard` | ✓ | Fetch ranked leaderboard data |

### 6.2 Course Routes (`/courses`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/courses` | Optional | List all published courses with user progress |
| `GET` | `/courses/:courseId` | Optional | Get full course content with user progress |
| `PUT` | `/courses/:courseId/lesson/:lessonId/complete` | ✓ | Mark lesson as complete; award XP |
| `PUT` | `/courses/:courseId/module/:moduleId/complete` | ✓ | Complete module after quiz pass; unlock next |
| `GET` | `/courses/:courseId/certificate` | ✓ | Generate and download certificate PDF |

### 6.3 Certificate Routes (`/certificates`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/certificates/verify/:verifyId` | ✗ | Public certificate verification lookup |
| `GET` | `/certificates/og-meta/:verifyId` | ✗ | Open Graph metadata for social previews |
| `GET` | `/certificates/issue/:courseId` | ✓ | Issue verification ID for a completed course |

### 6.4 Admin Routes (`/admin`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/admin/courses` | Admin | List all courses (including unpublished) |
| `GET` | `/admin/courses/:id` | Admin | Get a single course by ID |
| `POST` | `/admin/courses` | Admin | Create a new course |
| `PUT` | `/admin/courses/:id` | Admin | Update an existing course |
| `DELETE` | `/admin/courses/:id` | Admin | Delete a course |
| `GET` | `/admin/users` | Admin | List all registered users |
| `PUT` | `/admin/users/:id/xp` | Admin | Adjust a user's XP (add / deduct) |
| `PUT` | `/admin/users/:id/ban` | Admin | Toggle user ban status |
| `PUT` | `/admin/users/:id/reset` | Admin | Reset a user's XP and progress |

### 6.5 Chat Routes (`/api`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/chat` | ✗ | Send a message to the FinBot AI assistant |

### 6.6 Google OAuth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/google` | Initiate the Google OAuth 2.0 authentication flow |
| `GET` | `/auth/google/callback` | Handle the OAuth callback and redirect the user |

---

## 7. SECURITY (How We Keep Things Safe)

Security was a priority from day one. Here's what we put in place:

| # | Threat Vector | Mitigation Strategy |
|---|---------------|-------------------|
| 1 | **Cross-Site Scripting (XSS)** | JWT tokens stored exclusively in `HttpOnly` cookies, inaccessible to client-side JavaScript |
| 2 | **Cross-Site Request Forgery (CSRF)** | `SameSite` cookie attribute enforced (`None` in production with `Secure`, `Lax` in development) |
| 3 | **Brute-Force OTP Attacks** | Rate-limited OTP attempts (5 maximum) with expiry timestamps and automatic lockout |
| 4 | **Password Exposure** | `bcrypt` hashing with 10 salt rounds; plain-text passwords never stored or transmitted |
| 5 | **Unauthorized Access** | JWT verification middleware on all protected routes; admin routes additionally verify `isAdmin` flag |
| 6 | **NoSQL Injection** | Mongoose ODM with strict schema validation and type casting prevents injection attacks |
| 7 | **Input Tampering** | Server-side validation on all endpoints (email regex, password length, ObjectId format checking) |
| 8 | **Error Information Leakage** | Stack traces exposed only in `development` mode via centralized error handler middleware |
| 9 | **Cross-Origin Attacks** | Configurable CORS origin whitelist with credential support |
| 10 | **Session Hijacking** | Express-session cookies with `Secure` flag in production, 24-hour maximum age |
| 11 | **Payload Overflow (DoS)** | JSON body parser limited to 10 MB to prevent denial-of-service via oversized payloads |

---

## 8. DEPLOYMENT

### 8.1 Frontend (Vercel)

| Property | Value |
|----------|-------|
| **Where It Runs** | Vercel |
| **Build Command** | `vite build` (builds both user app and admin panel) |
| **Config** | `vercel.json` handles SPA routing rewrites |
| **Local Dev** | `vite` dev server with hot reload at `http://localhost:5173` |

### 8.2 Backend (Render / Any Node Host)

| Property | Value |
|----------|-------|
| **Where It Runs** | Render (but works on any Node.js host) |
| **Start Command** | `node src/server.js` |
| **Local Dev** | `nodemon src/server.js` with auto-reload at `http://localhost:5050` |
| **Database** | MongoDB Atlas (cloud) or local MongoDB |

### 8.3 Running It Locally

```bash
# ── Step 1: Clone the repository ──
git clone <repository-url>
cd FullProject

# ── Step 2: Start the Backend ──
cd server
npm install
# Create a .env file with required variables (see Section 2.3)
npm run dev          # Starts on http://localhost:5050

# ── Step 3: Start the Frontend (in a new terminal) ──
cd client
npm install
npm run dev          # Starts on http://localhost:5173
```

### 8.4 Seeding the Database

```bash
cd server
npm run seed         # Populates demo courses and admin user
```

---

## SCREENSHOTS

> **Adding your screenshots:**
> 1. Take screenshots of your running app.
> 2. Save them as `.png` or `.jpg` in the `docs/screenshots/` folder.
> 3. Use the filenames listed below — the image paths are already set up in this README.

---

### 🏠 Landing Page

> 📸 **Screenshot:** Save as `docs/screenshots/landing-page.png`

<!-- Replace the path below with your actual screenshot -->
![Landing Page — Hero Section](docs/screenshots/landing-page.png)
*The FinLearn landing page — first thing users see when they visit the site.*

---

### 🔐 Authentication Flow

> 📸 **Screenshots:** Save as `docs/screenshots/login.png` and `docs/screenshots/register.png`

| Login Page | Registration Page |
|:----------:|:-----------------:|
| ![Login](docs/screenshots/login.png) | ![Register](docs/screenshots/register.png) |
| *Email/password login with Google OAuth option* | *New user registration with validation* |

---

### 📋 Onboarding

> 📸 **Screenshot:** Save as `docs/screenshots/onboarding.png`

![Onboarding Flow](docs/screenshots/onboarding.png)
*Multi-step onboarding questionnaire capturing experience level, learning goals, and preferences.*

---

### 📊 Dashboard

> 📸 **Screenshot:** Save as `docs/screenshots/dashboard.png`

![User Dashboard](docs/screenshots/dashboard.png)
*The dashboard — XP progress bar, stats cards, course suggestions, daily streak, and the leaderboard all in one view.*

---

### 📚 Course Catalog & Course Details

> 📸 **Screenshots:** Save as `docs/screenshots/all-courses.png` and `docs/screenshots/course-details.png`

| All Courses | Course Details |
|:-----------:|:--------------:|
| ![All Courses](docs/screenshots/all-courses.png) | ![Course Details](docs/screenshots/course-details.png) |
| *Browse and filter all available courses* | *Course overview with module breakdown and progress* |

---

### 📖 Lesson View & Quiz

> 📸 **Screenshots:** Save as `docs/screenshots/lesson.png` and `docs/screenshots/quiz.png`

| Lesson View | Quiz Interface |
|:-----------:|:--------------:|
| ![Lesson](docs/screenshots/lesson.png) | ![Quiz](docs/screenshots/quiz.png) |
| *Interactive lesson content with progress tracking* | *Multiple-choice quiz with instant feedback and explanations* |

---

### 📈 Quiz Results & Certificate

> 📸 **Screenshots:** Save as `docs/screenshots/quiz-results.png` and `docs/screenshots/certificate.png`

| Quiz Results | Certificate of Completion |
|:------------:|:-------------------------:|
| ![Quiz Results](docs/screenshots/quiz-results.png) | ![Certificate](docs/screenshots/certificate.png) |
| *Detailed score breakdown with XP earned* | *Shareable certificate with unique verification ID* |

---

### 🧮 Financial Calculators

> 📸 **Screenshot:** Save as `docs/screenshots/fin-tools.png`

![Financial Tools](docs/screenshots/fin-tools.png)
*The financial calculator suite featuring Budget, Investment, Loan, Savings, SIP, Inflation, and Emergency Fund calculators.*

---

### 🤖 FinBot AI Chatbot

> 📸 **Screenshot:** Save as `docs/screenshots/finbot.png`

![FinBot Chatbot](docs/screenshots/finbot.png)
*FinBot in action — answering finance questions with quick-suggestion chips and conversation memory.*

---

### 👤 User Profile

> 📸 **Screenshot:** Save as `docs/screenshots/profile.png`

![User Profile](docs/screenshots/profile.png)
*Profile management page with personal information, social links, and account settings.*

---

### 📉 Analytics Dashboard

> 📸 **Screenshot:** Save as `docs/screenshots/analytics.png`

![Analytics Dashboard](docs/screenshots/analytics.png)
*Learning analytics with progress charts, performance breakdowns, and course completion stats.*

---

### 🏆 Leaderboard

> 📸 **Screenshot:** Save as `docs/screenshots/leaderboard.png`

![Global Leaderboard](docs/screenshots/leaderboard.png)
*Real-time global leaderboard ranked by XP with current user highlighting.*

---

### 🛡️ Admin Panel

> 📸 **Screenshots:** Save as `docs/screenshots/admin-dashboard.png` and `docs/screenshots/admin-courses.png`

| Admin Dashboard | Admin Course Management |
|:---------------:|:----------------------:|
| ![Admin Dashboard](docs/screenshots/admin-dashboard.png) | ![Admin Courses](docs/screenshots/admin-courses.png) |
| *Platform-wide analytics and metrics* | *Course CRUD with content management* |

---

## USER FLOW

The following diagram shows how a user typically moves through the FinLearn platform — from first landing on the site all the way to earning and sharing their certificate:

```
┌────────────┐     ┌────────────┐     ┌──────────────┐     ┌────────────────┐
│   Landing   │────►│  Register  │────►│  Onboarding  │────►│   Dashboard    │
│    Page     │     │  / Login   │     │  (Optional)  │     │                │
└────────────┘     └─────┬──────┘     └──────────────┘     └───────┬────────┘
                         │                                          │
                    Google OAuth                    ┌───────────────┼───────────────┐
                    (Alternative)                   │               │               │
                                                    ▼               ▼               ▼
                                             ┌───────────┐  ┌───────────┐  ┌──────────────┐
                                             │  Browse   │  │  Financial│  │   FinBot     │
                                             │  Courses  │  │   Tools   │  │   Chatbot    │
                                             └─────┬─────┘  └───────────┘  └──────────────┘
                                                   │
                                                   ▼
                                             ┌───────────┐
                                             │  Enroll   │
                                             │  in Course│
                                             └─────┬─────┘
                                                   │
                                                   ▼
                                             ┌───────────┐     ┌───────────┐
                                             │  Complete │────►│  Take     │
                                             │  Lessons  │     │  Quiz     │
                                             └───────────┘     └─────┬─────┘
                                                                     │
                                              ┌──────────────────────┘
                                              │
                                              ▼
                                       ┌───────────┐     ┌──────────────┐
                                       │  Earn XP  │────►│  Unlock Next │
                                       │  + Badge  │     │    Module    │
                                       └───────────┘     └──────────────┘
                                              │
                                    (All modules complete)
                                              │
                                              ▼
                                       ┌───────────────┐     ┌──────────────────┐
                                       │  Certificate  │────►│  Share on Social │
                                       │  of Completion│     │  Media (LinkedIn, │
                                       └───────────────┘     │  Twitter, etc.)  │
                                                             └──────────────────┘
```

---

## 11. CONCLUSION & FUTURE SCOPE

### 11.1 Wrapping It Up

FinLearn turned out to be exactly what we set out to build — a web app that makes learning about personal finance actually enjoyable. We used **React 19** and **Vite 7** on the frontend for a fast, smooth experience, **Express.js** for a solid REST API, and **MongoDB** to keep our data flexible and easy to work with.

Some of the technical decisions we're proud of: storing JWT tokens in secure cookies to prevent XSS attacks, using React Context to avoid prop drilling headaches, setting up separate builds for the admin panel so it doesn't interfere with the main app, and polling for real-time XP updates so users see their progress instantly.

The gamification stuff — XP, levels, streaks, badges, and the leaderboard — genuinely works. People come back because they want to keep their streak alive or unlock the next badge. The FinBot chatbot adds another layer of support, and the certificate verification system with social sharing gives users something tangible to show for their effort.

It's not perfect, but it's a solid foundation that actually helps people learn about money management in a way that doesn't feel like sitting through a boring lecture.

### 11.2 Where We Could Take It Next

| # | What's Next | Why It Matters | Priority |
|---|-------------|---------------|----------|
| 1 | **Real-Time Updates with WebSockets** | Right now we poll the server every few seconds for XP and leaderboard updates. WebSockets would be way more efficient and give users instant feedback without hammering the server. | High |
| 2 | **Smart Course Recommendations with ML** | Imagine the app analyzing your quiz scores and learning patterns to automatically adjust difficulty or suggest topics you're weak in. That's the next level of personalization. | Medium |
| 3 | **Multiple Language Support** | Adding Hindi, Tamil, Bengali, and other regional languages would open up the platform to way more people across India. Right now it's English-only, which limits reach. | Medium |
| 4 | **Mobile App** | A React Native app with offline lesson access and push notifications for daily streaks. Because let's be real — most people learn on their phones. | Medium |
| 5 | **Paid Premium Courses** | Integrate Razorpay or Stripe to offer premium courses or advanced certifications. Could be a solid freemium model. | Low |
| 6 | **Community Discussion Forums** | Add discussion threads for each course module so learners can help each other out and share tips. Learning finance doesn't have to be solo. | Low |

---

## 12. BIBLIOGRAPHY / REFERENCES

| # | Source | URL |
|---|--------|-----|
| 1 | React Official Documentation | [https://react.dev](https://react.dev) |
| 2 | Vite Build Tool Guide | [https://vite.dev/guide](https://vite.dev/guide) |
| 3 | Express.js Documentation | [https://expressjs.com](https://expressjs.com) |
| 4 | MongoDB Manual | [https://www.mongodb.com/docs/manual](https://www.mongodb.com/docs/manual) |
| 5 | Mongoose ODM Guide | [https://mongoosejs.com/docs/guide.html](https://mongoosejs.com/docs/guide.html) |
| 6 | JSON Web Token (JWT) Specification (RFC 7519) | [https://jwt.io/introduction](https://jwt.io/introduction) |
| 7 | Passport.js Authentication Documentation | [https://www.passportjs.org/docs](https://www.passportjs.org/docs) |
| 8 | Tailwind CSS Documentation | [https://tailwindcss.com/docs](https://tailwindcss.com/docs) |
| 9 | Framer Motion Animation Library | [https://www.framer.com/motion](https://www.framer.com/motion) |
| 10 | OpenRouter API Documentation | [https://openrouter.ai/docs](https://openrouter.ai/docs) |
| 11 | OWASP Top Ten Web Application Security Risks | [https://owasp.org/www-project-top-ten](https://owasp.org/www-project-top-ten) |
| 12 | Nodemailer Email Library | [https://nodemailer.com/about](https://nodemailer.com/about) |
| 13 | bcrypt Password Hashing Library | [https://github.com/kelektiv/node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js) |
| 14 | Material UI (MUI) Component Library | [https://mui.com/material-ui/getting-started](https://mui.com/material-ui/getting-started) |
| 15 | Recharts Data Visualization | [https://recharts.org/en-US/guides](https://recharts.org/en-US/guides) |
| 16 | RBI National Strategy for Financial Education | [https://www.rbi.org.in/scripts/bs_viewcontent.aspx](https://www.rbi.org.in/scripts/bs_viewcontent.aspx) |
| 17 | Reserve Bank of India — Financial Literacy Initiatives | [https://rbi.org.in](https://rbi.org.in) |

---

<div align="center">

### FinLearn — Making Financial Education Actually Fun

*Built with React, Express, MongoDB, and the belief that everyone deserves to understand their money.*

</div>
