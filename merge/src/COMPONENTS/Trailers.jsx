

const PLACEHOLDER_THUMB =
  "https://via.placeholder.com/800x450?text=No+Thumbnail";

const getUploadUrl = (input) => {
  if (!input) return null;

  // Case 1: already a full URL
  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("https://"))
      return input;
    // filename only (like "abc.jpg")
    return `${API_BASE}/uploads/${input}`;
  }

  // Case 2: input is an object (multer-like)
  if (typeof input === "object") {
    const possible =
      input.url ||
      input.path ||
      input.filename ||
      input.file ||
      input.image ||
      "";

    if (possible) return getUploadUrl(possible);
  }

  return null;
};

const formatDuration = (dur) => {
  if (!dur) return "";
  if (typeof dur === "string") return dur;
  if (typeof dur === "number") return `${dur}m`;
  // object with hours/minutes
  const h = dur.hours ?? 0;
  const m = dur.minutes ?? 0;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return "";
};

const mapMovieToTrailerItem = (movie) => {
  // movie.latestTrailer may hold nested data
  const lt = movie.latestTrailer || {};
  const title = lt.title || movie.movieName || movie.title || "Untitled";
  const thumbnail =
    getUploadUrl(lt.thumbnail) ||
    getUploadUrl(movie.poster) ||
    PLACEHOLDER_THUMB;
  const videoUrl =
    lt.videoId || lt.videoUrl || movie.trailerUrl || movie.videoUrl || "";
  const duration = lt.duration
    ? formatDuration(lt.duration)
    : movie.duration
    ? formatDuration(movie.duration)
    : "";
  const year = lt.year || movie.year || "";
  const genre =
    lt.genres && lt.genres.length
      ? lt.genres.join(", ")
      : movie.categories && movie.categories.length
      ? movie.categories.join(", ")
      : "";
  const description = lt.description || movie.story || "";

  // Build credits object expected by UI: { Director: { name, image }, Producer: {...}, Singer: {...} }
  const credits = {};
  const firstDirector = (lt.directors || movie.directors || []).find(Boolean);
  const firstProducer = (lt.producers || movie.producers || []).find(Boolean);
  const firstSinger = (lt.singers || movie.singers || []).find(Boolean);

  if (firstDirector) {
    credits["Director"] = {
      name: firstDirector.name || "Unknown",
      image:
        getUploadUrl(firstDirector.file) ||
        getUploadUrl(firstDirector.image) ||
        getUploadUrl(firstDirector.photo) ||
        PLACEHOLDER_THUMB,
    };
  }
  if (firstProducer) {
    credits["Producer"] = {
      name: firstProducer.name || "Unknown",
      image:
        getUploadUrl(firstProducer.file) ||
        getUploadUrl(firstProducer.image) ||
        getUploadUrl(firstProducer.photo) ||
        PLACEHOLDER_THUMB,
    };
  }
  if (firstSinger) {
    credits["Singer"] = {
      name: firstSinger.name || "Unknown",
      image:
        getUploadUrl(firstSinger.file) ||
        getUploadUrl(firstSinger.image) ||
        getUploadUrl(firstSinger.photo) ||
        PLACEHOLDER_THUMB,
    };
  }

  return {
    id: movie._id || movie.id,
    title,
    thumbnail,
    videoUrl,
    duration,
    year,
    genre,
    description,
    credits,
  };
};

