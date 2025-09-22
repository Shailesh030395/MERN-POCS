import mongoose from "mongoose";

// MongoDB schema for storing Xero OAuth tokens
const xeroTokenSchema = new mongoose.Schema(
  {
    accessToken: {
      type: String,
      required: true,
      trim: true,
    },
    refreshToken: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: String,
      required: true,
      trim: true,
    },
    expiresIn: {
      type: Date,
      required: true,
    },
    tokenType: {
      type: String,
      default: "Bearer",
    },
    scope: {
      type: String,
      default: "accounting.contacts",
    },
  },
  {
    timestamps: true,
    collection: "xeroTokens",
  }
);

// Check if the access token has expired
xeroTokenSchema.methods.isTokenExpired = function () {
  return new Date() >= this.expiresIn;
};

// Update stored tokens with new values from refresh
xeroTokenSchema.methods.updateTokens = async function (tokenData) {
  this.accessToken = tokenData.accessToken;
  this.refreshToken = tokenData.refreshToken;
  this.expiresIn = tokenData.expiresIn;

  return await this.save();
};

// Find token record by Xero company/tenant ID
xeroTokenSchema.statics.findByCompanyId = async function (companyId) {
  return await this.findOne({ companyId });
};

// Create and export the XeroToken model
const XeroToken = mongoose.model("XeroToken", xeroTokenSchema);

export default XeroToken;
