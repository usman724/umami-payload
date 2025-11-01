/**
 * Run Payload migrations manually
 * Run with: node run-migrations.js
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

async function runMigrations() {
  try {
    console.log('🔄 Running Payload migrations...')
    console.log('📊 DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Not set')
    
    // Try to load payload from standalone first, then regular node_modules
    let getPayload
    try {
      const payloadPath = require.resolve('payload', { paths: [path.resolve(__dirname, '.next/standalone/node_modules'), __dirname] })
      const payloadModule = await import(payloadPath)
      getPayload = payloadModule.getPayload || payloadModule.default?.getPayload
      console.log('✅ Loaded Payload from:', payloadPath)
    } catch (e) {
      const payloadModule = await import('payload')
      getPayload = payloadModule.getPayload || payloadModule.default?.getPayload
      console.log('✅ Loaded Payload from node_modules')
    }
    
    // Load config - in production, config is in standalone build
    // but migrations are at /app/src/migrations (copied by Dockerfile)
    let config
    const standalonePath = './.next/standalone/src/payload.config.js'
    const srcPath = './src/payload.config.js'
    
    // Check if standalone build exists first
    if (fs.existsSync(path.resolve(__dirname, '.next/standalone/src/payload.config.js'))) {
      try {
        config = await import(standalonePath)
        console.log('✅ Loaded config from .next/standalone/src/payload.config.js')
      } catch (e) {
        console.warn('⚠️  Could not load from standalone:', e.message)
      }
    }
    
    // Fallback to regular src (local dev or if standalone failed)
    if (!config) {
      try {
        // Try .js first (compiled), then .ts (TypeScript)
        if (fs.existsSync(path.resolve(__dirname, 'src/payload.config.js'))) {
          config = await import(srcPath)
          console.log('✅ Loaded config from src/payload.config.js')
        } else if (fs.existsSync(path.resolve(__dirname, 'src/payload.config.ts'))) {
          // For TypeScript files, we need to use tsx or ts-node, but for Docker we'll use the compiled .js
          // In production Docker, this will be compiled to .js
          throw new Error('TypeScript config found - please build first or use pnpm payload migrate')
        } else {
          throw new Error('Config file not found in src/payload.config.js or src/payload.config.ts')
        }
      } catch (e2) {
        throw new Error(`Failed to load config: ${e2.message}`)
      }
    }
    
    // Ensure NODE_ENV is set for production
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production'
      console.log('📝 Set NODE_ENV=production')
    }
    
    // Get the actual config (handle both default export and named export)
    const actualConfig = config.default || config
    
    // Log migration directory from config
    if (actualConfig && actualConfig.db && actualConfig.db.migrationDir) {
      console.log('📁 Migration directory from config:', actualConfig.db.migrationDir)
    }
    
    // Initialize Payload
    console.log('🚀 Initializing Payload...')
    const payload = await getPayload({ config: actualConfig })
    
    // Check if migration directory exists
    const migrationDir = process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), 'src', 'migrations')
      : path.resolve(__dirname, 'src', 'migrations')
    
    if (fs.existsSync(migrationDir)) {
      console.log('✅ Migration directory exists:', migrationDir)
      const files = fs.readdirSync(migrationDir)
      console.log('📄 Migration files found:', files.filter(f => f.endsWith('.ts') || f.endsWith('.js')))
    } else {
      console.warn('⚠️  Migration directory not found:', migrationDir)
    }
    
    // Run migrations explicitly if migrate method exists
    if (payload.db && typeof payload.db.migrate === 'function') {
      console.log('🔄 Running migrations via payload.db.migrate()...')
      await payload.db.migrate()
      console.log('✅ Migrations executed')
    } else {
      console.log('⚠️  migrate() method not found on payload.db')
      console.log('Available methods:', Object.keys(payload.db || {}))
      // Wait for auto-migration
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    // Verify tables exist
    try {
      const result = await payload.count({
        collection: 'users',
      })
      console.log('✅ Migrations completed! Users count:', result.totalDocs)
    } catch (error) {
      console.error('❌ Tables not created:', error.message)
      throw error
    }
    
    // Close connection
    if (payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
    
    console.log('✅ All migrations completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

runMigrations()

