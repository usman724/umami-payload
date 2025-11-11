'use client'

import { useEffect } from 'react'

export function AdminCustomizations() {
  useEffect(() => {
    // Icon map for collections
    const collectionIcons: Record<string, string> = {
      'Users': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      'Media': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
      'Tenants': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>`,
      'Analytics': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
    }

    const addIconsAndImprove = () => {
      // Replace "Collections" with "Dashboard" in main content area
      const mainHeadings = document.querySelectorAll('.collection-list__header-title, .dashboard__label, h1, [class*="header-title"]')
      mainHeadings.forEach((heading) => {
        if (heading.textContent?.trim() === 'Collections') {
          heading.textContent = 'Dashboard'
        }
      })

      // Add logo and branding at the top of the sidebar
      const nav = document.querySelector('.nav')
      if (nav && !nav.querySelector('.hivefinty-nav-header')) {
        // Create header element
        const header = document.createElement('div')
        header.className = 'hivefinty-nav-header'
        header.innerHTML = `
          <div class="hivefinty-brand">
            <img src="/logo.png" alt="Hivefinty" class="hivefinty-logo" />
            <span class="hivefinty-brand-text">Hivefinty</span>
          </div>
        `
        
        // Insert at the beginning of nav
        nav.insertBefore(header, nav.firstChild)
      }

      // Replace "Collections" with "Hivefinty" in sidebar and add icons
      const sidebarLabels = document.querySelectorAll('.nav-group__label, .nav__group-label, .entity-list__header-label')
      sidebarLabels.forEach((label) => {
        const text = label.textContent?.trim()
        if (text === 'Collections') {
          label.textContent = 'Hivefinty'
          label.classList.add('hivefinty-label')
        }
      })

      // Add icons to collection links in sidebar
      const entityListItems = document.querySelectorAll('.entity-list-item')
      entityListItems.forEach((item) => {
        // Skip if already has an icon
        if (item.querySelector('.collection-icon')) {
          return
        }

        const label = item.querySelector('.entity-list-item__label')
        const collectionName = label?.textContent?.trim()
        
        if (collectionName && collectionIcons[collectionName]) {
          // Create icon container
          const iconContainer = document.createElement('div')
          iconContainer.className = 'collection-icon'
          iconContainer.innerHTML = collectionIcons[collectionName]
          
          // Insert icon at the beginning
          item.insertBefore(iconContainer, item.firstChild)
          
          // Add data attribute for styling
          item.setAttribute('data-collection', collectionName.toLowerCase())
        }
      })

      // Replace hamburger menu with arrow toggle
      const menuButtons = document.querySelectorAll('button[aria-label*="menu"], button[aria-label*="Menu"], button[aria-label*="toggle"], button[aria-label*="Toggle"], .nav__toggle, .nav__collapse-button')
      menuButtons.forEach((button) => {
        if (button.querySelector('.custom-arrow-icon')) {
          return
        }

        const svg = button.querySelector('svg')
        if (svg) {
          const paths = svg.querySelectorAll('path')
          const rects = svg.querySelectorAll('rect')
          const isHamburger = paths.length >= 3 || (rects.length >= 3 && paths.length === 0)
          
          if (isHamburger || button.getAttribute('aria-label')?.toLowerCase().includes('menu')) {
            svg.style.display = 'none'
            
            const arrowIcon = document.createElement('div')
            arrowIcon.className = 'custom-arrow-icon'
            arrowIcon.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            `
            
            button.appendChild(arrowIcon)
            
            const updateArrow = () => {
              const isCollapsed = button.classList.contains('collapsed') || 
                                 button.getAttribute('aria-expanded') === 'false' ||
                                 button.getAttribute('aria-pressed') === 'true'
              arrowIcon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'
            }
            
            updateArrow()
            
            const buttonObserver = new MutationObserver(updateArrow)
            buttonObserver.observe(button, {
              attributes: true,
              attributeFilter: ['class', 'aria-expanded', 'aria-pressed']
            })
            
            button.addEventListener('click', () => {
              setTimeout(updateArrow, 100)
            })
          }
        }
      })
    }

    // Run immediately and after delays
    addIconsAndImprove()
    setTimeout(addIconsAndImprove, 500)
    setTimeout(addIconsAndImprove, 1000)
    setTimeout(addIconsAndImprove, 2000)

    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      addIconsAndImprove()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}

