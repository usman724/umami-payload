import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      label: 'Tenant',
      description: 'The tenant organization this user belongs to',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'User',
          value: 'user',
        },
        {
          label: 'Viewer',
          value: 'viewer',
        },
      ],
      label: 'Role',
      description: 'User role within the tenant',
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
    },
  ],
}
