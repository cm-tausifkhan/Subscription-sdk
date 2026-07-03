import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './components/LoginPage'
import DashboardPage from './components/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Base URL (http://localhost:5173/) shows the Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Dashboard URL (http://localhost:5173/dashboard) shows the Dashboard Page */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Catch-all: Redirects any unknown URLs back to the login page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}