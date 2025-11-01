import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { umamiService } from '../../../lib/umami-service'

export async function POST(request: NextRequest) {
  try {
    // Support X-Payload-HTTP-Method-Override: GET (Payload admin may POST form data with method override)
    const methodOverride = request.headers.get('x-payload-http-method-override')?.toUpperCase()
    const contentType = request.headers.get('content-type') || ''

    if (methodOverride === 'GET') {
      // Treat this POST as a GET with query params coming from form body
      const text = await request.text()
      const form = new URLSearchParams(text)
      const url = new URL(request.url)
      form.forEach((value, key) => url.searchParams.set(key, value))
      const getRequest = new Request(url.toString(), { method: 'GET', headers: request.headers }) as unknown as NextRequest
      return GET(getRequest)
    }

    // Accept JSON, x-www-form-urlencoded, and multipart/form-data bodies
    let body: any
    if (contentType.includes('application/json')) {
      try {
        body = await request.json()
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError)
        return NextResponse.json(
          { error: 'Invalid JSON in request body', details: jsonError instanceof Error ? jsonError.message : 'Unknown JSON error' },
          { status: 400 }
        )
      }
    } else if (contentType.includes('multipart/form-data')) {
      // Payload Admin sends multipart with a _payload field containing JSON
      try {
        const form = await request.formData()
        const raw = form.get('_payload') || form.get('payload') || form.get('data')
        if (!raw || typeof raw !== 'string') {
          return NextResponse.json(
            { error: 'Invalid multipart payload', details: 'Expected a _payload field containing JSON string' },
            { status: 400 }
          )
        }
        body = JSON.parse(raw)
      } catch (e) {
        console.error('Multipart parsing error:', e)
        return NextResponse.json(
          { error: 'Invalid multipart/form-data', details: e instanceof Error ? e.message : 'Unknown multipart error' },
          { status: 400 }
        )
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text()
      const form = new URLSearchParams(text)
      // Map common form fields to our expected structure
      body = {
        name: form.get('name') || form.get('tenantName'),
        domain: form.get('domain') || undefined,
        contact: {
          email: form.get('contact[email]') || form.get('contactEmail') || form.get('email') || undefined,
        },
        settings: {
          allowPublicAnalytics: (form.get('allowPublicAnalytics') ?? 'false') === 'true',
          maxWebsites: form.get('maxWebsites') ? Number(form.get('maxWebsites')) : undefined,
          retentionDays: form.get('retentionDays') ? Number(form.get('retentionDays')) : undefined,
        },
      }
    } else {
      // Unsupported content type
      return NextResponse.json(
        { error: 'Unsupported Content-Type', details: `Expected application/json, application/x-www-form-urlencoded, or multipart/form-data. Got: ${contentType}` },
        { status: 415 }
      )
    }
    
    console.log('Received body:', body)
    
    const { name, domain, contact, settings } = body

    // Validate required fields
    if (!name || !domain || !contact?.email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, domain, and contact.email are required' },
        { status: 400 }
      )
    }

    // Check if domain already exists
    const payload = await getPayload({ config })
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        domain: {
          equals: domain,
        },
      },
    })

    if (existingTenant.docs.length > 0) {
      return NextResponse.json(
        { error: 'A tenant with this domain already exists' },
        { status: 409 }
      )
    }

    // Create tenant with Umami website
    const { tenant, umamiWebsite } = await umamiService.createTenantWithUmamiWebsite({
      name,
      domain,
      contact,
      settings,
    })

    // Generate tracking code
    const trackingCode = umamiService.generateTrackingCode(umamiWebsite.id)

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        status: tenant.status,
        createdAt: tenant.createdAt,
      },
      umamiWebsite: {
        id: umamiWebsite.id,
        name: umamiWebsite.name,
        domain: umamiWebsite.domain,
      },
      trackingCode,
    })

  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = { equals: status }
    }

    const tenants = await payload.find({
      collection: 'tenants',
      where,
      page,
      limit,
      sort: '-createdAt',
    })

    // Return in Payload REST shape expected by Admin UI (docs, page, limit, totalDocs, totalPages, etc.)
    return NextResponse.json(tenants)

  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
