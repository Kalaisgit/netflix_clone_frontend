import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profiles from "../Profiles/Profiles";
import MovieSearch from "../MovieSearch/MovieSearch";
import ReasonsToJoin from "../Reasons/ReasonsToJoin";
import Login from "../Login/Login";
import "./App.css";
import FavoritesPage from "../FavPage/FavoritesPage"; // Adjust import path as needed
import Player from "../Player/Player";

function App() {
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email) => {
    setUserEmail(email); // Store the user's email on login
  };

  return (
    <div className="app-container">
      <h1 className="app-heading">NETFLIX</h1>
      <Router>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />{" "}
          {/* Pass onLogin prop */}
          <Route
            path="/movies-search"
            element={<MovieSearch userEmail={userEmail} />}
          />
          <Route
            path="/profiles"
            element={<Profiles userEmail={userEmail} />}
          />
          <Route
            path="/favorites"
            element={<FavoritesPage userEmail={userEmail} />}
          />
          <Route path="/reasons-to-join" element={<ReasonsToJoin />} />
          <Route path="/player/:id" element={<Player />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
