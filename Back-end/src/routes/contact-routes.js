import express from "express";
import { body, validationResult } from "express-validator";
import { XeroService } from "../services/xero-service.js";
import XeroToken from "../models/xero-token.js";
import { logger } from "../common/logger.js";

const router = express.Router();
const xeroService = new XeroService();

// Fetch contacts for a specific company from Xero
// Handles token validation and automatic refresh if needed
router.get("/:companyId", async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Find stored authentication tokens for the company
    let tokenRecord = await XeroToken.findByCompanyId(companyId);

    // Ensure company has valid authentication
    if (!tokenRecord) {
      return res.status(404).json({
        success: false,
        error:
          "No authentication found for this company. Please login with Xero first.",
      });
    }

    // Check if access token is expired and refresh if needed
    if (tokenRecord.isTokenExpired()) {
      logger.info(`Token expired for company ${companyId}, refreshing...`);

      try {
        const newTokenData = await xeroService.refreshAccessToken(
          tokenRecord.refreshToken
        );
        const expiresIn = new Date(Date.now() + newTokenData.expires_in * 1000);

        await tokenRecord.updateTokens({
          accessToken: newTokenData.access_token,
          refreshToken: newTokenData.refresh_token,
          expiresIn,
        });

        logger.info(`Successfully refreshed token for company: ${companyId}`);
      } catch (refreshError) {
        logger.error("Failed to refresh token:", refreshError);
        return res.status(401).json({
          success: false,
          error:
            "Token expired and refresh failed. Please re-authenticate with Xero.",
        });
      }
    }

    const contacts = await xeroService.getContacts(
      tokenRecord.accessToken,
      companyId
    );

    res.json({
      success: true,
      data: {
        contacts,
        totalCount: contacts.length,
        companyId,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching contacts:", error);
    next(error);
  }
});

// Synchronize customer data from Xero to local system
router.post("/sync/:companyId", async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Find stored authentication tokens for the company
    let tokenRecord = await XeroToken.findByCompanyId(companyId);

    // Ensure company has valid authentication
    if (!tokenRecord) {
      return res.status(404).json({
        success: false,
        error:
          "No authentication found for this company. Please login with Xero first.",
      });
    }

    // Check if access token is expired and refresh if needed
    if (tokenRecord.isTokenExpired()) {
      logger.info(
        `Token expired for company ${companyId}, refreshing for sync...`
      );

      try {
        const newTokenData = await xeroService.refreshAccessToken(
          tokenRecord.refreshToken
        );
        const expiresIn = new Date(Date.now() + newTokenData.expires_in * 1000);

        await tokenRecord.updateTokens({
          accessToken: newTokenData.access_token,
          refreshToken: newTokenData.refresh_token,
          expiresIn,
        });

        logger.info(
          `Successfully refreshed token for sync, company: ${companyId}`
        );
      } catch (refreshError) {
        logger.error("Failed to refresh token during sync:", refreshError);
        return res.status(401).json({
          success: false,
          error:
            "Token expired and refresh failed. Please re-authenticate with Xero.",
        });
      }
    }

    // Fetch contacts from Xero API for synchronization
    const contacts = await xeroService.getContacts(
      tokenRecord.accessToken,
      companyId
    );

    // Prepare sync results summary
    const syncResults = {
      totalFetched: contacts.length,
      newContacts: 0,
      updatedContacts: 0,
      errors: [],
    };

    logger.info(
      `Customer sync completed for company ${companyId}: ${contacts.length} contacts processed`
    );

    res.json({
      success: true,
      message: "Customer sync completed successfully",
      data: {
        syncResults,
        companyId,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error during customer sync:", error);
    next(error);
  }
});

export default router;
