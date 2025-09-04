import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ToolNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">Tool Not Found</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          The tool you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/tools">
            <Button variant="outline">
              View All Tools
            </Button>
          </Link>
          <Link href="/">
            <Button>
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}