/**
 * Run Payload migrations manually
 * Run with: node run-migrations.js
 */

const path = require('path')

async function runMigrations() {
  try {
    console.log('🔄 Running Payload migrations...')
    console.log('📊 DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Not set')
    
    // Try to load payload from standalone first, then regular node_modules
    let getPayload
    try {
      const payloadPath = require.resolve('payload', { paths: [path.resolve(__dirname, '.next/standalone/node_modules'), __dirname] })
      getPayload = require(payloadPath).getPayload
      console.log('✅ Loaded Payload from:', payloadPath)
    } catch (e) {
      const { getPayload: gp } = require('payload')
      getPayload = gp
      console.log('✅ Loaded Payload from node_modules')
    }
    
    // Load config
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
    
    // Initialize Payload
    console.log('🚀 Initializing Payload...')
    const payload = await getPayload({ config })
    
    // Run migrations explicitly if migrate method exists
    if (payload.db && typeof payload.db.migrate === 'function') {
      console.log('🔄 Running migrations...')
      await payload.db.migrate()
      console.log('✅ Migrations executed')
    } else {
      console.log('⚠️  migrate() method not found, migrations should run automatically')
      // Wait for auto-migration
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    // Verify tables exist
    try {
      const result = await payload.count({
        collection: 'users',
      })
      console.log('✅ Migrations completed! Users count:', result.totalDocs)
    } catch (error: any) {
      console.error('❌ Tables not created:', error.message)
      throw error
    }
    
    // Close connection
    if (payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
    
    console.log('✅ All migrations completed successfully!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

runMigrations()

