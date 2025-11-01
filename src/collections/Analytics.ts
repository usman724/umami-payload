import type { CollectionConfig } from 'payload'

export const Analytics: CollectionConfig = {
  slug: 'analytics',
  admin: {
    useAsTitle: 'name',
    description: 'Analytics configurations and settings for tenants',
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      label: 'Tenant',
      description: 'The tenant this analytics configuration belongs to',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Analytics Name',
      description: 'Name for this analytics configuration',
    },
    {
      name: 'websiteUrl',
      type: 'text',
      required: true,
      label: 'Website URL',
      description: 'The website URL being tracked',
    },
    {
      name: 'trackingCode',
      type: 'textarea',
      label: 'Tracking Code',
      description: 'Generated tracking code for this website',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'umamiWebsiteId',
      type: 'text',
      label: 'Umami Website ID',
      description: 'Corresponding Umami website ID',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      description: 'Whether this analytics configuration is active',
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Analytics Settings',
      fields: [
        {
          name: 'trackPageViews',
          type: 'checkbox',
          defaultValue: true,
          label: 'Track Page Views',
        },
        {
          name: 'trackEvents',
          type: 'checkbox',
          defaultValue: true,
          label: 'Track Events',
        },
        {
          name: 'trackSessions',
          type: 'checkbox',
          defaultValue: true,
          label: 'Track Sessions',
        },
        {
          name: 'ignoreBots',
          type: 'checkbox',
          defaultValue: true,
          label: 'Ignore Bots',
        },
        {
          name: 'respectDoNotTrack',
          type: 'checkbox',
          defaultValue: true,
          label: 'Respect Do Not Track',
        },
      ],
    },
    {
      name: 'lastSync',
      type: 'date',
      label: 'Last Sync',
      description: 'Last time data was synchronized with Umami',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}

