# 🔄 FinLearn — Data Flow Documentation

> Traces the lifecycle of every major request from client browser to database and back.

---

## Overview

All data flows through a standard layered pipeline:

```
Browser → Axios → Express Router → Middleware → Controller → Mongoose → MongoDB Atlas
                                                                       ↓
Browser ← JSON ← Express Response ← Controller ← Mongoose ← MongoDB Atlas
```

External service calls (Google OAuth, OpenRouter AI, Nodemailer) branch off at the **Controller** layer.

---

## 1. 🔐 Standard Login Flow (`POST /user/login`)

```mermaid
sequenceDiagram
    actor User
    participant React as React SPA<br/>(Vercel)
    participant Express as Express API<br/>(Render)
    participant LoginCtrl as login.js<br/>Controller
    participant Mongo as MongoDB Atlas<br/>User Collection
    participant bcrypt as bcrypt

    User->>React: Enters email + password → submits form
    React->>Express: POST /user/login<br/>{ email, password }
    Express->>Express: CORS check → body parse → route match
    Express->>LoginCtrl: Call login(req, res, next)
    LoginCtrl->>LoginCtrl: Validate req.body (email, password present?)
    LoginCtrl->>Mongo: User.findOne({ email: email.toLowerCase() })
    Mongo-->>LoginCtrl: User document (or null)
    
    alt User not found
        LoginCtrl-->>Express: throw Error(400) "No user found"
        Express-->>React: 400 { message: "No user found with this email" }
        React-->>User: Show error toast
    else Google OAuth user (no password field)
        LoginCtrl-->>Express: throw Error(400) "Use Google Sign-In"
        Express-->>React: 400 { isGoogleAccount: true }
        React-->>User: Redirect to Google login
    else Password mismatch
        LoginCtrl->>bcrypt: bcrypt.compare(plaintext, hash)
        bcrypt-->>LoginCtrl: false
        LoginCtrl-->>Express: throw Error(400) "Incorrect password"
        Express-->>React: 400 { message: "Incorrect password" }
        React-->>User: Show error toast
    else Success
        LoginCtrl->>bcrypt: bcrypt.compare(plaintext, hash)
        bcrypt-->>LoginCtrl: true
        LoginCtrl->>LoginCtrl: generateToken(user, "7d")<br/>→ accessToken (7d) + refreshToken (30d)
        LoginCtrl->>Express: res.cookie("accessToken", ..., httpOnly)<br/>res.cookie("refreshToken", ..., httpOnly)
        Express-->>React: 200 { status: true, token, user: { id, name, email, isAdmin } }<br/>+ Set-Cookie headers
        React->>React: Store user in Redux / Context
        React-->>User: Redirect to /dashboard
    end
```

---

## 2. 🔑 Google OAuth Flow (Cross-Domain Cookie Fix)

```mermaid
sequenceDiagram
    actor User
    participant React as React SPA<br/>(Vercel)
    participant Render as Express API<br/>(Render)
    participant Google as Google OAuth 2.0
    participant GoogleAuth as googleAuth.js<br/>Middleware
    participant Mongo as MongoDB Atlas
    participant GoogleCB as GoogleCallback.jsx<br/>Component

    User->>React: Clicks "Continue with Google"
    React->>Render: Redirect → GET /auth/google
    Render->>Google: passport.authenticate("google")<br/>scope: [email, profile]
    Google-->>User: Google consent screen
    User->>Google: Grants permission
    Google-->>Render: GET /auth/google/callback?code=<authcode>
    Render->>Google: Exchange auth code for profile
    Google-->>Render: Profile { id, email, name, ... }
    Render->>GoogleAuth: googleAuth middleware
    GoogleAuth->>Mongo: User.findOne({ email }) or User.create(...)
    Mongo-->>GoogleAuth: User document (upsert)
    GoogleAuth->>Render: req.userId, req.userEmail set
    Render->>Render: jwt.sign({ id, email, type:"oauth_code" }, 60s)<br/>= exchangeCode
    Render-->>React: 302 Redirect to<br/>vercel.app/auth/google/callback?code=<exchangeCode>
    React->>GoogleCB: GoogleCallback.jsx renders
    GoogleCB->>Render: POST /user/set-token-cookies { code: exchangeCode }
    Note over Render: Validates exchangeCode (60s JWT)<br/>Issues real accessToken + refreshToken
    Render-->>GoogleCB: 200 { user } + Set-Cookie (accessToken, refreshToken)<br/>on Vercel domain ✅
    GoogleCB->>React: Store user in Redux, redirect to /dashboard
```

---

## 3. 🔒 Protected API Request (Auth Middleware)

