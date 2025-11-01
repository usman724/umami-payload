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
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Analytics Name',
    },
    {
      name: 'websiteUrl',
      type: 'text',
      required: true,
      label: 'Website URL',
    },
    {
      name: 'trackingCode',
      type: 'textarea',
      label: 'Tracking Code',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'umamiWebsiteId',
      type: 'text',
      label: 'Umami Website ID',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
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
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}

