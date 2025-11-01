import { getPayload } from 'payload'
import config from '../../payload.config'
import { NextResponse } from 'next/server'

// This endpoint forces Payload to initialize, which will trigger push:true
// Call this on container startup to ensure tables are created before first request
export async function GET() {
  try {
    const payload = await getPayload({ config })
    return NextResponse.json({ 
      success: true, 
      message: 'Payload initialized successfully',
      initialized: true 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

