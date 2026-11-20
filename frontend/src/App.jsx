import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './DashboardLayout.jsx'
import { Footer, Navbar } from './Navigation.jsx'
import { AuthPage, HomePage, WorkspacePage } from './Pages.jsx'
import './App.css'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="login" element={<AuthPage mode="login" />} />
          <Route path="register" element={<AuthPage mode="register" />} />
          <Route path="jobs" element={<WorkspacePage section="jobs" />} />
          <Route path="jobs/:id" element={<WorkspacePage section="job-detail" />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<WorkspacePage section="dashboard" />} />
          <Route path="/profile" element={<WorkspacePage section="profile" />} />
          <Route path="/applications" element={<WorkspacePage section="applications" />} />
          <Route path="/resume" element={<WorkspacePage section="resume" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App