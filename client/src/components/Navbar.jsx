import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

function AccountAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false)
  const email = user?.primaryEmailAddress?.emailAddress || user?.email
  const imageUrl = user?.imageUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const initial = (user?.fullName || user?.firstName || email || 'A').trim().charAt(0).toUpperCase()

  return (
    <Link
      to="/account"
      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-emerald-400/70 bg-emerald-500 text-sm font-semibold text-white shadow-sm"
      title={email || 'Signed-in account'}
      aria-label={email || 'Signed-in account'}
      role="img"
    >
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : initial}
    </Link>
  )
}

export default function Navbar({ darkMode, toggleDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoaded, isSignedIn, signOut, user } = useAuth()

  const sections = [
    { id: 'generator', label: 'Create' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'audience', label: "Who it's for" },
    { id: 'faq', label: 'FAQ' },
    { id: 'watch-demo', label: 'Watch the demo' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-700 bg-gray-900 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="order-1 flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight text-white sm:text-lg">
          <img src="/brand-mark.svg" alt="" className="h-8 w-8" aria-hidden="true" />
          <span>Image Caption Generator</span>
        </Link>
        <div className="order-2 flex shrink-0 items-center gap-2 sm:order-3">
          <Link
            to="/history"
            className={`nav-link rounded-md px-2 py-2 text-xs font-medium transition-colors hover:bg-gray-800 hover:text-white sm:px-3 sm:text-sm ${
              location.pathname === '/history' ? 'nav-link-active' : 'text-gray-300'
            }`}
          >
            History
          </Link>
          {isLoaded && (isSignedIn ? (
            <>
              <AccountAvatar user={user} />
              <button
                type="button"
                onClick={signOut}
                className="accent-button rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/sign-in')}
              className="accent-button rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:text-sm"
            >
              Sign in
            </button>
          ))}
          <button
            onClick={toggleDarkMode}
            type="button"
            className="nav-theme-button rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-200 hover:bg-gray-700"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.5 15.5A8.5 8.5 0 018.5 3.5 8.5 8.5 0 1020.5 15.5z" />
              </svg>
            )}
          </button>
        </div>
        <div className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-2 sm:w-auto">
          {sections.map(({ id, label }) => (
            location.pathname === '/'
              ? (
                <a
                  key={id}
                  href={`#${id}`}
                  className="nav-link shrink-0 rounded-md px-2 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white sm:px-3 sm:text-sm"
                >
                  {label}
                </a>
              )
              : (
                <Link
                  key={id}
                  to={`/#${id}`}
                  className="nav-link shrink-0 rounded-md px-2 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white sm:px-3 sm:text-sm"
                >
                  {label}
                </Link>
              )
          ))}
        </div>
      </div>
    </nav>
  )
}
