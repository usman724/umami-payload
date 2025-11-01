/**
 * Initialize Payload and run migrations before starting the Next.js server
 * This ensures the database schema is created before any requests are handled
 */

const path = require('path')

async function initPayload() {
  try {
    console.log('🔄 Initializing Payload CMS...')
    console.log('📊 DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Not set')
    
    // Use standalone node_modules if available, otherwise regular node_modules
    const nodeModulesPath = path.resolve(__dirname, '.next/standalone/node_modules')
    const payloadPath = require.resolve('payload', { paths: [nodeModulesPath, __dirname] })
    const { getPayload } = require(payloadPath)
    
    // Try to load config from standalone first, then regular src
    let config
    try {
      config = require('./.next/standalone/src/payload.config.js')
      console.log('✅ Loaded config from .next/standalone/src/payload.config.js')
    } catch (e) {
      try {
        config = require('./src/payload.config.js')
        console.log('✅ Loaded config from src/payload.config.js')
      } catch (e2) {
        throw new Error(`Failed to load config: ${e.message}`)
      }
    }
    
    console.log('🔄 Initializing Payload with push:true...')
    // Initialize Payload - this will trigger push: true to create tables
    const payload = await getPayload({ config })
    
    console.log('✅ Payload initialized successfully')
    console.log('✅ Database schema should be created/updated')
    
    // Wait a moment to ensure DB writes complete
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Close the connection
    if (payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
      console.log('✅ Database connection closed')
    }
    
    console.log('✅ Initialization complete, starting server...')
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to initialize Payload:')
    console.error(error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    // Don't exit with error code - let the server start anyway
    // The push:true will retry on first request
    console.warn('⚠️  Continuing anyway - schema will be created on first request')
    process.exit(0)
  }
}

initPayload()

