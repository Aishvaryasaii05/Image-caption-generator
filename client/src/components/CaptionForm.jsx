const STYLES = [
  { value: 'short', label: 'Short' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'funny', label: 'Funny' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'professional', label: 'Professional' },
  { value: 'alt-text', label: 'Alt-text' },
]

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'hindi', label: 'Hindi' },
]

function CaptionForm({
  onGenerate,
  loading,
  disabled,
  style,
  language,
  isLoaded,
  isSignedIn,
  onStyleChange,
  onLanguageChange,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isLoaded) return
    onGenerate(style, language)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-700 bg-gray-950 p-5 sm:p-6">
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Style Selector */}
        <div>
          <label htmlFor="caption-style" className="block text-sm font-semibold mb-2">
            Caption Style
          </label>
          <select
            id="caption-style"
            value={style}
            onChange={(e) => onStyleChange(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled || loading}
          >
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div>
          <label htmlFor="caption-language" className="block text-sm font-semibold mb-2">
            Language
          </label>
          <select
            id="caption-language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled || loading}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      {!isLoaded ? (
        <button
          type="button"
          disabled
          className="accent-button flex w-full cursor-not-allowed items-center justify-center rounded-lg py-3 font-semibold"
        >
          Checking sign-in...
        </button>
      ) : (
        <button
          type="submit"
          disabled={disabled || loading}
          className="accent-button flex w-full items-center justify-center rounded-lg py-3 font-semibold disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Generating...
            </>
          ) : (
            isSignedIn ? 'Generate Caption' : 'Generate as Guest'
          )}
        </button>
      )}
      {isLoaded && !isSignedIn && (
        <p className="mt-3 text-center text-sm text-gray-400">
          Guests can generate up to 5 captions per hour. Sign in to save captions to your private history.
        </p>
      )}
    </form>
  )
}

export default CaptionForm
