/*
  client/src/App.jsx

  Purpose:
  - Define the top-level routes for the SPA using React Router.
  - Grouped routes include public pages, auth pages, and protected dashboard routes.

  Notes for new developers:
  - `Super` wraps protected routes and ensures only authenticated users can access them.
  - `AuthLayout` provides a consistent layout for authentication-related pages.
*/

import { Routes, Route, Navigate } from 'react-router-dom';

// ==================== Pages ====================
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AllCourses from './pages/AllCourses';
import CourseContent from './Components/Dashboard/CourseContent';
import Tools from './pages/Tools';
import Progress from './pages/Progress';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import QuizResultsPage from './pages/QuizResultsPage';
import CertificatePage from './pages/CertificatePage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CourseDetailsPage from './pages/CourseDetailsPage';
import VerifyPage from './pages/VerifyPage';
import FinBotPage from './Components/Chatbot/Finbotpage';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// ==================== Layouts ====================
// AuthLayout: Provides consistent styling for all auth pages
import AuthLayout from './layouts/AuthLayout';

// ==================== Authentication Components ====================
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import ForgetPassword from './Components/Auth/ForgetPassword';
import Verification from './Components/Auth/Verification';
import NewPassword from './Components/Auth/NewPassword';
import Onboarding from './Components/Auth/Onboarding';
import GoogleCallback from './Components/Auth/GoogleCallback'; // OAuth token exchange
import Super from './Components/Auth/Super'; // Protected route wrapper

function App() {
  return (
    <>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Home />} />

        {/* Public pages */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Public Verification Route: used after email verification flows */}
        <Route path="/verify/:verifyId" element={<VerifyPage />} />

        {/* Authentication routes: wrapped with `AuthLayout` for consistent styling */}
        <Route path="/auth/login" element={<AuthLayout> <Login /> </AuthLayout>} />
        <Route path="/auth/register" element={<AuthLayout> <Register /> </AuthLayout>} />
        <Route path="/auth/password/forgot" element={<AuthLayout> <ForgetPassword /> </AuthLayout>} />

        {/* Google OAuth callback: exchanges code for cookies on the Vercel domain */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* The `Super` component protects these routes and redirects unauthenticated users */}
        <Route element={<Super />}>
          <Route path="/auth/otp/verify" element={<AuthLayout> <Verification /> </AuthLayout>} />
          <Route path="/auth/password/change" element={<AuthLayout> <NewPassword /> </AuthLayout>} />
          <Route path="/auth/onboarding" element={<AuthLayout> <Onboarding /> </AuthLayout>} />
        </Route>

        {/* Redirect /admin to the separate admin SPA entrypoint */}
        <Route path="/admin" element={<Navigate to="/admin.html" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin.html" replace />} />

        {/* Dashboard and protected user routes */}
        <Route element={<Super />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/all-courses" element={<AllCourses />} />
          <Route path="/dashboard/course/:id" element={<CourseDetailsPage />} />
          <Route path="/dashboard/course/:id/player" element={<CourseContent />} />
          <Route path="/dashboard/course/:courseId/lesson/:moduleId" element={<LessonPage />} />
          <Route path="/dashboard/course/:courseId/quiz" element={<QuizPage />} />
          <Route path="/dashboard/course/:courseId/quiz-result" element={<QuizResultsPage />} />
          <Route path="/dashboard/course/:courseId/certificate" element={<CertificatePage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />

          <Route path="/dashboard/profile" element={<Profile />} />

          <Route path="/dashboard/tools" element={<Tools />} />
          <Route path="/dashboard/progress" element={<Progress />} />
          <Route path="/dashboard/settings" element={<Profile />} />

          {/* Placeholder routes for future dashboard sections */}
          <Route path="/dashboard/achievements" element={<Dashboard />} />
          <Route path="/dashboard/goals" element={<Dashboard />} />
          <Route path="/dashboard/help" element={<Dashboard />} />
          <Route path="/dashboard/finbot" element={<FinBotPage />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;