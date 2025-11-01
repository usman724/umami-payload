import { getPayload } from 'payload'
import config from '../payload.config'

export interface UmamiWebsite {
  id: string
  name: string
  domain: string
  shareId?: string
  resetAt?: string
  userId: string
  teamId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface UmamiUser {
  id: string
  username: string
  role: string
  createdAt: string
  isAdmin: boolean
}

export interface UmamiAuthResponse {
  token: string
  user: UmamiUser
}

export class UmamiService {
  private baseUrl: string
  private adminApiKey?: string
  private authToken?: string

  constructor(baseUrl: string = 'http://localhost:3000', adminApiKey?: string) {
    this.baseUrl = baseUrl
    this.adminApiKey = adminApiKey
  }

  /**
   * Authenticate with Umami and get JWT token
   */
  async authenticate(username: string, password: string): Promise<UmamiAuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`)
    }

    const data = await response.json()
    this.authToken = data.token
    return data
  }

  /**
   * Create a new website in Umami
   */
  async createWebsite(name: string, domain: string, isPublic: boolean = false): Promise<UmamiWebsite> {
    if (!this.authToken) {
      throw new Error('Not authenticated. Call authenticate() first.')
    }

    const response = await fetch(`${this.baseUrl}/api/websites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({
        name,
        domain,
        public: isPublic,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create website: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get all websites for the authenticated user
   */
  async getWebsites(): Promise<UmamiWebsite[]> {
    if (!this.authToken) {
      throw new Error('Not authenticated. Call authenticate() first.')
    }

    const response = await fetch(`${this.baseUrl}/api/websites`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch websites: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get analytics data for a specific website
   */
  async getAnalytics(websiteId: string, startDate: string, endDate: string): Promise<any> {
    if (!this.authToken) {
      throw new Error('Not authenticated. Call authenticate() first.')
    }

    const params = new URLSearchParams({
      websiteId,
      startDate,
      endDate,
    })

    const response = await fetch(`${this.baseUrl}/api/analytics?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Generate tracking code for a website
   */
  generateTrackingCode(websiteId: string, baseUrl: string = this.baseUrl): string {
    return `
<script
  async
  src="${baseUrl}/script.js"
  data-website-id="${websiteId}"
></script>
    `.trim()
  }

  /**
   * Create a tenant in Payload and automatically create Umami website
   */
  async createTenantWithUmamiWebsite(tenantData: {
    name: string
    domain: string
    contact: {
      email: string
      phone?: string
      address?: string
    }
    settings?: {
      allowPublicAnalytics?: boolean
      maxWebsites?: number
      retentionDays?: number
    }
  }): Promise<{ tenant: any; umamiWebsite: UmamiWebsite }> {
    const payload = await getPayload({ config })

    // Authenticate with Umami using admin credentials
    await this.authenticate('admin', 'umami')

    // Create website in Umami
    const umamiWebsite = await this.createWebsite(
      tenantData.name,
      tenantData.domain,
      tenantData.settings?.allowPublicAnalytics || false
    )

    // Create tenant in Payload
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantData.name,
        domain: tenantData.domain,
        umamiWebsiteId: umamiWebsite.id,
        umamiApiKey: this.authToken,
        status: 'active',
        settings: {
          allowPublicAnalytics: tenantData.settings?.allowPublicAnalytics || false,
          maxWebsites: tenantData.settings?.maxWebsites || 5,
          retentionDays: tenantData.settings?.retentionDays || 90,
        },
        contact: tenantData.contact,
      },
    })

    return { tenant, umamiWebsite }
  }

  /**
   * Get analytics data for a tenant
   */
  async getTenantAnalytics(tenantId: string, startDate: string, endDate: string): Promise<any> {
    const payload = await getPayload({ config })
    
    // Get tenant data
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })

    if (!tenant.umamiWebsiteId) {
      throw new Error('Tenant does not have an associated Umami website')
    }

    // Authenticate with Umami
    await this.authenticate('admin', 'umami')

    // Get analytics data
    return await this.getAnalytics(tenant.umamiWebsiteId, startDate, endDate)
  }

  /**
   * Create a user for a tenant
   */
  async createTenantUser(tenantId: string, userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: 'admin' | 'user' | 'viewer'
  }): Promise<any> {
    const payload = await getPayload({ config })

    return await payload.create({
      collection: 'users',
      data: {
        email: userData.email,
        password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      tenant: typeof tenantId === 'string' ? parseInt(tenantId, 10) : tenantId,
      },
    })
  }
}

// Export a singleton instance
export const umamiService = new UmamiService(
  process.env.UMAMI_API_URL || 'http://localhost:3000',
  process.env.UMAMI_ADMIN_API_KEY
)

