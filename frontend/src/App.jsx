import { Navigate, Route, Routes } from 'react-router-dom'

import RequireAuth from './components/RequireAuth.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import DashboardHome from './pages/dashboard/DashboardHome.jsx'
import DocumentDetail from './pages/dashboard/DocumentDetail.jsx'
import NewDocument from './pages/dashboard/NewDocument.jsx'

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
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="new" element={<NewDocument />} />
          <Route path="documents/:id" element={<DocumentDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
