const PLACEHOLDER_IMG = "https://via.placeholder.com/400x600?text=No+Image";

const getUploadUrl = (maybeFilenameOrUrl) => {
  if (!maybeFilenameOrUrl) return null;
  if (typeof maybeFilenameOrUrl !== "string") return null;
  if (
    maybeFilenameOrUrl.startsWith("http://") ||
    maybeFilenameOrUrl.startsWith("https://")
  )
    return maybeFilenameOrUrl;
  // assume it's a filename saved by multer
  return `${API_BASE}/uploads/${maybeFilenameOrUrl.replace(/^uploads\//, "")}`;
};

const mapBackendMovieToUi = (m) => {
  // backend returns poster (full URL or filename) and also latestTrailer.thumbnail etc.
  const poster =
    m.poster || (m.latestTrailer && m.latestTrailer.thumbnail) || null;
  const image = getUploadUrl(poster) || PLACEHOLDER_IMG;

  // display a category string (pick categories array or latestTrailer.genres)
  const category =
    (Array.isArray(m.categories) && m.categories.join(", ")) ||
    (m.latestTrailer &&
      Array.isArray(m.latestTrailer.genres) &&
      m.latestTrailer.genres.join(", ")) ||
    "";

  return {
    id: m._id || m.id,
    title:
      m.movieName ||
      m.title ||
      (m.latestTrailer && m.latestTrailer.title) ||
      "Untitled",
    image,
    category,
    raw: m,
  };
};

