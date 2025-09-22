// API configuration for frontend
// Centralizes all backend API endpoints and settings

interface ApiConfig {
  readonly BASE_URL: string;
  readonly ENDPOINTS: {
    readonly AUTH: {
      readonly CONNECT: string;
    };
    readonly CONTACTS: {
      readonly FETCH: (companyId: string) => string;
      readonly SYNC: (companyId: string) => string;
    };
  };
  readonly TIMEOUT: number;
}

const getBaseUrl = (): string => {
  return process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
};

export const API_CONFIG: ApiConfig = {
  BASE_URL: getBaseUrl(),

  ENDPOINTS: {
    AUTH: {
      CONNECT: "/api/auth/connect",
    },
    CONTACTS: {
      FETCH: (companyId: string) => `/api/contacts/${companyId}`,
      SYNC: (companyId: string) => `/api/contacts/sync/${companyId}`,
    },
  },

  TIMEOUT: 30000, // 30 seconds
} as const;

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;
