import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthenticateWithRedirectCallback } from '@clerk/react'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import History from './pages/History'

function AppContent() {
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('image-caption-generator-theme-v2') !== 'light',
  )

  useEffect(() => {
    localStorage.setItem('image-caption-generator-theme-v2', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (!location.hash) return undefined

    const timeoutId = window.setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      })
    }, 100)

    return () => window.clearTimeout(timeoutId)
  }, [location.key, location.pathname, location.hash])

  return (
    <div
      data-theme={darkMode ? 'dark' : 'light'}
      className="app-shell min-h-screen text-gray-100"
    >
      <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode((value) => !value)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
