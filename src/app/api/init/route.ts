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
    
    // Force database connection and schema creation via push:true
    console.log('🔌 Triggering schema creation with push:true...')
    
    // Access the adapter directly to ensure connection
    const adapter = payload.db as any
    if (adapter?.pool) {
      // Establish connection first
      await adapter.pool.query('SELECT 1')
      console.log('✅ Database connection established')
      
      // Give adapter time to run push:true
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    // Now try to access a collection - this should trigger push:true if not already done
    let retries = 3
    let lastError: any = null
    
    while (retries > 0) {
      try {
        const result = await payload.count({
          collection: 'users',
        })
        console.log('✅ Database tables created! Users count:', result.totalDocs)
        break // Success!
      } catch (dbError: any) {
        lastError = dbError
        retries--
        
        if (retries > 0) {
          console.log(`⏳ Tables not found yet, waiting for push:true... (${retries} retries left)`)
          await new Promise(resolve => setTimeout(resolve, 4000))
        } else {
          console.error('❌ Failed to create tables after multiple attempts')
          console.error('Error:', dbError.message)
          
          // Last resort: check if push happened but failed silently
          const adapter = payload.db as any
          if (adapter?.migrate) {
            console.log('🔄 Trying migrate() as alternative...')
            try {
              await adapter.migrate()
              await new Promise(resolve => setTimeout(resolve, 3000))
              const verifyResult = await payload.count({ collection: 'users' })
              console.log('✅ Schema created via migrate()! Users count:', verifyResult.totalDocs)
            } catch (migrateError: any) {
              throw new Error(`Schema creation failed. push:true and migrate() both failed. Last error: ${migrateError.message}`)
            }
          } else {
            throw new Error(`Schema creation failed. Tables don't exist and push:true didn't create them. Error: ${dbError.message}`)
          }
        }
      }
    }
    
    if (lastError && retries === 0) {
      throw lastError
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

