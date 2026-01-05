import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

import Search from "./Components/Search.jsx";
import Spinner from "./Components/Spinner.jsx";
import MovieCard from "./Components/MovieCard.jsx";

import { updateSearchCount, getTrendingMovies } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔹 Debounce search input
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm.trim());
    },
    500,
    [searchTerm]
  );

  // 🔹 Fetch movies (safe)
  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
            query
          )}&api_key=${API_KEY}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      const results = data?.results ?? [];

      setMovies(results);

      // 🔹 Update search count only when results exist
      if (query && results.length > 0) {
        await updateSearchCount(query, results[0]);
      }
    } catch (error) {
      console.error(error);
      setMovies([]);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Load trending movies safely
  const loadTrendingMovies = async () => {
    try {
      const trending = await getTrendingMovies();
      setTrendingMovies(Array.isArray(trending) ? trending : []);
    } catch (error) {
      console.error(error);
      setTrendingMovies([]);
    }
  };

  // 🔹 Effects
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </header>

        {/* 🔹 Trending Movies */}
        {trendingMovies?.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img
                    src={movie.poster_url || "/no-image.png"}
                    alt={movie.title}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 🔹 All Movies */}
        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : movies?.length > 0 ? (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          ) : (
            <p>No movies found.</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
