import { useRef, useState } from 'react'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUpload({ onImageSelect, selectedImage, onError, onRemove }) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      const message = 'Please upload a JPG, PNG, or WEBP image.'
      setError(message)
      return
    }

    if (file.size > MAX_SIZE) {
      const message = 'Image must be 5 MB or smaller.'
      setError(message)
      return
    }

    setError('')
    onError(null)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelect(file, reader.result)
      } else {
        const message = 'Could not preview this image. Please try another file.'
        setError(message)
      }
    }
    reader.onerror = () => {
      const message = 'Could not read this image. Please try another file.'
      setError(message)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.type === 'dragleave') {
      setDragActive(false)
    } else {
      setDragActive(true)
    }
  }

  const handleClick = () => fileInputRef.current?.click()

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Choose an image to upload"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
          }
        }}
        className={`upload-dropzone relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          dragActive
            ? 'border-blue-500 bg-blue-950/40'
            : 'border-gray-600 bg-gray-950 hover:border-blue-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setDragActive(false)
          handleFile(event.dataTransfer.files?.[0])
        }}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Upload an image"
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        {selectedImage ? (
          <div className="space-y-4">
            <img
              src={selectedImage}
              alt="Selected image preview"
              className="max-h-64 mx-auto rounded-lg shadow-lg"
            />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <p className="text-sm text-gray-400">Click to change image</p>
              <button
                type="button"
                className="remove-image-button rounded-md border px-3 py-1.5 text-xs font-semibold"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove()
                }}
                aria-label="Remove selected image"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-300">
              <p className="text-lg font-semibold">Drop your image here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            </div>
            <p className="text-xs text-gray-500">JPG, PNG, or WEBP (max 5 MB)</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
