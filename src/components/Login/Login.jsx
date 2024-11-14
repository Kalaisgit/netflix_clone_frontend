import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Profiles from "../Profiles/Profiles";
import ReasonsToJoin from "../Reasons/ReasonsToJoin";
import API_BASE_URL from "../../config.js";

function Login(props) {
  const { onLogin } = props; // Destructure onLogin from props
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/status`, {
          method: "GET",
          credentials: "include",
        });
        console.log(response); // Log the response

        if (response.ok) {
          const data = await response.json();
          console.log("Authentication data:", data); // Log the response data
          setAuthenticated(data.authenticated);
          if (data.authenticated) {
            onLogin(data.email); // Call onLogin prop with email
            navigate("/profiles"); // Redirect to profiles
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuth(); // Check authentication status
  }, [navigate, onLogin]);

  function handleLogin() {
    console.log("Get Started clicked");
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
