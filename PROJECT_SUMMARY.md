# 📘 FinLearn — Project Summary

> Single-document executive overview of the FinLearn codebase.

---

## 🎯 Application Purpose

**FinLearn** (also branded as *Financial Literacy Hub* / *FinanceQuest*) is a **full-stack, gamified financial education web application**. Its mission is to make financial literacy accessible and engaging for Indian learners by combining:

- **Structured video + text courses** on budgeting, saving, investing, debt, retirement, and tax
- **A gamification engine** with XP points, leveling, daily streaks, leaderboards, and achievement badges
- **An AI-powered chatbot** ("FinBot") that answers financial questions and recommends courses, responding in Hinglish when users write in Hinglish
- **Shareable, verifiable certificates** issued on course completion
- **7 interactive financial calculators** (budget, SIP, loan EMI, inflation, emergency fund, etc.)
- **A full admin dashboard** for CRUD management of courses, quizzes, and users

---

## 🏗️ Application Type & Architecture

| Attribute | Value |
|-----------|-------|
| Type | Full-stack monorepo SPA |
| Frontend | React 19 (Vite) — deployed on **Vercel** |
| Backend | Express.js (Node 18+) — deployed on **Render** |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (HTTP-only cookies) + Google OAuth 2.0 |
| AI | OpenRouter API → `moonshotai/kimi-k2.6:free` |
| Email | Nodemailer via Gmail (OTP + notifications) |

---

## 🚀 Main Entry Points

### Backend

