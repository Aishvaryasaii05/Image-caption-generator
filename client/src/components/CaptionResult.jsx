import { useState } from 'react'

export default function CaptionResult({ caption, onRegenerate, loading, isGuest }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      setCopyError('')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError('Could not copy automatically. Please select and copy the caption.')
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">Generated Caption</h3>
      {isGuest && (
        <p className="mb-4 text-sm text-blue-200">
          This guest caption isn’t saved to history. Sign in to keep your captions.
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          <span className="ml-3 text-gray-400">Generating caption...</span>
        </div>
      ) : (
        <>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 min-h-[100px]" aria-live="polite">
            <p className="text-gray-200 whitespace-pre-wrap">{caption}</p>
          </div>

          {copyError && <p className="text-sm text-red-300 mb-3" role="alert">{copyError}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              type="button"
              className="accent-button flex flex-1 items-center justify-center rounded-lg px-4 py-2 font-medium"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>

            <button
              onClick={onRegenerate}
              type="button"
              disabled={loading}
              className="flex flex-1 items-center justify-center rounded-lg border border-blue-900 bg-blue-950 px-4 py-2 font-medium text-blue-100 transition-colors hover:border-blue-700 hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
