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
    
    // Force database connection and schema creation
    console.log('🔌 Forcing database connection and schema creation (push:true)...')
    
    // Try to access a collection - this will trigger push:true to create tables
    try {
      // This will trigger schema creation if tables don't exist
      const result = await payload.count({
        collection: 'users',
      })
      console.log('✅ Database tables exist! Users count:', result.totalDocs)
    } catch (dbError: any) {
      // If tables don't exist, push:true should create them
      // Wait a bit for schema creation to complete
      console.log('⏳ Tables not found, waiting for push:true to create schema...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Try again after waiting
      try {
        const result = await payload.count({
          collection: 'users',
        })
        console.log('✅ Database tables created! Users count:', result.totalDocs)
      } catch (retryError: any) {
        console.error('❌ Database tables still not created after push:true attempt')
        console.error('Error:', retryError.message)
        
        // Force schema push by accessing the adapter directly
        const adapter = payload.db as any
        if (adapter?.push) {
          console.log('🔄 Attempting manual schema push...')
          try {
            await adapter.push()
            console.log('✅ Manual schema push completed')
            
            // Wait and verify again
            await new Promise(resolve => setTimeout(resolve, 3000))
            const verifyResult = await payload.count({ collection: 'users' })
            console.log('✅ Schema verified! Users count:', verifyResult.totalDocs)
          } catch (pushError: any) {
            console.error('❌ Manual schema push failed:', pushError.message)
            throw pushError
          }
        } else {
          throw retryError
        }
      }
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

