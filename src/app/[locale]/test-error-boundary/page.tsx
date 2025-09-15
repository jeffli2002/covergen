'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Error Caught!</h1>
            <p className="text-gray-600 mb-4">The following error was caught:</p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {this.state.error?.toString()}
            </pre>
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-600">Stack trace</summary>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto mt-2">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function TestContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Error Boundary Test</h1>
        <p className="text-gray-600">This page has an error boundary to catch any errors.</p>
        <p className="mt-4 text-green-600">If you see this, no errors were thrown.</p>
      </div>
    </div>
  )
}

export default function TestErrorBoundaryPage() {
  return (
    <ErrorBoundary>
      <TestContent />
    </ErrorBoundary>
  )
}