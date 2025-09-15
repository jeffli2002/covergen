export default function TestStaticPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Static Test Page</h1>
        <p className="text-gray-600">This is a simple static page to test if the locale routing works.</p>
        <p className="mt-4">If you can see this, the locale routing is working.</p>
      </div>
    </div>
  )
}