```mermaid
sequenceDiagram
    participant React as React SPA
    participant Express as Express API
    participant AuthMW as auth.js<br/>Middleware
    participant Controller as Controller
    participant Mongo as MongoDB

    React->>Express: GET /user/profile<br/>Cookie: accessToken=<jwt>
    Express->>AuthMW: auth(req, res, next)
    AuthMW->>AuthMW: Extract token from req.cookies.accessToken<br/>(fallback: Authorization: Bearer header)
    
    alt No token
        AuthMW-->>Express: next(Error 403 "Access token required")
        Express-->>React: 403 Unauthorized
    else Token expired / invalid
        AuthMW-->>Express: next(Error 403 "Invalid or expired token")
        Express-->>React: 403 Unauthorized
    else Token valid
        AuthMW->>AuthMW: jwt.verify(token, ACCESS_TOKEN_KEY)<br/>→ { id, email }
        AuthMW->>AuthMW: req.id = decoded.id<br/>req.email = decoded.email
        AuthMW->>Controller: next() → Controller runs
        Controller->>Mongo: Query using req.id
        Mongo-->>Controller: Data
        Controller-->>Express: res.json({ ... })
        Express-->>React: 200 { data }
    end
```

---

## 4. 📚 Course + Lesson Completion Flow

```mermaid
sequenceDiagram
    actor User
    participant React as React SPA
    participant Express as Express API
    participant AuthMW as auth.js
    participant CourseRoute as courses.js Router
    participant Mongo as MongoDB

    User->>React: Opens course → navigates to Lesson
    React->>Express: GET /courses/:courseId<br/>Cookie: accessToken
    Express->>AuthMW: optionalAuth (soft auth)
    AuthMW->>CourseRoute: req.id set (if logged in)
    CourseRoute->>Mongo: Course.findById(courseId)
    CourseRoute->>Mongo: UserProgress.findOne({ userId, courseId })
    
    alt Progress doesn't exist yet (first visit)
        CourseRoute->>Mongo: UserProgress.create({ userId, courseId,<br/>modules: [...unlocked: idx===0] })
    end
    
    Mongo-->>CourseRoute: { course, progress }
    CourseRoute-->>React: 200 { course, progress }
    React-->>User: Render lesson content

    User->>React: Completes lesson → clicks "Mark Complete"
    React->>Express: PUT /courses/:courseId/lesson/:lessonId/complete<br/>{ xpEarned: 20, score: 85 }
    Express->>AuthMW: auth (strict)
    AuthMW->>CourseRoute: req.id verified
    CourseRoute->>Mongo: ensureUserProgress(userId, courseId)
    CourseRoute->>Mongo: Find lesson in progress.modules[].lessons[]
    CourseRoute->>CourseRoute: Mark lesson.completed = true<br/>lesson.xpEarned = xpEarned<br/>Recalculate overallProgress %
    CourseRoute->>Mongo: User.findById(userId)
    CourseRoute->>Mongo: user.xp.totalXP += xpEarned<br/>Level-up loop if needed
    CourseRoute->>Mongo: user.save() + progress.save()
    Mongo-->>CourseRoute: Saved
    CourseRoute-->>React: 200 { success: true, progress }
    React-->>User: Show XP animation + progress update
```

---

## 5. 🏅 Module Completion + Certificate Issuance

```mermaid
sequenceDiagram
    actor User
    participant React as React SPA
    participant Express as Express API
    participant CourseRoute as courses.js Router
    participant CertUtil as certificateVerify.js
    participant Mongo as MongoDB

    User->>React: Passes module quiz → triggers completion
    React->>Express: PUT /courses/:courseId/module/:moduleId/complete<br/>{ quizScore: 90 }
    Express->>CourseRoute: auth verified
    CourseRoute->>Mongo: Course.findById + ensureUserProgress
    CourseRoute->>CourseRoute: modProgress.completed = true<br/>modProgress.quizScore = 90<br/>modProgress.quizPassed = true (90 >= 70)<br/>xpEarned += modData.xpReward
    CourseRoute->>Mongo: User.xp += xpReward, level-up check
    CourseRoute->>CourseRoute: Unlock next module in progress.modules[]
    CourseRoute->>CourseRoute: Check if ALL modules completed
    
    alt All modules complete — course finished!
        CourseRoute->>CourseRoute: progress.isCompleted = true<br/>progress.certificateIssued = true<br/>progress.certificateIssuedAt = now()
        CourseRoute->>CertUtil: ensureVerificationId(progress)
        CertUtil->>CertUtil: Generate UUID-based verificationId
        CertUtil->>Mongo: progress.save({ verificationId })
        CourseRoute-->>React: { success: true, courseCompleted: true, progress }
        React-->>User: Confetti 🎉 + Certificate unlocked
    else More modules remaining
        CourseRoute-->>React: { success: true, courseCompleted: false, progress }
        React-->>User: Next module unlocked
    end
```

---

## 6. 🤖 FinBot AI Chat Flow

