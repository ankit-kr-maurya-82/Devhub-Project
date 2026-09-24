import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Profile from '../pages/Profile.jsx'
import Questions from '../pages/Questions.jsx'
import QuestionDetails from '../pages/QuestionDetails.jsx'
import AskQuestion from '../pages/AskQuestion.jsx'
import Blogs from '../pages/Blogs.jsx'
import BlogDetails from '../pages/BlogDetails.jsx'
import CreateBlog from '../pages/CreateBlog.jsx'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
