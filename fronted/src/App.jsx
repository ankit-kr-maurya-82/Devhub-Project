import { lazy } from 'react'
import PageBoundary from '../components/PageBoundary.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import MockSessionProvider from './state/MockSessionProvider.jsx'
import NotificationProvider from './state/NotificationProvider.jsx'
import Home from '../pages/Home.jsx'
import ComingSoon from '../pages/ComingSoon.jsx'
import NotFound from '../pages/NotFound.jsx'
import RequireAuth from './components/RequireAuth.jsx'

const Login = lazy(() => import('../pages/Login.jsx'))
const Register = lazy(() => import('../pages/Register.jsx'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('../pages/ResetPassword.jsx'))
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'))
const Profile = lazy(() => import('../pages/Profile.jsx'))
const Questions = lazy(() => import('../pages/Questions.jsx'))
const QuestionDetails = lazy(() => import('../pages/QuestionDetails.jsx'))
const AskQuestion = lazy(() => import('../pages/AskQuestion.jsx'))
const FeatureUnavailable = lazy(() => import('../pages/FeatureUnavailable.jsx'))
const Community = lazy(() => import('./pages/Community.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))

function App() {
  return (
    <MockSessionProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PageBoundary key="login"><Login /></PageBoundary>} />
            <Route path="/register" element={<PageBoundary key="register"><Register /></PageBoundary>} />
            <Route path="/forgot-password" element={<PageBoundary key="forgot-password"><ForgotPassword /></PageBoundary>} />
            <Route path="/reset-password/:token" element={<PageBoundary key="reset-password"><ResetPassword /></PageBoundary>} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/questions/:id" element={<QuestionDetails />} />
              <Route path="/ask-question" element={<RequireAuth><AskQuestion /></RequireAuth>} />
              <Route path="/blogs" element={<FeatureUnavailable title="Blogs" description="Blog publishing and reading are not connected to a persistent API yet." />} />
              <Route path="/blogs/:id" element={<FeatureUnavailable title="Blog" description="Blog publishing and reading are not connected to a persistent API yet." />} />
              <Route path="/create-blog" element={<FeatureUnavailable title="Write a blog" description="Blog publishing is not connected to a persistent API yet." />} />
              <Route path="/coding" element={<FeatureUnavailable title="Coding practice" description="Problem and submission data are not connected to a persistent API yet." />} />
              <Route path="/coding/problem/:id" element={<FeatureUnavailable title="Coding problem" description="Problem and submission data are not connected to a persistent API yet." />} />
              <Route path="/submissions" element={<RequireAuth><FeatureUnavailable title="Submissions" description="Problem submissions are not stored by the backend yet." /></RequireAuth>} />
              <Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
              <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
              <Route path="/admin/*" element={<FeatureUnavailable title="Admin workspace" description="Administrative records and moderation actions are not connected to backend APIs yet." />} />
              <Route path="/tags" element={<ComingSoon title="Tags" description="Explore the technologies and topics that interest you." />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </MockSessionProvider>
  )
}

export default App
