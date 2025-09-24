import express from "express";
import { body, validationResult } from "express-validator";
import { XeroService } from "../services/xero-service.js";
import XeroToken from "../models/xero-token.js";
import { logger } from "../common/logger.js";

const router = express.Router();
const xeroService = new XeroService();

// Initiate Xero OAuth connection
// Redirects user to Xero's authorization page
router.get("/connect", async (req, res, next) => {
  try {
    const authUrl = xeroService.getAuthorizationUrl();

    logger.info("Redirecting user to Xero authorization URL");
    res.redirect(authUrl);
  } catch (error) {
    logger.error("Error in /connect route:", error);
    next(error);
  }
});

// Handle OAuth callback from Xero
// Exchanges authorization code for access tokens and stores them
router.get("/callback", async (req, res, next) => {
  try {
    const { code, error, error_description } = req.query;

    // Handle OAuth errors from Xero
    if (error) {
      logger.error("OAuth error received:", { error, error_description });
      return res.redirect(
        `${process.env.FRONTEND_URL}?error=${encodeURIComponent(
          error_description || error
        )}`
      );
    }

    // Validate authorization code is present
    if (!code) {
      logger.error("No authorization code received");
      return res.redirect(
        `${process.env.FRONTEND_URL}?error=No authorization code received`
      );
    }

    // Exchange authorization code for access and refresh tokens
    const tokenData = await xeroService.exchangeCodeForTokens(code);

    // Get company/tenant connections from Xero
    const connections = await xeroService.getTenantConnections(
      tokenData.access_token
    );

    // Ensure at least one company connection exists
    if (!connections || connections.length === 0) {
      logger.error("No tenant connections found");
      return res.redirect(
        `${process.env.FRONTEND_URL}?error=No company connections found`
      );
    }

    // Use first company connection and calculate token expiry
    const companyId = connections[0].tenantId;
    const expiresIn = new Date(Date.now() + tokenData.expires_in * 1000);

    // Check if tokens already exist for this company
    let existingToken = await XeroToken.findByCompanyId(companyId);

    // Update existing tokens or create new ones
    if (existingToken) {
      await existingToken.updateTokens({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn,
      });
      logger.info(`Updated existing token for company: ${companyId}`);
    } else {
      const newToken = new XeroToken({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        companyId,
        expiresIn,
      });
      await newToken.save();
      logger.info(`Created new token for company: ${companyId}`);
    }

    // Redirect to frontend with success status and company ID
    res.redirect(
      `${process.env.FRONTEND_URL}?success=true&company=${encodeURIComponent(
        companyId
      )}`
    );
  } catch (error) {
    logger.error("Error in /callback route:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}?error=${encodeURIComponent(
        "Authentication failed"
      )}`
    );
  }
});

// Get authentication status for all stored tokens
// Returns company IDs and token expiration status
router.get("/status", async (req, res, next) => {
  try {
    // Retrieve all stored tokens with relevant fields
    const tokens = await XeroToken.find({}, "companyId expiresIn createdAt");

    // Map tokens to status information
    const status = tokens.map((token) => ({
      companyId: token.companyId,
      isExpired: token.isTokenExpired(),
      expiresIn: token.expiresIn,
      createdAt: token.createdAt,
    }));

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error("Error in /status route:", error);
    next(error);
  }
});

export default router;
