import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { buildApiUrl, API_CONFIG } from "../config/api-config.ts";

const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleXeroLogin = (): void => {
    setIsLoading(true);
    window.location.href = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.CONNECT);
  };

  // Handle authentication response
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");
    const company = urlParams.get("company");

    if (success === "true") {
      toast.success(
        `Successfully authenticated with Xero!${
          company ? ` Company: ${company}` : ""
        }`
      );
      // Navigate to home page after successful authentication
      setTimeout(() => {
        navigate("/home", { state: { companyId: company } });
      }, 1500);
    } else if (error) {
      toast.error(`Authentication failed`);
      setIsLoading(false);
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Satva Xero OAuth Integration</h1>

        <button
          className="xero-btn"
          onClick={handleXeroLogin}
          disabled={isLoading}
        >
          {isLoading && <span className="loading"></span>}
          Login with Xero
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
