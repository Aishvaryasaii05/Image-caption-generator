import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function History() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setHistory([])
      setLoading(false)
      return
    }
    fetchHistory()
  }, [isLoaded, isSignedIn])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      if (!token) {
        throw new Error('Could not verify your sign-in. Please sign in again.')
      }
      const response = await fetch(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch history')
      }

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from the history service')
      }
      setHistory(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id) => {
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Could not verify your sign-in. Please sign in again.')
      }
      const response = await fetch(`${API_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete item')
      }

      setHistory((items) => items.filter((item) => item.id !== id))
      setDeleteError(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Caption History</h1>

      {!isLoaded && (
        <p className="py-12 text-center text-gray-400">Checking your sign-in...</p>
      )}

      {isLoaded && !isSignedIn && (
        <div className="rounded-2xl border border-gray-700 bg-gray-900 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-white">Your captions are private to your account.</p>
          <p className="mt-2 text-gray-400">Sign in to view and manage your caption history.</p>
          <button type="button" onClick={() => navigate('/sign-in')} className="accent-button mt-6 rounded-lg px-5 py-3 font-semibold">
            Sign in to view history
          </button>
        </div>
      )}

      {isLoaded && isSignedIn && loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading history...</p>
        </div>
      )}

      {isLoaded && isSignedIn && error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          Error: {error}
        </div>
      )}

      {isLoaded && isSignedIn && deleteError && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200" role="alert">
          Error: {deleteError}
        </div>
      )}

      {isLoaded && isSignedIn && !loading && !error && history.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No captions generated yet.</p>
          <p className="text-gray-500 mt-2">Start creating captions on the home page!</p>
        </div>
      )}

      {isLoaded && isSignedIn && !loading && !error && history.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-400 transition-colors"
            >
              {/* Image Thumbnail */}
              <div className="aspect-video bg-gray-700 relative">
                <img
                  src={`data:${item.image_type};base64,${item.image_data}`}
                  alt="Caption thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                  {item.caption}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="bg-gray-700 px-2 py-1 rounded text-gray-200">
                    {item.style.replace('-', ' ')}
                  </span>
                  <span>{new Date(`${item.created_at.replace(' ', 'T')}Z`).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => deleteItem(item.id)}
                  type="button"
                  className="w-full py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default History
