'use client'

import { useEffect } from 'react'

export default function TestGAPage() {
  useEffect(() => {
    // Log page view for testing
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('Google Analytics is loaded')
      window.gtag('event', 'page_view', {
        page_title: 'Test GA Page',
        page_location: window.location.href,
        page_path: window.location.pathname,
      })
    } else {
      console.log('Google Analytics is not loaded')
    }
  }, [])

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'test_button_click', {
        event_category: 'engagement',
        event_label: 'test button',
      })
      alert('Event sent to Google Analytics!')
    } else {
      alert('Google Analytics is not loaded')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Google Analytics Test Page</h1>
      <p className="mb-4">This page is for testing Google Analytics integration.</p>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">GA Status:</h2>
        <p>Open the browser console to see if GA is loaded.</p>
        <p>GA Measurement ID: {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'Not set'}</p>
      </div>

      <button
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Send Test Event to GA
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Set your GA Measurement ID in .env.local: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX</li>
          <li>Restart the development server</li>
          <li>Open browser developer tools and check the Console and Network tabs</li>
          <li>Click the test button to send an event</li>
          <li>Check your Google Analytics real-time dashboard</li>
        </ol>
      </div>
    </div>
  )
}