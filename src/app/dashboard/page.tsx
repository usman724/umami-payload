'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface AnalyticsData {
  pageviews: number
  visitors: number
  sessions: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{ page: string; views: number }>
  topReferrers: Array<{ referrer: string; views: number }>
  topCountries: Array<{ country: string; views: number }>
  topBrowsers: Array<{ browser: string; views: number }>
  topDevices: Array<{ device: string; views: number }>
}

interface Tenant {
  id: string
  name: string
  domain: string
  status: string
  createdAt: string
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get('tenantId')
  
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (tenantId) {
      fetchTenantData()
    }
  }, [tenantId])

  useEffect(() => {
    if (tenantId && dateRange.startDate && dateRange.endDate) {
      fetchAnalyticsData()
    }
  }, [tenantId, dateRange])

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
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      const params = new URLSearchParams({
        tenantId: tenantId!,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      
      const response = await fetch(`/api/analytics?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        setError(data.error || 'Failed to fetch analytics data')
      }
    } catch (err) {
      setError('An error occurred while fetching analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Tenant Selected</h1>
          <p className="text-gray-600 mb-8">Please select a tenant to view analytics.</p>
          <a
            href="/admin"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Admin Panel
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
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
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
                {tenant?.name} Analytics
              </h1>
              <p className="text-gray-600">{tenant?.domain}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Page Views</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.pageviews?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Visitors</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.visitors?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Sessions</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.sessions?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg. Session</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.avgSessionDuration ? `${Math.round(analytics.avgSessionDuration)}s` : '0s'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Pages */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
                <div className="space-y-3">
                  {analytics.topPages?.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate">{page.page}</span>
                      <span className="text-sm font-medium text-gray-900">{page.views.toLocaleString()}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No data available</p>
                  )}
                </div>
              </div>

              {/* Top Referrers */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Referrers</h3>
                <div className="space-y-3">
                  {analytics.topReferrers?.slice(0, 5).map((referrer, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate">{referrer.referrer}</span>
                      <span className="text-sm font-medium text-gray-900">{referrer.views.toLocaleString()}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No data available</p>
                  )}
                </div>
              </div>

              {/* Top Countries */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {analytics.topCountries?.slice(0, 5).map((country, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{country.country}</span>
                      <span className="text-sm font-medium text-gray-900">{country.views.toLocaleString()}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No data available</p>
                  )}
                </div>
              </div>

              {/* Top Browsers */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Browsers</h3>
                <div className="space-y-3">
                  {analytics.topBrowsers?.slice(0, 5).map((browser, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{browser.browser}</span>
                      <span className="text-sm font-medium text-gray-900">{browser.views.toLocaleString()}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600 mb-4">No analytics data available for the selected date range.</p>
            <p className="text-sm text-gray-500">
              Make sure your tracking code is properly installed on your website.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
