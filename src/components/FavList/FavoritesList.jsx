import React from "react";
import "./FavoritesList.css";
import PropTypes from "prop-types";
import axios from "axios";

const TMDB_API_KEY = "2e50bafb203c56a23bf1bc3de91ad30b";
const OMDB_API_KEY = "940a9bb6";

function FavoritesList({ favorites, toggleFavorite }) {
  // Function to handle opening the movie trailer or streaming link
  const openTrailer = async (movie) => {
    const imdbID = movie.movie_id; // Assuming movie_id corresponds to the IMDb ID

    try {
      // Fetch movie details from OMDB API
      const omdbResponse = await axios.get(
        `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}`
      );

      const isSeries = omdbResponse.data.Type === "series"; // Check if it's a series

      // Find the movie on TMDB using the IMDb ID
      const tmdbResponse = await axios.get(
        `https://api.themoviedb.org/3/find/${imdbID}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
      );

      const tmdbMovieId =
        tmdbResponse.data.movie_results[0]?.id ||
        tmdbResponse.data.tv_results[0]?.id;

      if (tmdbMovieId) {
        // Fetch videos (trailers) in the specified language
        const trailerUrl = `https://api.themoviedb.org/3/${
          isSeries ? "tv" : "movie"
        }/${tmdbMovieId}/videos?api_key=${TMDB_API_KEY}&language=en`; // Adjust language as necessary
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
          searchYouTube(movie.movie_title, movie.movie_year || ""); // Include year if available
        }
      } else {
        alert("Movie or Series not found on TMDB.");
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
      alert("An error occurred while fetching the movie.");
      // Fallback to YouTube search in case of error
      searchYouTube(movie.movie_title, movie.movie_year || ""); // Include year if available
    }
  };

  function searchYouTube(title, year) {
    const query = `${title} ${year} trailer`.replace(/\s+/g, "+");
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${query}`;
    window.open(youtubeSearchUrl, "_blank");
  }

  return (
    <div className="favorites-list">
      {favorites.length > 0 ? (
        <div className="favorites-ul mt-4">
          {favorites.map((movie) => (
            <div
              key={`${movie.movie_id}-${movie.profile_id}`}
              className="favorite-item"
            >
              <img
                src={movie.movie_poster}
                alt={movie.movie_title}
                className="favorite-poster"
              />
              <div className="favorite-info">
                <span className="favorite-title">
                  {movie.movie_title} ({movie.movie_year})
                </span>
                <div className="favorite-buttons">
                  <button
                    className="play-movie-button"
                    onClick={() => openTrailer(movie)}
                  >
                    Play
                  </button>
                  <button
                    className="remove-favorite-button"
                    onClick={() => toggleFavorite(movie)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-favorites-message">Add to view favorites</p>
      )}
    </div>
  );
}

FavoritesList.propTypes = {
  favorites: PropTypes.array.isRequired,
  toggleFavorite: PropTypes.func.isRequired,
};

export default FavoritesList;
