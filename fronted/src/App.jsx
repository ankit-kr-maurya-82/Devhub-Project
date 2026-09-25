import { lazy } from 'react'
import PageBoundary from '../components/PageBoundary.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import Home from '../pages/Home.jsx'
import ComingSoon from '../pages/ComingSoon.jsx'
import NotFound from '../pages/NotFound.jsx'

const Login = lazy(() => import('../pages/Login.jsx'))
const Register = lazy(() => import('../pages/Register.jsx'))
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PageBoundary key="login"><Login /></PageBoundary>} />
        <Route path="/register" element={<PageBoundary key="register"><Register /></PageBoundary>} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route path="/ask-question" element={<AskQuestion />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/create-blog" element={<CreateBlog />} />
          <Route path="/coding" element={<CodingPractice />} />
          <Route path="/coding/problem/:id" element={<ProblemDetails />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/community" element={<Community />} />
          <Route path="/tags" element={<ComingSoon title="Tags" description="Explore the technologies and topics that interest you." />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
