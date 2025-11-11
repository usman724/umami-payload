'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { 
  Eye, 
  Users, 
  Activity, 
  Clock, 
  FileText, 
  Link2, 
  Globe, 
  Monitor, 
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

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
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Tenant Selected</h1>
          <p className="text-gray-600 mb-8">Please select a tenant to view analytics.</p>
          <a
            href="/admin"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Go to Admin Panel
          </a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar tenantName={tenant?.name} tenantDomain={tenant?.domain} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar tenantName={tenant?.name} tenantDomain={tenant?.domain} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Retry
          </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
      <Sidebar tenantName={tenant?.name} tenantDomain={tenant?.domain} />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col pt-16 lg:pt-0">
      {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {tenant?.name} Analytics
              </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{tenant?.domain}</p>
            </div>
              <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 hover:border-blue-300 transition-colors">
                  <Calendar className="w-4 h-4 text-gray-500" strokeWidth={2} />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="bg-transparent border-none text-sm text-gray-700 focus:outline-none"
                />
              </div>
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 hover:border-blue-300 transition-colors">
                  <Calendar className="w-4 h-4 text-gray-500" strokeWidth={2} />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="bg-transparent border-none text-sm text-gray-700 focus:outline-none"
                />
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-2">Page Views</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{analytics.pageviews?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-400">Total page views</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <Eye className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-2">Visitors</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{analytics.visitors?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-400">Unique visitors</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-2">Sessions</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{analytics.sessions?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-400">Total sessions</p>
              </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-2">Avg. Session</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {analytics.avgSessionDuration ? `${Math.round(analytics.avgSessionDuration)}s` : '0s'}
                      </p>
                      <p className="text-xs text-gray-400">Average duration</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.topPages?.slice(0, 5).map((page, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate">{page.page}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 ml-4">{page.views.toLocaleString()}</span>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-sm text-center py-4">No data available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Referrers */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-green-600" strokeWidth={2.5} />
              </div>
                      <h3 className="text-lg font-semibold text-gray-900">Top Referrers</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.topReferrers?.slice(0, 5).map((referrer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-green-600">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate">{referrer.referrer || 'Direct'}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 ml-4">{referrer.views.toLocaleString()}</span>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-sm text-center py-4">No data available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Countries */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
              </div>
                      <h3 className="text-lg font-semibold text-gray-900">Top Countries</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.topCountries?.slice(0, 5).map((country, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                </div>
                            <span className="text-sm font-medium text-gray-700">{country.country}</span>
              </div>
                          <span className="text-sm font-bold text-gray-900 ml-4">{country.views.toLocaleString()}</span>
                    </div>
                  )) || (
                        <p className="text-gray-500 text-sm text-center py-4">No data available</p>
                  )}
                </div>
                </div>
              </div>

              {/* Top Browsers */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Top Browsers</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                  {analytics.topBrowsers?.slice(0, 5).map((browser, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{browser.browser}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 ml-4">{browser.views.toLocaleString()}</span>
                    </div>
                  )) || (
                        <p className="text-gray-500 text-sm text-center py-4">No data available</p>
                  )}
                </div>
                  </div>
              </div>
            </div>
          </>
        ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600 mb-4">No analytics data available for the selected date range.</p>
            <p className="text-sm text-gray-500">
              Make sure your tracking code is properly installed on your website.
            </p>
          </div>
        )}
        </main>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
