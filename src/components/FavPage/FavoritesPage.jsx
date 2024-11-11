import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FavoritesList from "../FavList/FavoritesList"; // Ensure this component is implemented correctly
import axios from "axios";
import "./FavoritesPage.css"; // Import your CSS file
import API_BASE_URL from "../../config.js";

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const profileId = location.state?.profileId; // Get profileId from the passed location state

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/status`, {
          withCredentials: true,
        });

        if (response.data.authenticated) {
          // Check if both email and userId are provided in the auth response
          if (response.data.email) {
            setEmail(response.data.email);

            console.log("Auth data:", {
              email: response.data.email,
              profileId,
            });

            // Fetch favorites only if email, userId, and profileId are available
            const favoritesResponse = await axios.get(
              `${API_BASE_URL}/favorites`,
              {
                params: { profile_id: profileId },
                withCredentials: true,
              }
            );

            setFavorites(favoritesResponse.data || []);
          } else {
            console.error("Email or userId is missing in the auth response.");
          }
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }

    fetchFavorites();
  }, [profileId]);

  async function toggleFavorite(movie) {
    if (!email) {
      console.error("Email is not defined. Cannot toggle favorite.");
      return;
    }

    try {
      // Construct the URL using movie_id and profileId
      const response = await axios.delete(
        `${API_BASE_URL}/favorites/${movie.movie_id}/${profileId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setFavorites(
          favorites.filter((fav) => fav.movie_id !== movie.movie_id)
        );
      } else {
        console.error("Failed to remove favorite");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }

  return (
    <div className="favorites-page">
      <h2>Favorited WatchList 🍿</h2>

      {favorites.length > 0 ? (
        <FavoritesList favorites={favorites} toggleFavorite={toggleFavorite} />
      ) : (
        <p>No favorites added yet!</p>
      )}

      <button className="back-button" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}

export default FavoritesPage;
