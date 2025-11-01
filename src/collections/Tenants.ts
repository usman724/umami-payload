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
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      label: 'Domain',
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
      name: 'umamiApiKey',
      type: 'text',
      label: 'Umami API Key',
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
        },
        {
          name: 'maxWebsites',
          type: 'number',
          defaultValue: 5,
          label: 'Maximum Websites',
        },
        {
          name: 'retentionDays',
          type: 'number',
          defaultValue: 90,
          label: 'Data Retention (Days)',
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

