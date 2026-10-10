import { lazy } from 'react'
import PageBoundary from '../components/PageBoundary.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminProvider from './state/AdminProvider.jsx'
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
const Blogs = lazy(() => import('../pages/Blogs.jsx'))
const BlogDetails = lazy(() => import('../pages/BlogDetails.jsx'))
const CreateBlog = lazy(() => import('../pages/CreateBlog.jsx'))
const CodingPractice = lazy(() => import('../pages/CodingPractice.jsx'))
const ProblemDetails = lazy(() => import('../pages/ProblemDetails.jsx'))
const Submissions = lazy(() => import('../pages/Submissions.jsx'))
const Community = lazy(() => import('./pages/Community.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'))
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers.jsx'))
const ManageQuestions = lazy(() => import('./pages/admin/ManageQuestions.jsx'))
const ManageBlogs = lazy(() => import('./pages/admin/ManageBlogs.jsx'))
const Reports = lazy(() => import('./pages/admin/Reports.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))

function App() {
  return (
    <MockSessionProvider>
      <AdminProvider>
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
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/create-blog" element={<CreateBlog />} />
          <Route path="/coding" element={<CodingPractice />} />
          <Route path="/coding/problem/:id" element={<ProblemDetails />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="questions" element={<ManageQuestions />} />
            <Route path="blogs" element={<ManageBlogs />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="/tags" element={<ComingSoon title="Tags" description="Explore the technologies and topics that interest you." />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
        </NotificationProvider>
      </AdminProvider>
    </MockSessionProvider>
  )
}

export default App
