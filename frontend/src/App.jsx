import { Navigate, Route, Routes } from 'react-router-dom'

import RequireAuth from './components/RequireAuth.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import AppHome from './pages/AppHome.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppHome />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
