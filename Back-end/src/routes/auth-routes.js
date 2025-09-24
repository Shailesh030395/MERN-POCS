import express from "express";
import { XeroService } from "../services/xero-service.js";
import XeroToken from "../models/xero-token.js";
import { logger } from "../common/logger.js";

const router = express.Router();
const xeroService = new XeroService();

// ========================================
// Initiate Xero OAuth connection
// ========================================
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

// ========================================
// Handle OAuth callback
// ========================================
router.get("/callback", async (req, res, next) => {
  try {
    const { code, error, error_description } = req.query;

    if (error) {
      logger.error("OAuth error received:", { error, error_description });
      return res.redirect(
        `${process.env.FRONTEND_URL}?error=${encodeURIComponent(
          error_description || error
        )}`
      );
    }

    if (!code) {
      logger.error("No authorization code received");
      return res.redirect(
        `${process.env.FRONTEND_URL}?error=No authorization code received`
      );
    }

    const tokenData = await xeroService.exchangeCodeForTokens(code);
    const connections = await xeroService.getTenantConnections(
      tokenData.access_token
    );

    if (!connections || connections.length === 0) {
      logger.error("No tenant connections found");
      return res.redirect(
        `${process.env.FRONTEND_URL}?error=No company connections found`
      );
    }

    const companyId = connections[0].tenantId;
    const expiresIn = new Date(Date.now() + tokenData.expires_in * 1000);

    let existingToken = await XeroToken.findByCompanyId(companyId);

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

// ========================================
// Get authentication status
// ========================================
router.get("/status", async (req, res, next) => {
  try {
    const tokens = await XeroToken.find({}, "companyId expiresIn createdAt");

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

// ========================================
// NEW: Disconnect a company (delete token)
// ========================================
router.delete("/disconnect/:companyId", async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const deleted = await XeroToken.findOneAndDelete({ companyId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "No token found for the given company ID",
      });
    }

    logger.info(`Disconnected company: ${companyId}`);
    res.json({
      success: true,
      message: `Company ${companyId} disconnected successfully`,
    });
  } catch (error) {
    logger.error("Error in /disconnect route:", error);
    next(error);
  }
});

// ========================================
// NEW: Manually refresh a token
// ========================================
router.post("/refresh-token/:companyId", async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const token = await XeroToken.findByCompanyId(companyId);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No token found for the given company ID",
      });
    }

    const refreshedData = await xeroService.refreshAccessToken(
      token.refreshToken
    );

    const expiresIn = new Date(Date.now() + refreshedData.expires_in * 1000);

    await token.updateTokens({
      accessToken: refreshedData.access_token,
      refreshToken: refreshedData.refresh_token,
      expiresIn,
    });

    logger.info(`Refreshed token for company: ${companyId}`);
    res.json({
      success: true,
      companyId,
      expiresIn,
    });
  } catch (error) {
    logger.error("Error in /refresh-token route:", error);
    next(error);
  }
});

// ========================================
// NEW: List all connected companies
// ========================================
router.get("/companies", async (req, res, next) => {
  try {
    const tokens = await XeroToken.find({}, "companyId expiresIn createdAt");

    const companies = tokens.map((t) => ({
      companyId: t.companyId,
      connectedAt: t.createdAt,
      expiresIn: t.expiresIn,
      isExpired: t.isTokenExpired(),
    }));

    res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    logger.error("Error in /companies route:", error);
    next(error);
  }
});

export default router;
