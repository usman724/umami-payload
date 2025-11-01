/**
 * Initialize Payload and run migrations before starting the Next.js server
 * This ensures the database schema is created before any requests are handled
 */

const { getPayload } = require('payload')
const config = require('./src/payload.config.js')

async function initPayload() {
  try {
    console.log('🔄 Initializing Payload CMS...')
    console.log('📊 DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Not set')
    
    // Initialize Payload - this will trigger push: true to create tables
    const payload = await getPayload({ config })
    
    console.log('✅ Payload initialized successfully')
    console.log('✅ Database schema should be created/updated')
    
    // Close the connection
    if (payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to initialize Payload:', error)
    process.exit(1)
  }
}

initPayload()

