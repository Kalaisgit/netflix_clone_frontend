import React, { useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import back_arrow_icon from "../assets/back_arrow_icon.png";
import { useNavigate } from "react-router-dom";

const TMDB_API_KEY = "2e50bafb203c56a23bf1bc3de91ad30b";
const OMDB_API_KEY = "940a9bb6";

function MovieList({
  movies,
  favorites,
  setFavorites,
  isSearched,
  searchTerm,
  userEmail,
  profileName,
  profileId,
  userId, // Added userId prop
}) {
  async function handleToggleFavorite(movie) {
    if (profileName === "Guest") {
      alert("Guests cannot add or remove favorites.");
      return;
    }

    const movieDetails = {
      email: userEmail,
      profile_id: profileId,
      user_id: userId, // userId now defined as prop
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
        await axios.delete(
          `${process.env.API_BASE_URL}/favorites/${movie.imdbID}/${profileId}`,
          { withCredentials: true }
        );
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
          movieDetails,
          { withCredentials: true }
        );
        setFavorites((prevFavorites) => [...prevFavorites, response.data]);
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

  async function openTrailer(movie) {
    const imdbID = movie.imdbID;

    try {
      // Fetch movie details from OMDB API to get language data
      const omdbResponse = await axios.get(
        `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}`
      );

      const language = omdbResponse.data.Language || "en"; // Default to English if no language is found

      // Determine if the item is a movie or a series
      const isSeries = omdbResponse.data.Type === "series";

      // Find the movie/series on TMDB using the IMDb ID
      const tmdbResponse = await axios.get(
        `https://api.themoviedb.org/3/find/${imdbID}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
      );

      const tmdbId =
        tmdbResponse.data.movie_results[0]?.id ||
        tmdbResponse.data.tv_results[0]?.id;

      if (tmdbId) {
        // Fetch videos (trailers) in the specified language
        const trailerUrl = isSeries
          ? `https://api.themoviedb.org/3/tv/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=${language}`
          : `https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=${language}`;

        const trailerResponse = await axios.get(trailerUrl);

        // Look for a YouTube trailer in the filtered results
        const trailer = trailerResponse.data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        if (trailer) {
          // Construct the YouTube URL using the video ID
          const youtubeTrailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          window.open(youtubeTrailerUrl, "_blank");
        } else {
          // Fallback to YouTube search if no trailer found
          searchYouTube(movie.Title, movie.Year);
        }
      } else {
        alert("Movie or series not found on TMDB.");
      }
    } catch (error) {
      console.error("Error fetching movie/series:", error);
      alert("An error occurred while fetching the movie or series.");
      // Fallback to YouTube search in case of error
      searchYouTube(movie.Title, movie.Year);
    }
  }

  // Fallback YouTube search function remains unchanged
  function searchYouTube(title, year) {
    const query = `${title} ${year} trailer`.replace(/\s+/g, "+");
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${query}`;
    window.open(youtubeSearchUrl, "_blank");
  }
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await axios.get(
          `${process.env.API_BASE_URL}/favorites`,
          {
            params: { email: userEmail, profile_id: profileId, user: userId },
            withCredentials: true,
          }
        );
        console.log("Fetched favorites:", response.data);
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }

    fetchFavorites();
  }, [userEmail, profileId, userId, setFavorites]);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/movies-search", { state: { clearInput: true } }); // Navigate with state
  };

  return (
    <div className="movie-list container mt-2 mb-2 mx-2 my-2">
      <div className="back-button">
        <img src={back_arrow_icon} alt="Back" onClick={handleBack} />
      </div>
      {isSearched && searchTerm !== "" ? (
        movies.length > 0 ? (
          movies.map((movie) => {
            const isFavorite = favorites.some(
              (fav) =>
                fav.movie_id === movie.imdbID && fav.profile_id === profileId
            );

            return (
              <div
                className="movie-box mt-2 mb-2 mx-2 my-2"
                key={movie.imdbID}
                style={{ cursor: "pointer" }}
              >
                <img
                  className="movie-poster"
                  src={
                    movie.Poster !== "N/A"
                      ? movie.Poster
                      : "https://via.placeholder.com/150"
                  }
                  alt={movie.Title}
                />
                <div className="movie-title mt-2">
                  {movie.Title} - {movie.Year}
                </div>
                <button
                  className="mt-1 add-to-favorites-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from bubbling up
                    handleToggleFavorite(movie);
                  }}
                >
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </button>
                <button
                  className="play-trailer-button mt-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from bubbling up
                    openTrailer(movie);
                  }}
                >
                  Play Movie
                </button>
              </div>
            );
          })
        ) : (
          <p>No movies found for "{searchTerm}".</p>
        )
      ) : (
        <p>Search for a movie to see results.</p>
      )}
    </div>
  );
}

MovieList.propTypes = {
  movies: PropTypes.array.isRequired,
  favorites: PropTypes.array.isRequired,
  setFavorites: PropTypes.func.isRequired,
  isSearched: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
  profileName: PropTypes.string.isRequired,
  profileId: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired, // Added userId prop type
};

export default MovieList;
