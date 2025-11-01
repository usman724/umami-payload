'use client'

import { useState, useEffect } from 'react'

interface TrackingCodeProps {
  tenantId: string
}

export default function TrackingCodeDisplay({ tenantId }: TrackingCodeProps) {
  const [trackingCode, setTrackingCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchTrackingCode()
  }, [tenantId])

  const fetchTrackingCode = async () => {
    try {
      const response = await fetch(`/api/tracking?tenantId=${tenantId}`)
      const data = await response.json()
      
      if (data.success) {
        setTrackingCode(data.trackingCode)
      } else {
        setError(data.error || 'Failed to fetch tracking code')
      }
    } catch (err) {
      setError('An error occurred while fetching tracking code')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking Code</h3>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Tracking Code</h3>
        <button
          onClick={copyToClipboard}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-md p-4">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
          {trackingCode}
        </pre>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Installation Instructions:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Copy the tracking code above</li>
          <li>Paste it into the <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> section of your website</li>
          <li>Make sure it appears on every page you want to track</li>
          <li>Data will start appearing in your analytics dashboard within a few minutes</li>
        </ol>
      </div>
    </div>
  )
}

