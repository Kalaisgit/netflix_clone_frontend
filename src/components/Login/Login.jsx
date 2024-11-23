import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Profiles from "../Profiles/Profiles";
import ReasonsToJoin from "../Reasons/ReasonsToJoin";

function Login({ onLogin }) {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.API_BASE_URL}/auth/status`,
          {
            method: "GET",
            credentials: "include", // Send cookies with request
          }
        );
        console.log("Auth Status Response:", response);

        if (response.ok) {
          const data = await response.json();
          console.log("Authentication Data:", data);

          setAuthenticated(data.authenticated);
          if (data.authenticated) {
            onLogin(data.email); // Trigger parent login handler
            navigate("/profiles");
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuth();
  }, [navigate, onLogin]);

  const handleLogin = () => {
    console.log("Redirecting to Google Login...");
    window.location.href = `${process.env.API_BASE_URL}/auth/google`;
  };

  return (
    <div className="login-container">
      {!authenticated ? (
        <div>
          <h2 className="login-heading">
            Unlimited movies, TV shows, and more
          </h2>
          <button className="login-button mt-4" onClick={handleLogin}>
            Get Started
          </button>
          <div className="line mt-5 mb-3"></div>
          <div className="reasons-to-join">
            <ReasonsToJoin />
          </div>
        </div>
      ) : (
        <Profiles />
      )}
    </div>
  );
}

export default Login;
