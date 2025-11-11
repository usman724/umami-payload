'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, FileText, Settings, User, Menu, X, ChevronLeft } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  tenantName?: string
  tenantDomain?: string
}

export default function Sidebar({ tenantName, tenantDomain }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
      name: 'Analytics',
      href: '/dashboard',
      icon: <BarChart3 className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
      name: 'Reports',
      href: '/dashboard',
      icon: <FileText className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
      name: 'Settings',
      href: '/admin',
      icon: <Settings className="w-5 h-5" strokeWidth={2.5} />,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Hivefinty Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Hivefinty</h2>
              {tenantName && (
                <p className="text-xs text-gray-400 truncate max-w-[140px]">{tenantName}</p>
              )}
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 flex items-center justify-center mx-auto">
            <Image
              src="/logo.png"
              alt="Hivefinty Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        )}
        <button
          onClick={() => {
            setIsCollapsed(!isCollapsed)
            setIsMobileOpen(false)
          }}
          className="hidden lg:flex p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className={`font-medium ${active ? 'text-white' : 'text-gray-300'}`}>{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/admin"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <User className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          {!isCollapsed && <span className="font-medium">Admin Panel</span>}
        </Link>
      </div>
    </aside>
    </>
  )
}

