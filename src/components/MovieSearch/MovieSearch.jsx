import React, { useState, useEffect } from "react";
import axios from "axios";
import MovieList from "./MovieList";
import { useNavigate, useLocation } from "react-router-dom";
import TitleCards from "../TitleCards/TitleCards";
import "./MovieSearch.css";
import back_arrow_icon from "../assets/back_arrow_icon.png";

const API_KEY = "940a9bb6";
const BASE_URL = "https://www.omdbapi.com/";

function MovieSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const profileName = location.state?.profileName;
  const profileId = location.state?.profileId;

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await axios.get(
          `${process.env.API_BASE_URL}/auth/status`,
          {
            withCredentials: true,
          }
        );
        if (response.data.authenticated) {
          setEmail(response.data.email);
          setUserId(response.data.userId);
          await fetchFavorites(
            response.data.userId,
            response.data.email,
            profileId
          );
        } else {
          console.warn("User is not authenticated");
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      }
    }

    checkAuthStatus();
  }, [profileId]); // Run the effect whenever profileId changes

  async function fetchFavorites(userId, email, profileId) {
    if (!userId || !email || !profileId) return;
    try {
      const response = await axios.get(
        `${process.env.API_BASE_URL}/favorites`,
        {
          params: { user_id: userId, email: email, profile_id: profileId },
          withCredentials: true,
        }
      );
      setFavorites(response.data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites([]);
    }
  }

  function handleChange(event) {
    setSearchTerm(event.target.value);
    setMovies([]);
    setIsSearched(false);
  }

  async function handleSearch(event) {
    event.preventDefault();
    setIsSearched(true);
    setLoading(true);
    setMovies([]);

    try {
      const response = await axios.get(
        `${BASE_URL}?s=${searchTerm}&apikey=${API_KEY}`
      );
      if (response.data.Response === "True") {
        setMovies(response.data.Search || []);
      } else {
        console.warn("No movies found for the search term:", searchTerm);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(movie) {
    if (!userId || !profileId) {
      console.error("User ID or Profile ID is missing");
      return;
    }

    const movieDetails = {
      user_id: userId,
      profile_id: profileId,
      movie_id: movie.imdbID,
      movie_poster: movie.Poster,
      movie_title: movie.Title,
      movie_year: movie.Year,
    };

    const isFavorite = favorites.some(
      (fav) => fav.movie_id === movie.imdbID && fav.profile_id === profileId
    );

    try {
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`${process.env.API_BASE_URL}/favorites`, {
          data: movieDetails,
        });
        setFavorites(
          favorites.filter(
            (fav) =>
              !(fav.movie_id === movie.imdbID && fav.profile_id === profileId)
          )
        );
      } else {
        // Add to favorites
        const response = await axios.post(
          `${process.env.API_BASE_URL}/favorites`,
          movieDetails
        );
        setFavorites([...favorites, response.data]);
      }
    } catch (error) {
      console.error(
        isFavorite
          ? "Error removing favorite movie:"
          : "Error adding favorite movie:",
        error
      );
    }
  }

  async function handleLogout() {
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true, // Ensure cookies are sent with the request
        }
      );
      if (response.status === 200) {
        console.log(response.data.message);
        // Reset states on logout
        setSearchTerm("");
        setMovies([]);
        setFavorites([]);
        setEmail("");
        setUserId(null);
        navigate("/");
      }
    } catch (error) {
      console.error(
        "Error during logout:",
        error.response ? error.response.data : error.message
      );
    }
  }

  function handleNavigateToFavorites() {
    if (profileName === "Guest") {
      alert("Guest profile cannot access favorites.");
    } else {
      navigate("/favorites", { state: { profileId, userId } });
    }
  }

  // Check if we should clear the input
  useEffect(() => {
    if (location.state?.clearInput) {
      setSearchTerm(""); // Clear the input
    }
  }, [location.state]);

  function handleNavigateBack() {
    navigate("/profiles", { state: { profileId, profileName } }); // Change the path as per your routing
  }

  return (
    <div className="movie-search-container">
      <div className="movie-search-form">
        <form onSubmit={handleSearch}>
          <input
            onChange={handleChange}
            type="text"
            value={searchTerm}
            placeholder="Enter movie"
            className="movie-search-input"
          />
          <button type="submit" className="movie-search-button">
            🔍
          </button>
        </form>
      </div>

      <button className="logout-button mb-4" onClick={handleLogout}>
        Log out
      </button>
      <button onClick={handleNavigateToFavorites} className="mb-4 taketofav">
        View Favorites
      </button>
      <button onClick={handleNavigateBack} className="mb-4 back-button">
        <img src={back_arrow_icon} alt="back arrow">
          {" "}
        </img>
      </button>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div>
          {isSearched && searchTerm !== "" ? (
            <>
              <p className="showing-result">
                Showing results for "{searchTerm}"
              </p>
              <MovieList
                movies={movies}
                toggleFavorite={toggleFavorite}
                favorites={favorites}
                isSearched={isSearched}
                searchTerm={searchTerm}
                userEmail={email}
                profileName={profileName}
                profileId={profileId}
                setFavorites={setFavorites}
              />
            </>
          ) : (
            <div className="more-cards">
              <TitleCards />
              <TitleCards title={"Upcoming Movies"} category={"upcoming"} />
              <TitleCards title={"Only on Netflix"} category={"top_rated"} />
              <TitleCards title={"Blockbuster Movies"} category={"popular"} />
              <TitleCards
                title={"Today's Top Picks for You"}
                category={"now_playing"}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MovieSearch;
