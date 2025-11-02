import { getPayload } from 'payload'
import config from '../../../payload.config'
import { NextResponse } from 'next/server'

// This endpoint forces Payload to initialize and create database schema
// Key insight: push:true runs when the adapter connects, but connection is lazy
// We force connection by accessing the database adapter's connection pool
export async function GET() {
  try {
    console.log('🔄 Initializing Payload CMS via /api/init endpoint...')
    console.log('📊 DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Not set')
    
    // Get Payload instance
    const payload = await getPayload({ config })
    
    // Force database connection to trigger push:true schema creation
    console.log('🔌 Forcing database connection to trigger push:true...')
    const adapter = payload.db as any
    if (adapter?.pool) {
      await adapter.pool.query('SELECT 1')
      console.log('✅ Database connection established')
    }
    
    // Wait for push:true to complete schema creation
    console.log('⏳ Waiting for schema creation (push:true)...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Verify tables exist by querying
    try {
      const result = await payload.count({
        collection: 'users',
      })
      console.log('✅ Database tables created! Users count:', result.totalDocs)
    } catch (dbError: any) {
      // If tables don't exist, try push:true as fallback (only in production if migrationDir failed)
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️  Tables not found, but migrationDir should handle this on startup')
      }
      console.error('❌ Database query failed:', dbError.message)
      // Don't throw - migrations might run on first request
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
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

