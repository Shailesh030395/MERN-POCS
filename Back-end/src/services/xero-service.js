import axios from "axios";
import { logger } from "../common/logger.js";
import { XERO_CONFIG } from "../config/xero-config.js";

export class XeroService {
  constructor() {
    this.baseUrl = XERO_CONFIG.BASE_URL;
    this.authUrl = XERO_CONFIG.AUTH_URL;
    this.tokenUrl = XERO_CONFIG.TOKEN_URL;
  }

  // Get authorization URL for Xero OAuth
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      response_type: XERO_CONFIG.OAUTH.RESPONSE_TYPE,
      client_id: process.env.XERO_CLIENT_ID,
      redirect_uri: process.env.XERO_REDIRECT_URI,
      scope: XERO_CONFIG.OAUTH.SCOPE,
      state: this.generateState(),
      access_type: XERO_CONFIG.OAUTH.ACCESS_TYPE,
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  // Exchange authorization code for access and refresh tokens
  async exchangeCodeForTokens(authorizationCode) {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.XERO_CLIENT_ID,
        client_secret: process.env.XERO_CLIENT_SECRET,
        code: authorizationCode,
        redirect_uri: process.env.XERO_REDIRECT_URI,
      });

      const response = await axios.post(this.tokenUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      logger.info("Successfully exchanged authorization code for tokens");
      return response.data;
    } catch (error) {
      logger.error(
        "Error exchanging authorization code:",
        error.response?.data || error.message
      );
      throw new Error("Failed to exchange authorization code for tokens");
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken) {
    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.XERO_CLIENT_ID,
        client_secret: process.env.XERO_CLIENT_SECRET,
        refresh_token: refreshToken,
      });

      const response = await axios.post(this.tokenUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      logger.info("Successfully refreshed access token");
      return response.data;
    } catch (error) {
      logger.error(
        "Error refreshing access token:",
        error.response?.data || error.message
      );
      throw new Error("Failed to refresh access token");
    }
  }

  // Get tenant connections for a specific company
  async getTenantConnections(accessToken) {
    try {
      const response = await axios.get(
        `${this.baseUrl}${XERO_CONFIG.ENDPOINTS.CONNECTIONS}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(
        "Error getting tenant connections:",
        error.response?.data || error.message
      );
      throw new Error("Failed to get tenant connections");
    }
  }

  // Get contacts for a specific company
  async getContacts(accessToken, tenantId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}${XERO_CONFIG.ENDPOINTS.CONTACTS}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Xero-tenant-id": tenantId,
            Accept: "application/json",
          },
        }
      );

      const contacts = response.data.Contacts || [];
      logger.info(`Fetched ${contacts.length} contacts from Xero`);
      return contacts;
    } catch (error) {
      logger.error(
        "Error fetching contacts:",
        error.response?.data || error.message
      );
      throw new Error("Failed to fetch contacts from Xero API");
    }
  }

  // Generate a random state for OAuth flow
  generateState() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
