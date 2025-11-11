// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Analytics } from './collections/Analytics'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: {
          path: 'components/Logo',
          exportName: 'Logo',
        },
        Icon: {
          path: 'components/Icon',
          exportName: 'Icon',
        },
      },
    },
  },
  collections: [Users, Media, Tenants, Analytics],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Use push:true in development, migrations in production
    push: process.env.NODE_ENV === 'development',
    // Use prodMigrations in production - runs migrations at runtime
    // This works because Next.js compiles TS to JS during build
    ...(process.env.NODE_ENV === 'production' && { prodMigrations: migrations }),
    // migrationDir for development when using CLI
    ...(process.env.NODE_ENV === 'development' && {
      migrationDir: path.resolve(dirname, 'migrations'),
    }),
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
