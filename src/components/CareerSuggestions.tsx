'use client'

import { useState } from 'react'
import { getCareerSuggestions } from '@/app/dashboard/actions'

interface Suggestion {
  career_path: string
  reason: string
}

export default function CareerSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setError(null)
    setSuggestions([])

    const result = await getCareerSuggestions()

    if (result.error) {
      setError(result.error)
    } else if (result.suggestions) {
      setSuggestions(result.suggestions)
    }

    setIsLoading(false)
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold">Personalized Career Suggestions</h2>
      <p className="mt-2 text-gray-600">
        Click the button below to get AI-powered career suggestions based on your profile and resume.
      </p>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="mt-4 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-green-300"
      >
        {isLoading ? 'Generating...' : 'Generate Suggestions'}
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {suggestions.length > 0 && (
        <div className="mt-6 space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
              <h3 className="text-xl font-bold text-indigo-700">{suggestion.career_path}</h3>
              <p className="mt-2 text-gray-700">{suggestion.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
