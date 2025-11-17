const PLACEHOLDER = "https://via.placeholder.com/400x600?text=No+Poster";

const getUploadUrl = (maybe) => {
  if (!maybe) return null;
  if (typeof maybe !== "string") return null;
  if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
  return `${API_BASE}/uploads/${String(maybe).replace(/^uploads\//, "")}`;
};


          {movies.map((m) => {
            const rawImg =
              m.poster || m.latestTrailer?.thumbnail || m.thumbnail || null;
            const imgSrc = getUploadUrl(rawImg) || PLACEHOLDER;
            const title = m.movieName || m.title || "Untitled";
            const category =
              (Array.isArray(m.categories) && m.categories[0]) ||
              m.category ||
              "General";
            const movieId = m._id || m.id || title;


                          })}