| File | Role |
|------|------|
| [`server/src/server.js`](file:///c:/Users/ravik/OneDrive/डेस्कटॉप/FinLearn/server/src/server.js) | **True entry point.** Calls `getConnection()` (MongoDB) then `app.listen(PORT)` |
| [`server/src/app.js`](file:///c:/Users/ravik/OneDrive/डेस्कटॉप/FinLearn/server/src/app.js) | Express app factory — registers CORS, session, Passport, all route modules, error handler |
| [`server/server.js`](file:///c:/Users/ravik/OneDrive/डेस्कटॉप/FinLearn/server/server.js) | Thin shim — just `require('./src/server.js')` |

**Start command:** `npm run dev` → `nodemon src/server.js`  
**Default port:** `5050`

### Frontend

| File | Role |
|------|------|
| [`client/src/main.jsx`](file:///c:/Users/ravik/OneDrive/डेस्कटॉप/FinLearn/client/src/main.jsx) | **React entry point.** `ReactDOM.createRoot` → renders `<App />` |
| [`client/src/App.jsx`](file:///c:/Users/ravik/OneDrive/डेस्कटॉप/FinLearn/client/src/App.jsx) | Root router — defines every client-side route (public, auth, dashboard, admin) |
| [`client/index.html`](file:///c:/Users/ravik/OneDrive/डेस्कटॉप/FinLearn/client/index.html) | Vite HTML entry shell |

**Start command:** `npm run dev` → `vite`  
**Default port:** `5173`

---

## 🔐 Required Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ | MongoDB Atlas connection string |
| `PORT` | ❌ | Server port (default: `5050`) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `SESSION_SECRET` | ✅ | Express session signing key — **app refuses to start without this** |
| `ACCESS_TOKEN_KEY` | ✅ | JWT signing secret for access tokens |
| `REFRESH_TOKEN_KEY` | ✅ | JWT signing secret for refresh tokens |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth 2.0 Client Secret |
| `GOOGLE_CALLBACK` | ❌ | OAuth callback URL (default: `https://finlearn-1.onrender.com/auth/google/callback`) |
| `MAIL_USER` | ✅ | Gmail address for sending OTP emails |
| `MAIL_PASSWORD` | ✅ | Gmail App Password |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API key for FinBot AI |
| `ORIGIN` | ❌ | Frontend origin for CORS + OAuth redirect (default: `https://fin-learn-client-ttsd.vercel.app`) |
| `FAILURE_URL` | ❌ | OAuth failure redirect URL |

> [!CAUTION]
> The app **throws an error at startup** if `SESSION_SECRET` is missing. Missing JWT keys cause token generation to fail at runtime.

### Client (`client/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g. `http://localhost:5050`) |

---

## 🎮 Business-Critical Logic

### 1. XP & Leveling System

```
On lesson complete:
  user.xp.totalXP  += xpEarned
  user.xp.currentXP += xpEarned
  while (currentXP >= maxXPForLevel):
    currentXP -= maxXPForLevel
    level += 1
    maxXPForLevel = floor(maxXPForLevel * 1.2)   ← 20% harder each level

On module complete:
  Same XP logic + modProgress.xpEarned += modData.xpReward
  Next module in progress.modules[] is set unlocked = true

On course complete (all modules done):
  progress.isCompleted = true
  progress.certificateIssued = true
  ensureVerificationId(progress) → generates unique verificationId
```

### 2. Cross-Domain Google OAuth (Render → Vercel)

The backend (Render) and frontend (Vercel) are on different domains, so cookies set after OAuth do not reach the frontend. Solution:

1. After Google callback succeeds, generate a **60-second `exchangeCode` JWT** (type: `oauth_code`)
2. Redirect browser to Vercel frontend with `?code=<exchangeCode>`
3. `GoogleCallback.jsx` calls `POST /user/set-token-cookies` through the Vercel proxy
4. Backend validates the exchange code and sets real `accessToken` + `refreshToken` cookies **on the Vercel domain**

### 3. JWT Dual-Token Auth

- **Access token:** 7 days, in HTTP-only cookie `accessToken`
- **Refresh token:** 30 days, in HTTP-only cookie `refreshToken`
- Auth middleware first checks `req.cookies.accessToken`, then falls back to `Authorization: Bearer` header (for mobile clients where cookies may be stripped)
- Token errors (expired, invalid, missing) all normalize to HTTP `403`

### 4. Course Enrollment (Auto-create on First Visit)

When an authenticated user GETs a course for the first time, `UserProgress` is automatically created:

```js
UserProgress.create({
  userId, courseId,
  modules: course.modules.map((m, idx) => ({
    moduleId: m.id,
    unlocked: idx === 0,          ← only first module unlocked
    lessons: m.lessons.map(l => ({ lessonId: l.id }))
  }))
})
```

A race-condition guard handles duplicate-key errors (11000) by fetching the existing record.

### 5. FinBot Chat (AI Chatbot)

- Uses **OpenRouter API** (`moonshotai/kimi-k2.6:free` model) via the OpenAI-compatible SDK
- Maintains conversation history in MongoDB `ChatSession` per anonymous `sessionId` (UUID from frontend localStorage)
- Sends the last **6 messages** as context window to the AI
- System prompt instructs FinBot to: answer only finance questions, reply in Hinglish if user writes Hinglish, never give stock predictions, add financial advice disclaimers

### 6. Certificate Verification

- On course completion, `ensureVerificationId()` generates a unique `verificationId` (UUID-based, stored uppercase in `UserProgress`)
- Anyone can verify at `/verify/:verifyId` (public, no auth) → calls `GET /certificates/verify/:verifyId`
- Certificate metadata (student name, course name, completion date) is populated via Mongoose `.populate()`

### 7. OTP Security Model

Both password-reset and email-change OTPs share the same security model:
- **5 attempts** allowed before lockout
- **10-minute expiry** (stored as Unix timestamp in `password_otp.time`)
- Status flag (`password_otp.status`) must be `true` before the password update is allowed
- OTP fields are cleared after successful use

### 8. Admin Authorization

Admin routes use a **two-middleware chain**: `auth` (JWT check) → `adminOnly` (`user.isAdmin === true`). The `isAdmin` flag is set directly on the User document and can only be bootstrapped via the `scripts/seedAdmin.js` script.

---

## 📊 Data Models Summary

| Collection | Key Fields | Relationships |
|-----------|-----------|---------------|
| `User` | name, email, password, xp, leaderboardStats, onboarding, isAdmin, status | Referenced by UserProgress |
| `Course` | title, slug, category, difficulty, modules[], isPublished | Referenced by UserProgress; self-ref prerequisites |
| `Quiz` | title, category, difficulty, questions[], passingScore, isPublished | Created by User (admin) |
| `UserProgress` | userId, courseId, overallProgress, isCompleted, certificateIssued, verificationId, modules[] | Joins User ↔ Course |
| `ChatSession` | sessionId, messages[] | Standalone (not linked to User) |

---

## 🌐 Client-Side Routes

| Path | Access | Component |
|------|--------|-----------|
| `/` | Public | Home (landing page) |
| `/about`, `/contact`, `/help`, `/privacy`, `/terms` | Public | Static info pages |
| `/verify/:verifyId` | Public | Certificate verifier |
| `/auth/login` | Public | Login form |
| `/auth/register` | Public | Registration form |
| `/auth/password/forgot` | Public | Forgot password |
| `/auth/google/callback` | Public | OAuth token exchange |
| `/auth/otp/verify` | Semi-protected | OTP verification |
| `/auth/password/change` | Semi-protected | New password form |
| `/auth/onboarding` | Semi-protected | Onboarding survey |
| `/dashboard` | 🔒 Protected | Main dashboard |
| `/dashboard/all-courses` | 🔒 Protected | Course catalog |
| `/dashboard/course/:id` | 🔒 Protected | Course detail |
| `/dashboard/course/:id/player` | 🔒 Protected | Course player |
| `/dashboard/course/:courseId/lesson/:moduleId` | 🔒 Protected | Lesson viewer |
| `/dashboard/course/:courseId/quiz` | 🔒 Protected | Quiz page |
| `/dashboard/course/:courseId/quiz-result` | 🔒 Protected | Quiz results |
| `/dashboard/course/:courseId/certificate` | 🔒 Protected | Certificate page |
| `/dashboard/analytics` | 🔒 Protected | User analytics |
| `/dashboard/profile` | 🔒 Protected | Profile + settings |
| `/dashboard/tools` | 🔒 Protected | Financial calculators |
| `/dashboard/progress` | 🔒 Protected | Learning progress |
| `/dashboard/finbot` | 🔒 Protected | FinBot AI chat |
| `/admin/*` | 🔒🛡️ Admin only | Admin dashboard |

---

## 🚀 Deployment Checklist

- [ ] Set all required environment variables on Render (server) and Vercel (client)
- [ ] MongoDB Atlas: whitelist Render's IP or use `0.0.0.0/0` for dynamic IPs
- [ ] Run `node scripts/seedAdmin.js` to create the first admin user
- [ ] Optionally run `node scripts/seedDemoCourses.js` to seed demo content
- [ ] Confirm `GOOGLE_CALLBACK` points to the production Render callback URL
- [ ] Confirm `ORIGIN` matches the production Vercel frontend URL
- [ ] Verify `NODE_ENV=production` on Render (enables secure/sameSite CHIPS cookies)

---

*Generated automatically — reflects codebase as of November 2026.*
