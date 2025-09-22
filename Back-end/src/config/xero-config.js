// Xero API configuration constants
// Centralizes all Xero service URLs and endpoints

export const XERO_CONFIG = {
  // Base API URLs
  BASE_URL: "https://api.xero.com",
  AUTH_URL: "https://login.xero.com/identity/connect/authorize",
  TOKEN_URL: "https://identity.xero.com/connect/token",
  
  // API Endpoints
  ENDPOINTS: {
    CONNECTIONS: "/connections",
    CONTACTS: "/api.xro/2.0/Contacts"
  },
  
  // OAuth Configuration
  OAUTH: {
    RESPONSE_TYPE: "code",
    SCOPE: "accounting.contacts offline_access",
    ACCESS_TYPE: "offline"
  },
  
  // Request Configuration
  REQUEST: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3
  }
};

export default XERO_CONFIG;
