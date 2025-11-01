import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { umamiService } from '../../../../lib/umami-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: id,
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        status: tenant.status,
        umamiWebsiteId: tenant.umamiWebsiteId,
        settings: tenant.settings,
        contact: tenant.contact,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      },
    })

  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const payload = await getPayload({ config })

    const tenant = await payload.update({
      collection: 'tenants',
      id: id,
      data: body,
    })

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        status: tenant.status,
        settings: tenant.settings,
        contact: tenant.contact,
        updatedAt: tenant.updatedAt,
      },
    })

  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    // Get tenant data before deletion
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: id,
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Delete tenant
    await payload.delete({
      collection: 'tenants',
      id: id,
    })

    // TODO: Also delete associated Umami website and users
    // This would require additional Umami API calls

    return NextResponse.json({
      success: true,
      message: 'Tenant deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json(
      { error: 'Failed to delete tenant', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
