import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    description: 'Multi-tenant organizations using the analytics dashboard',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tenant Name',
      description: 'The name of the organization or company',
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      label: 'Domain',
      description: 'Primary domain for this tenant (e.g., example.com)',
    },
    {
      name: 'umamiWebsiteId',
      type: 'text',
      label: 'Umami Website ID',
      description: 'The Umami website ID for this tenant',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'umamiApiKey',
      type: 'text',
      label: 'Umami API Key',
      description: 'API key for accessing Umami data for this tenant',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Suspended',
          value: 'suspended',
        },
        {
          label: 'Pending',
          value: 'pending',
        },
      ],
      label: 'Status',
      description: 'Current status of the tenant',
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Settings',
      fields: [
        {
          name: 'allowPublicAnalytics',
          type: 'checkbox',
          defaultValue: false,
          label: 'Allow Public Analytics',
          description: 'Allow public access to analytics dashboard',
        },
        {
          name: 'maxWebsites',
          type: 'number',
          defaultValue: 5,
          label: 'Maximum Websites',
          description: 'Maximum number of websites this tenant can track',
        },
        {
          name: 'retentionDays',
          type: 'number',
          defaultValue: 90,
          label: 'Data Retention (Days)',
          description: 'How long to keep analytics data',
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact Information',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Contact Email',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Address',
        },
      ],
    },
  ],
  timestamps: true,
}

