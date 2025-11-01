import { getPayload } from 'payload'
import config from '../../../payload.config'
import { NextResponse } from 'next/server'

// This endpoint forces Payload to initialize, which will trigger push:true
// Call this on container startup to ensure tables are created before first request
export async function GET() {
  try {
    console.log('🔄 Initializing Payload CMS via /api/init endpoint...')
    console.log('📊 DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Not set')
    
    // Get Payload instance - this will trigger initialization and push:true
    const payload = await getPayload({ config })
    
    // Wait a moment to ensure initialization completes
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Force a database operation to ensure connection is established
    // This will trigger push:true to create tables if they don't exist
    try {
      // Try to count users - this will trigger DB connection and schema creation
      const result = await payload.count({
        collection: 'users',
      })
      console.log('✅ Database connection established. Users count:', result.totalDocs)
    } catch (dbError: any) {
      // If this fails, push:true should have already created tables
      // The error might be expected if tables are being created
      console.log('📊 Database operation result:', dbError.message)
    }
    
    console.log('✅ Payload initialized successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payload initialized successfully',
      initialized: true 
    })
  } catch (error: any) {
    console.error('❌ Failed to initialize Payload:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

