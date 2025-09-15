'use client'

import { useState } from 'react'

export default function TestNoHookPage() {
  const [status, setStatus] = useState('Ready')

  const handleClick = () => {
    setStatus('Button clicked!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Test Without Auth Hook</h1>
        <p className="text-gray-600 mb-4">Status: {status}</p>
        <button
          onClick={handleClick}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Test Button
        </button>
        <p className="mt-4 text-sm text-gray-500">
          This page doesn't use any auth hooks or context.
        </p>
      </div>
    </div>
  )
}