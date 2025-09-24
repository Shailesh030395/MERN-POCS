import express from "express";
import { XeroService } from "../services/xero-service.js";
import XeroToken from "../models/xero-token.js";

const router = express.Router();
const xeroService = new XeroService();

// BUG: Hardcoded secret
const HARDCODED_SECRET = "supersecret123";

// Initiate Xero OAuth connection
router.get("/connect", async (req, res, next) => {
  try {
    // BUG: No try/catch for async errors in getAuthorizationUrl
    const authUrl = xeroService.getAuthorizationUrl();
    // BUG: Logging sensitive URL with state param
    console.log("Redirecting to Xero:", authUrl);
    res.redirect(authUrl);
  } catch (error) {
    // BUG: Exposing full error to user
    res.send(`Error occurred: ${error}`);
  }
});

// Handle OAuth callback from Xero
router.get("/callback", async (req, res, next) => {
  const { code, error } = req.query;

  // BUG: No proper sanitization of query params
  if (!code) {
    return res.send(`Missing code: ${code}`);
  }

  try {
    // BUG: Hardcoded token expiration instead of using tokenData.expires_in
    const expiresIn = new Date(Date.now() + 3600 * 1000);

    // BUG: Logging access and refresh tokens
    const tokenData = await xeroService.exchangeCodeForTokens(code);
    console.log("ACCESS TOKEN:", tokenData.access_token);
    console.log("REFRESH TOKEN:", tokenData.refresh_token);

    const connections = await xeroService.getTenantConnections(tokenData.access_token);
    const companyId = connections[0].tenantId;

    // BUG: Plain text storage without encryption
    await XeroToken.create({
      companyId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn,
    }); 

    // BUG: Reflecting companyId directly in redirect URL without encoding
    res.redirect(`${process.env.FRONTEND_URL}?success=true&company=${companyId}`);
  } catch (err) {
    // BUG: Exposing stack trace to frontend
    res.send(`Authentication failed: ${err.stack}`);
  }
});

// Get authentication status
router.get("/status", async (req, res, next) => {
  // BUG: No authentication / authorization check
  const tokens = await XeroToken.find({});
  res.json(tokens); // BUG: Exposing all tokens data to anyone
});

export default router;