```mermaid
sequenceDiagram
    actor User
    participant React as React SPA<br/>FinBotPage.jsx
    participant Express as Express API
    participant ChatCtrl as chatController.js
    participant Mongo as MongoDB<br/>ChatSession
    participant OpenRouter as OpenRouter AI<br/>moonshotai/kimi-k2.6

    User->>React: Types message in FinBot chat
    React->>React: Get/create sessionId (uuid in localStorage)
    React->>Express: POST /api/chat<br/>{ message, sessionId }
    Express->>ChatCtrl: chat(req, res)
    ChatCtrl->>Mongo: ChatSession.findOne({ sessionId })
    
    alt Session doesn't exist
        ChatCtrl->>Mongo: new ChatSession({ sessionId, messages: [] })
    end
    
    ChatCtrl->>Mongo: session.messages.push({ role:"user", content:message })
    ChatCtrl->>ChatCtrl: Extract last 6 messages as history context
    ChatCtrl->>OpenRouter: client.chat.completions.create({<br/>  model: "moonshotai/kimi-k2.6:free",<br/>  messages: [systemPrompt, ...history, userMsg],<br/>  max_tokens: 300<br/>})
    OpenRouter-->>ChatCtrl: { choices[0].message.content: reply }
    ChatCtrl->>Mongo: session.messages.push({ role:"model", content:reply })
    ChatCtrl->>Mongo: session.save()
    ChatCtrl-->>Express: res.json({ reply, sessionId })
    Express-->>React: 200 { reply, sessionId }
    React-->>User: Display FinBot's response (Markdown rendered)
```

---

## 7. 🔑 Password Reset via OTP

```mermaid
sequenceDiagram
    actor User
    participant React as React SPA
    participant Express as Express API
    participant ForgotCtrl as forgotPassword.js
    participant OtpCtrl as verifyOtp.js
    participant UpdCtrl as updatePassword.js
    participant Mongo as MongoDB
    participant Mail as Nodemailer<br/>(Gmail)

    User->>React: Enters email on /auth/password/forgot
    React->>Express: POST /user/password/forget { email }
    Express->>ForgotCtrl: forgotPassword(req,res)
    ForgotCtrl->>Mongo: User.findOne({ email })
    ForgotCtrl->>ForgotCtrl: Generate 6-digit OTP<br/>Set expiry = now + 10min
    ForgotCtrl->>Mongo: user.password_otp = { otp, time, attempts:5 }
    ForgotCtrl->>Mongo: user.save()
    ForgotCtrl->>Mail: sendMail({ to: email, subject: "OTP", text: otp })
    Mail-->>User: Email with OTP code
    ForgotCtrl-->>React: 200 { message: "OTP sent" }
    React-->>User: Navigate to /auth/otp/verify

    User->>React: Enters OTP
    React->>Express: POST /user/otp/verify { email, otp }
    Express->>OtpCtrl: verifyOtp(req,res)
    OtpCtrl->>Mongo: Check user.password_otp.otp, expiry, attempts
    
    alt OTP valid
        OtpCtrl->>Mongo: user.password_otp.status = true
        OtpCtrl-->>React: 200 { verified: true }
        React-->>User: Navigate to /auth/password/change
    else Invalid / expired
        OtpCtrl->>Mongo: user.password_otp.attempts -= 1
        OtpCtrl-->>React: 400 { message: "Invalid OTP" }
    end

    User->>React: Enters new password
    React->>Express: POST /user/password/update { email, newPassword }
    Express->>UpdCtrl: updatePassword(req,res)
    UpdCtrl->>Mongo: Verify password_otp.status === true
    UpdCtrl->>UpdCtrl: bcrypt.hash(newPassword, 10)
    UpdCtrl->>Mongo: user.password = hash<br/>user.password_otp = cleared
    UpdCtrl->>Mongo: user.save()
    UpdCtrl-->>React: 200 { message: "Password updated" }
    React-->>User: Redirect to /auth/login
```

---

## 8. 📜 Certificate Verification (Public)

```mermaid
sequenceDiagram
    actor Viewer as Third-Party Viewer
    participant React as React SPA<br/>VerifyPage.jsx
    participant Express as Express API
    participant CertUtil as certificateVerify.js
    participant Mongo as MongoDB<br/>UserProgress (populated)

    Viewer->>React: Opens /verify/:verifyId
    React->>Express: GET /certificates/verify/:verifyId
    Express->>CertUtil: findProgressByVerifyId(verifyId)
    CertUtil->>Mongo: UserProgress.findOne({ verificationId })<br/>.populate("userId", "name profileImage")<br/>.populate("courseId")
    Mongo-->>CertUtil: Populated progress document
    CertUtil->>CertUtil: formatCertificatePayload(progress, verifyId)
    CertUtil-->>Express: { studentName, courseName, completedAt, ... }
    Express-->>React: 200 { success: true, studentName, courseName, ... }
    React-->>Viewer: Display verified certificate details
```

---

## Request Lifecycle Summary

| Phase | Component | Responsibility |
|-------|-----------|---------------|
| 1. Transport | Axios (client) | Add cookies, set Content-Type, handle redirects |
| 2. CORS | app.js | Whitelist Vercel origins, allow credentials |
| 3. Parsing | express.json | Parse JSON body (up to 10 MB) |
| 4. Session | express-session | Manage Passport OAuth session |
| 5. Auth | auth.js / optionalAuth.js | Verify JWT, attach req.id |
| 6. Business Logic | Controller | Query/mutate DB, call external services |
| 7. DB Query | Mongoose | Execute MongoDB query, run validators |
| 8. Response | Controller → Express | Serialize JSON, set status code |
| 9. Error | errorHandler.js | Catch all thrown errors, return consistent shape |

---

*Generated automatically — reflects codebase as of November 2026.*
