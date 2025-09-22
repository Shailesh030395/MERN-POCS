# Xero OAuth 2.0 MERN Integration

A full-stack MERN application that implements OAuth 2.0 authentication with Xero to fetch and display contacts in a tabular format.

## Features

- **OAuth 2.0 Authentication**: Secure authentication with Xero using REST APIs
- **Token Management**: Automatic token refresh and storage in MongoDB
- **Contact Management**: Fetch and display Xero contacts with sorting and filtering
- **Customer Sync**: Synchronize customer data from Xero
- **Modern UI**: Clean, responsive React interface
- **Security**: Proper error handling, rate limiting, and data validation

## Requirements

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Xero Developer Account
- Modern web browser

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Satva Solutions Assignment"
```

### 2. Backend Setup

```bash
cd Back-end
npm install
```

### 3. Frontend Setup

```bash
cd ../Front-end
npm install
```

### 4. Database Setup

1. Start MongoDB service on your machine
2. Run the database setup script:

```bash
# Using MongoDB shell
mongosh < Back-end/src/database/scripts/database-script.js

# Or using MongoDB Compass
# Import and run the Back-end/src/database/scripts/database-script.js file
```

### 5. Xero App Configuration

1. Go to [Xero Developer Portal](https://developer.xero.com/)
2. Create a new app or use existing one
3. Configure OAuth 2.0 settings:
   - **Redirect URI**: `http://localhost:5000/api/auth/callback`
   - **Scopes**: `accounting.contacts`, `accounting.transactions`
4. Note down your Client ID and Client Secret

### 6. Environment Configuration

Update the `.env` file in the `Back-end` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xero-oauth-db

# Xero OAuth Configuration
XERO_CLIENT_ID=your_actual_client_id
XERO_CLIENT_SECRET=your_actual_client_secret
XERO_REDIRECT_URI=http://localhost:5000/api/auth/callback

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Running the Application

### Start Backend Server

```bash
cd Back-end
npm run dev
```

The backend will start on `http://localhost:5000`

### Start Frontend Server

```bash
cd Front-end
npm start
```

The frontend will start on `http://localhost:3000`

## Usage

1. **Login**: Click "Login with Xero" to authenticate
2. **Authorization**: Complete OAuth flow in Xero
3. **Home Screen**: Access contact management features
4. **Fetch Contacts**: Click "Fetch Xero Contacts" to load data
5. **Sync Customers**: Use "Sync Customers" for data synchronization

## Architecture

### Backend Structure

```
Back-end/
├── src/
│   ├── common/
│   │   └── logger.js            # Simple logging utility
│   ├── config/
│   │   └── xero-config.js       # Xero API configuration
│   ├── database/
│   │   ├── database.js          # MongoDB connection
│   │   └── scripts/
│   │       └── database-script.js # Database setup script
│   ├── middleware/
│   │   └── error-handler.js     # Global error handling
│   ├── models/
│   │   └── xero-token.js        # MongoDB schema
│   ├── routes/
│   │   ├── auth-routes.js       # OAuth endpoints
│   │   └── contact-routes.js    # Contact management
│   ├── services/
│   │   └── xero-service.js      # Xero API integration
│   └── server.js                # Main server file
├── .env                         # Environment variables
├── .env.example                 # Environment template
└── package.json                 # Dependencies
```

### Frontend Structure

```
Front-end/
├── src/
│   ├── components/
│   │   ├── login-page.tsx       # Login component
│   │   ├── home-page.tsx        # Home dashboard
│   │   └── contacts-table.tsx   # Contacts display
│   ├── config/
│   │   └── api-config.ts        # API configuration
│   ├── services/
│   │   └── api-service.tsx      # API communication
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # Styling
│   └── index.js                 # Entry point
└── package.json                 # Dependencies
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **Input Validation**: Request data validation
- **Error Handling**: Comprehensive error management
- **Environment Variables**: Secure credential storage

## Database Schema

### xeroTokens Collection

```javascript
{
  _id: ObjectId,
  accessToken: String (required),
  refreshToken: String (required),
  companyId: String (required, unique),
  expiresIn: Date (required),
  tokenType: String (default: "Bearer"),
  scope: String (default: "accounting.contacts"),
  createdAt: Date,
  updatedAt: Date
}
```

## OAuth 2.0 Flow

1. User clicks "Login with Xero"
2. Redirect to Xero authorization URL
3. User authorizes application
4. Xero redirects to callback with authorization code
5. Exchange code for access/refresh tokens
6. Store tokens in MongoDB
7. Redirect user to home page

## API Endpoints

### Authentication

- `GET /api/auth/connect` - Initiate OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback
- `GET /api/auth/status` - Check auth status

### Contacts

- `GET /api/contacts/:companyId` - Fetch contacts
- `POST /api/contacts/sync/:companyId` - Sync customers

### Health

- `GET /api/health` - Health check

## Testing

### Backend Tests

```bash
cd Back-end
npm test
```

### Frontend Tests

```bash
cd Front-end
npm test
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Xero Authentication Failed**

   - Verify Client ID and Secret
   - Check redirect URI configuration

3. **Token Expired**

   - Application automatically refreshes tokens
   - Re-authenticate if refresh fails

4. **CORS Issues**
   - Ensure frontend URL is correctly configured
   - Check CORS settings in backend
