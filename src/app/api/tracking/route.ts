import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { umamiService } from '../../../lib/umami-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required parameter: tenantId' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })
    
    // Get tenant data
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    if (!tenant.umamiWebsiteId) {
      return NextResponse.json(
        { error: 'Tenant does not have an associated Umami website' },
        { status: 400 }
      )
    }

    // Generate tracking code
    const trackingCode = umamiService.generateTrackingCode(tenant.umamiWebsiteId)

    return NextResponse.json({
      success: true,
      trackingCode,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
      },
      umamiWebsiteId: tenant.umamiWebsiteId,
    })

  } catch (error) {
    console.error('Error generating tracking code:', error)
    return NextResponse.json(
      { error: 'Failed to generate tracking code', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
