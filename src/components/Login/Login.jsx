import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Profiles from "../Profiles/Profiles"; // Import Profiles component
import ReasonsToJoin from "../Reasons/ReasonsToJoin";
import API_BASE_URL from "../../config.js";

const API_BASE_URL = process.env.API_BASE_URL;

function Login(props) {
  const { onLogin } = props; // Destructure onLogin from props
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status after the component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/status`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setAuthenticated(data.authenticated);
          if (data.authenticated) {
            onLogin(data.email); // Call the onLogin prop with the user's email
            navigate("/profiles"); // Navigate to profiles if authenticated
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuth(); // Call the function to check authentication
  }, [navigate, onLogin]); // Add onLogin as a dependency

  function handleLogin() {
    // Redirect to Google authentication
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

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
        <Profiles /> // Show Profiles component if authenticated
      )}
    </div>
  );
}

export default Login;
