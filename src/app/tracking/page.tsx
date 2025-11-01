'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import TrackingCodeDisplay from '../../components/TrackingCodeDisplay'

interface Tenant {
  id: string
  name: string
  domain: string
  status: string
}

function TrackingCodeContent() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get('tenantId')
  
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tenantId) {
      fetchTenantData()
    }
  }, [tenantId])

  const fetchTenantData = async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`)
      const data = await response.json()
      
      if (data.success) {
        setTenant(data.tenant)
      } else {
        setError(data.error || 'Failed to fetch tenant data')
      }
    } catch (err) {
      setError('An error occurred while fetching tenant data')
    } finally {
      setLoading(false)
    }
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Tenant Selected</h1>
          <p className="text-gray-600 mb-8">Please select a tenant to view tracking code.</p>
          <a
            href="/tenants"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Tenants
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenant data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tracking Code - {tenant?.name}
              </h1>
              <p className="text-gray-600">{tenant?.domain}</p>
            </div>
            <div className="flex space-x-4">
              <a
                href={`/dashboard?tenantId=${tenantId}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                View Analytics
              </a>
              <a
                href="/tenants"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Back to Tenants
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TrackingCodeDisplay tenantId={tenantId} />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Installation Guide */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Installation Guide</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1. HTML Websites</h4>
                <p>Add the tracking code to the <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> section of your HTML pages:</p>
                <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-x-auto">
{`<head>
  <!-- Your existing head content -->
  <script async src="http://localhost:3000/script.js" data-website-id="YOUR_WEBSITE_ID"></script>
</head>`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2. WordPress</h4>
                <p>Add the code to your theme's <code className="bg-gray-100 px-1 rounded">header.php</code> file or use a plugin like "Insert Headers and Footers".</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">3. React/Next.js</h4>
                <p>Add the script to your <code className="bg-gray-100 px-1 rounded">_document.js</code> or <code className="bg-gray-100 px-1 rounded">_app.js</code> file.</p>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verification</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How to Verify Installation</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Visit your website in a new browser tab</li>
                  <li>Open Developer Tools (F12)</li>
                  <li>Go to the Network tab</li>
                  <li>Look for requests to <code className="bg-gray-100 px-1 rounded">localhost:3000</code></li>
                  <li>Check your analytics dashboard for new data</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Issues</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure the script is in the <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> section</li>
                  <li>Check that the website ID is correct</li>
                  <li>Ensure your website is publicly accessible</li>
                  <li>Wait a few minutes for data to appear</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  If you're having trouble installing the tracking code or seeing data in your analytics dashboard, 
                  please check the troubleshooting guide above or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrackingCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TrackingCodeContent />
    </Suspense>
  )
}
