import { NextRequest, NextResponse } from 'next/server'
import { umamiService } from '../../../../lib/umami-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      tenantName, 
      domain, 
      contactEmail, 
      contactPhone, 
      contactAddress,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      settings 
    } = body

    // Validate required fields
    if (!tenantName || !domain || !contactEmail || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantName, domain, contactEmail, adminEmail, adminPassword are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail) || !emailRegex.test(adminEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate domain format (basic validation)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      )
    }

    // Create tenant with Umami website
    const { tenant, umamiWebsite } = await umamiService.createTenantWithUmamiWebsite({
      name: tenantName,
      domain,
      contact: {
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress,
      },
      settings: {
        allowPublicAnalytics: settings?.allowPublicAnalytics || false,
        maxWebsites: settings?.maxWebsites || 5,
        retentionDays: settings?.retentionDays || 90,
      },
    })

    // Create admin user for the tenant
    const adminUser = await umamiService.createTenantUser(tenant.id, {
      email: adminEmail,
      password: adminPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'admin',
    })

    // Generate tracking code
    const trackingCode = umamiService.generateTrackingCode(umamiWebsite.id)

    return NextResponse.json({
      success: true,
      message: 'Tenant created successfully',
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          status: tenant.status,
        },
        umamiWebsite: {
          id: umamiWebsite.id,
          name: umamiWebsite.name,
          domain: umamiWebsite.domain,
        },
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
        trackingCode,
      },
    })

  } catch (error) {
    console.error('Error in tenant signup:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
