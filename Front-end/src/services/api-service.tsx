import axios, { AxiosInstance } from "axios";
import { API_CONFIG } from "../config/api-config.ts";

class ApiService {
  private baseUrl: string;
  private api: AxiosInstance;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;

    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        console.log(
          `Making ${config.method?.toUpperCase()} request to: ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error("Response error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Fetch contacts from Xero
  async fetchContacts(companyId: string): Promise<{
    success: boolean;
    data?: {
      contacts: Array<any>;
      totalCount: number;
      companyId: string;
      fetchedAt: string;
    };
    error?: string;
  }> {
    try {
      const response = await this.api.get(
        API_CONFIG.ENDPOINTS.CONTACTS.FETCH(companyId)
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Sync customers to database
  async syncCustomers(companyId: string): Promise<{
    success: boolean;
    data?: {
      syncResults: {
        totalFetched: number;
        newContacts: number;
        updatedContacts: number;
        errors: Array<any>;
      };
      companyId: string;
      syncedAt: string;
    };
    error?: string;
  }> {
    try {
      const response = await this.api.post(
        API_CONFIG.ENDPOINTS.CONTACTS.SYNC(companyId)
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }
}

const apiService = new ApiService();

export const fetchContacts = apiService.fetchContacts.bind(apiService);
export const syncCustomers = apiService.syncCustomers.bind(apiService);

export default apiService;
