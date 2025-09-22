import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchContacts, syncCustomers } from "../services/api-service.tsx";
import ContactsTable from "./contacts-table.tsx";

const HomePage = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    const stateCompanyId = location.state?.companyId;
    if (stateCompanyId) {
      setCompanyId(stateCompanyId);
    } else {
      // If no company ID, redirect to login
      toast.warning("Please authenticate with Xero first");
      navigate("/");
    }
  }, [location.state, navigate]);

  // Fetch contacts from Xero
  const handleFetchContacts = async (): Promise<void> => {
    if (!companyId) {
      toast.error("No company ID available. Please re-authenticate.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchContacts(companyId);

      if (response.success) {
        setContacts(response.data.contacts);

        // Calculate stats
        const total = response.data.contacts.length;
        toast.success(`Successfully fetched ${total} contacts from Xero`);
      } else {
        toast.error(response.error || "Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle customer synchronization
  const handleSyncCustomers = async (): Promise<void> => {
    if (!companyId) {
      toast.error("No company ID available. Please re-authenticate.");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await syncCustomers(companyId);

      if (response.success) {
        const { syncResults } = response.data;
        toast.success(
          `Customer sync completed! Processed: ${syncResults.totalFetched} contacts`
        );
      } else {
        toast.error(response.error || "Failed to sync customers");
      }
    } catch (error) {
      console.error("Error syncing customers:", error);
      toast.error("Failed to sync customers. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle logout
  const handleLogout = (): void => {
    navigate("/");
    toast.info("Logged out successfully");
  };

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <h1>Satva Xero Contact Manager</h1>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome to Satva Xero Integration</h2>
          <p>
            Manage your Xero contacts and synchronize customer data seamlessly.
            {companyId && (
              <span
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontWeight: "600",
                }}
              >
                Connected Company: {companyId}
              </span>
            )}
          </p>
        </div>

        {/* Action Cards */}
        <div className="actions-section">
          <div className="action-card">
            <h3>Fetch Xero Contacts</h3>
            <p>
              Retrieve the latest contact information from your Xero account and
              display them in a comprehensive table format.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleFetchContacts}
              disabled={isLoading || !companyId}
            >
              {isLoading && <span className="loading"></span>}
              Fetch Xero Contacts
            </button>
          </div>

          <div className="action-card">
            <h3>Sync Customers</h3>
            <p>
              Synchronize customer data from Xero, checking for duplicates and
              updating existing records with the latest information.
            </p>
            <button
              className="btn btn-success"
              onClick={handleSyncCustomers}
              disabled={isSyncing || !companyId}
            >
              {isSyncing && <span className="loading"></span>}
              Sync Customers
            </button>
          </div>
        </div>

        {/* Contacts Section */}
        {contacts.length > 0 && (
          <div className="contacts-section">
            <div className="contacts-header">
              <h3>Xero Contacts</h3>
              <button
                className="btn btn-primary"
                onClick={handleFetchContacts}
                disabled={isLoading}
              >
                {isLoading && <span className="loading"></span>}
                Refresh
              </button>
            </div>

            {/* Contacts Table */}
            <ContactsTable contacts={contacts} />
          </div>
        )}

        {/* Empty State */}
        {contacts.length === 0 && !isLoading && (
          <div className="contacts-section">
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No Contacts Loaded</h3>
              <p>
                Click "Fetch Xero Contacts" to load your contact data from Xero.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
