// Connect to MongoDB (adjust connection string as needed)
// For local MongoDB: mongodb://localhost:27017
// For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net

use("xero-oauth-db");

// Create the xeroTokens collection with schema validation
db.createCollection("xeroTokens", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["accessToken", "refreshToken", "companyId", "expiresIn"],
      properties: {
        accessToken: {
          bsonType: "string",
          description: "OAuth access token from Xero - required",
        },
        refreshToken: {
          bsonType: "string",
          description: "OAuth refresh token from Xero - required",
        },
        companyId: {
          bsonType: "string",
          description: "Xero tenant/company identifier - required",
        },
        expiresIn: {
          bsonType: "date",
          description: "Token expiration date - required",
        },
        tokenType: {
          bsonType: "string",
          description: "Type of token (usually Bearer)",
        },
        scope: {
          bsonType: "string",
          description: "OAuth scope permissions",
        },
        createdAt: {
          bsonType: "date",
          description: "Record creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Record last update timestamp",
        },
      },
    },
  },
});

// Create indexes for better performance
db.xeroTokens.createIndex({ companyId: 1 }, { unique: true });
db.xeroTokens.createIndex({ expiresIn: 1 });
db.xeroTokens.createIndex({ createdAt: 1 });

// Insert sample document structure (commented out - for reference only)
/*
db.xeroTokens.insertOne({
  accessToken: "sample_access_token_here",
  refreshToken: "sample_refresh_token_here", 
  companyId: "sample_company_id_here",
  expiresIn: new Date(Date.now() + 3600000), // 1 hour from now
  tokenType: "Bearer",
  scope: "accounting.contacts accounting.transactions",
  createdAt: new Date(),
  updatedAt: new Date()
});
*/

print("Database setup completed successfully!");
print("Collection 'xeroTokens' created with schema validation");
print("Indexes created for companyId (unique), expiresIn, and createdAt");
print("");
print("Next steps:");
print("1. Update your .env file with the correct MONGODB_URI");
print("2. Start your backend server: npm run dev");
print("3. Start your frontend server: npm start");
print("4. Configure your Xero app credentials in .env file");

// Verify the collection was created
print("Collection info:");
print(db.xeroTokens.stats());
