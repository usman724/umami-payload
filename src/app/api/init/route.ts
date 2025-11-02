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
    
    // Access the adapter directly
    const adapter = payload.db as any
    
    // Log adapter methods for debugging
    console.log('📋 Adapter methods available:', Object.keys(adapter || {}))
    console.log('📋 Adapter.push type:', typeof adapter?.push)
    console.log('📋 Adapter.pool exists:', !!adapter?.pool)
    
    // Establish connection first
    if (adapter?.pool) {
      await adapter.pool.query('SELECT 1')
      console.log('✅ Database connection established')
    }
    
    // Try to trigger push by accessing a collection
    // This should automatically trigger push:true if enabled
    console.log('🔄 Attempting to access users collection to trigger push:true...')
    try {
      // This query should trigger push:true automatically
      const testResult = await payload.find({
        collection: 'users',
        limit: 0,
        where: {
          id: {
            exists: false, // This will fail but might trigger push
          },
        },
      })
      console.log('✅ Collection access succeeded (tables exist)')
    } catch (triggerError: any) {
      // If it's a "does not exist" error, push:true should create tables
      if (triggerError.message?.includes('does not exist') || triggerError.cause?.code === '42P01') {
        console.log('⏳ Tables don\'t exist, push:true should create them now...')
        // Wait for push:true to complete
        await new Promise(resolve => setTimeout(resolve, 8000))
      } else {
        console.warn('⚠️  Unexpected error:', triggerError.message)
      }
    }
    
    // Now try to access a collection - this should trigger push:true if not already done
    let retries = 3
    let lastError: any = null
    
    while (retries > 0) {
      try {
        // Try find instead of count - sometimes this triggers schema creation better
        const result = await payload.find({
          collection: 'users',
          limit: 0, // Just check if table exists
        })
        console.log('✅ Database tables created! Users found:', result.totalDocs)
        break // Success!
      } catch (dbError: any) {
        lastError = dbError
        
        // If error is "relation does not exist", tables aren't created yet
        if (dbError.message?.includes('does not exist') || dbError.cause?.code === '42P01') {
          retries--
          
          if (retries > 0) {
            console.log(`⏳ Tables not found yet, waiting for push:true... (${retries} retries left)`)
            // Try to trigger push again by accessing adapter
            if (adapter?.push && typeof adapter.push === 'function') {
              try {
                await adapter.push()
                console.log('🔄 Retry: Called adapter.push() again')
              } catch (e) {
                console.warn('⚠️  Retry push failed:', e.message)
              }
            }
            await new Promise(resolve => setTimeout(resolve, 5000))
          } else {
            throw new Error(`Schema creation failed. push:true didn't create tables after ${3} attempts. Error: ${dbError.message}`)
          }
        } else {
          // Different error - throw immediately
          throw dbError
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

