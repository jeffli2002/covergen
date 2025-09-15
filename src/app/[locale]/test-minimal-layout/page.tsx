export default function TestMinimalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Minimal Layout Test</h1>
        <p className="text-gray-600">This page uses its own minimal layout without providers.</p>
        <p className="mt-4 text-green-600">If you can see this, the issue is with the Providers component.</p>
      </div>
    </div>
  )
}