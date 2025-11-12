const API_BASE = "";

function getImageUrl(maybe) {
  // Convert filename, uploads/filename, or partial to a full uploads URL.
  if (!maybe) return null;
  if (typeof maybe !== "string") return null;
  if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
  // remove leading uploads/ if present
  const cleaned = String(maybe).replace(/^uploads\//, "");
  return `${API_BASE}/uploads/${cleaned}`;
}

export default function ListMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  function normalizeMovie(item) {
    // Clone so we don't mutate original
    const obj = { ...item };

    // Normalize top-level poster
    obj.poster = getImageUrl(item.poster) || (item.poster ? item.poster : null);

    // Normalize top-level cast/person previews (top-level arrays often store full URLs or file URL)
    const normalizeTopPeople = (arr = []) =>
      (arr || []).map((p) => ({
        ...(p || {}),
        preview:
          p?.preview ||
          getImageUrl(p?.file) ||
          p?.file ||
          p?.image ||
          p?.url ||
          null,
      }));

    obj.cast = normalizeTopPeople(item.cast);
    obj.directors = normalizeTopPeople(item.directors);
    obj.producers = normalizeTopPeople(item.producers);

    // If the document contains a latestTrailer object (some DBs store trailer as nested object),
    // expose useful fields at top-level and normalize person images which may be filenames.
    if (
      item.latestTrailer &&
      (item.type === "latestTrailers" ||
        item.latestTrailer.title ||
        item.latestTrailer.thumbnail ||
        item.latestTrailer.videoId)
    ) {
      const lt = item.latestTrailer || {};

      // Title (trailers may use `title` instead of movieName)
      obj.title = lt.title || item.title || item.movieName || null;

      // Thumbnail might be saved as filename (for latestTrailer persons/files we store filename), or full URL
      obj.thumbnail =
        getImageUrl(lt.thumbnail) ||
        getImageUrl(item.thumbnail) ||
        lt.thumbnail ||
        null;

      // trailer link: could be in latestTrailer.videoId or top-level trailerUrl
      obj.trailerUrl = lt.videoId || item.trailerUrl || lt.trailerUrl || null;

      // genres/year/rating/duration/description may live on lt
      obj.genres = lt.genres || item.genres || [];
      obj.year = lt.year || item.year || null;
      obj.rating = lt.rating ?? item.rating ?? null;
      obj.duration = lt.duration || item.duration || null;
      obj.description =
        lt.description || item.description || item.story || null;

      // Normalize latestTrailer persons (these often store file as filename)
      const normalizeLatestPeople = (arr = []) =>
        (arr || []).map((p) => ({
          ...(p || {}),
          preview: p?.preview || getImageUrl(p?.file) || p?.file || null,
        }));

      obj.directors = normalizeLatestPeople(
        lt.directors || item.latestTrailer?.directors || item.directors || []
      );
      obj.producers = normalizeLatestPeople(
        lt.producers || item.latestTrailer?.producers || item.producers || []
      );
      obj.singers = normalizeLatestPeople(
        lt.singers || item.latestTrailer?.singers || []
      );
    } else {
      // For non-latestTrailers, try to normalize thumbnail from other fields if present
      obj.thumbnail = getImageUrl(item.thumbnail) || obj.poster || null;
    }

    // Ensure type is set (some older records may not have type)
    obj.type =
      obj.type || (obj.title && !obj.movieName ? "latestTrailers" : "normal");

    // unify name/title usage for list/card UI
    obj.displayTitle =
      obj.movieName || obj.title || obj.movieName || "Untitled";

    return obj;
  }

  const types = useMemo(
    () => [
      { key: "all", label: "All", icon: Film },
      { key: "normal", label: "Normal", icon: Ticket },
      { key: "featured", label: "Featured", icon: Star },
      { key: "releaseSoon", label: "Coming Soon", icon: Calendar },
      { key: "latestTrailers", label: "Trailers", icon: PlayIcon },
    ],
    []
  );

  const filtered = useMemo(() => {
    // already requested filtered data from backend, but keep a guard to
    // exclude any cinenews entries if present in the returned list
    return (movies || []).filter((item) => item.type !== "cinenews");
  }, [movies]);


  return (
    <div className={styles5.listMoviesContainer}>
      <style>{customStyles}</style>

      <div className={styles5.maxWidth7xl}>
        {/* Header */}
        <header className={styles5.listMoviesHeader}>
          <div className={styles5.listMoviesHeaderInner}>
            <div className="text-left">
              <h1 className={styles5.listMoviesTitle}>Movies</h1>
              <div className={styles5.listMoviesSubtitle}>
                {loading ? "Loading..." : `${filtered.length} items`}
              </div>
            </div>

            {/* Search */}
            <div className={styles5.searchContainer}>
              <div className={styles5.searchBox}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search movies, stories, trailers..."
                  className={styles5.searchInput}
                />
                <div className={styles5.searchIcon}>
                  <Search size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles5.filterContainer}>
            {types.map((t) => {
              const IconComponent = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setFilterType(t.key);
                    // fetchMovies will run due to useEffect
                  }}
                  className={`${styles5.filterButton} ${
                    filterType === t.key
                      ? styles5.filterButtonActive
                      : styles5.filterButtonInactive
                  }`}
                >
                  <IconComponent size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Grid */}
        <main className={styles5.mainGrid}>
          <div className={styles5.leftColumn}>
            <div className={styles5.cardsGrid}>
              {error && (
                <div className={styles5.errorContainer}>
                  <div className={styles5.errorMessage}>Error</div>
                  <div className="text-sm mt-2">{error}</div>
                  <div className="mt-3">
                    <button
                      onClick={fetchMovies}
                      className={styles5.errorRetryButton}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {!error && filtered.length === 0 && !loading && (
                <div className={styles5.emptyState}>
                  <div className={styles5.emptyStateText}>No items found</div>
                  <div className={styles5.emptyStateSubtext}>
                    Try adjusting your search or filters
                  </div>
                </div>
              )}

              {filtered.map((item) => (
                <Card
                  key={item._id || item.id || item.title || item.displayTitle}
                  item={item}
                  onOpen={() => setSelected(item)}
                  onDelete={() => handleDelete(item._id || item.id)}
                />
              ))}

              {loading && (
                <div className={styles5.loadingState}>
                  <div className={styles5.loadingText}>Loading movies…</div>
                </div>
              )}
            </div>
          </div>

          <aside className={styles5.rightColumn}>
            <div className={styles5.detailSidebar}>
              <div className={styles5.detailHeader}>
                <h2 className={styles5.detailTitle}>
                  Details
                </h2>
                <div className={styles5.detailLiveIndicator}>
                  <div className={styles5.detailLiveDot}></div>
                  <span className={styles5.detailLiveText}>Live</span>
                </div>
              </div>

              {selected ? (
                <DetailView item={selected} onClose={() => setSelected(null)} />
              ) : (
                <div className={styles5.detailEmptyState}>
                  <div className="flex items-center justify-center mb-3 w-full">
                    <div className={styles5.detailEmptyIcon}>
                      <Film size={60} className="text-red-600" />
                    </div>
                  </div>

                  <div className={styles5.detailEmptyText}>
                    Click "View Details" on a card
                  </div>
                  <div className={styles5.detailEmptySubtext}>
                    Details will appear here after you click.
                  </div>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Card and helpers ---------------- */

function Card({ item, onOpen, onDelete }) {
  const getTypeColor = (type) => {
    const colors = {
      featured: "from-orange-500 to-red-600",
      normal: "from-blue-500 to-purple-600",
      releaseSoon: "from-green-500 to-emerald-600",
      latestTrailers: "from-pink-500 to-rose-600",
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  const posterOrThumb =
    item.poster ||
    item.thumbnail ||
    item.image ||
    item.latestTrailer?.thumbnail ||
    null;

  return (
    <div
      className={styles5.card}
      onClick={onOpen}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (typeof onDelete === "function") onDelete();
        }}
        title="Delete"
        aria-label={`Delete ${item.movieName || item.title}`}
        className={styles5.cardDeleteButton}
      >
        <X size={14} />
      </button>

      <div className="relative">
        <img
          src={posterOrThumb}
          alt={item.movieName || item.title || item.displayTitle}
          className={styles5.cardImage}
        />
      </div>

      <div className={styles5.cardContent}>
        <div className={styles5.cardHeader}>
          <div className="flex-1 min-w-0">
            <h3 className={styles5.cardTitle}>
              {item.movieName || item.title || item.displayTitle}
            </h3>
            <div className={styles5.cardCategories}>
              {(item.categories || item.genres || []).map((cat, index) => (
                <span
                  key={index}
                  className={styles5.cardCategory}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* UPDATED: hide rating & duration for releaseSoon cards */}
          <div className={styles5.cardRatingContainer}>
            {item.type !== "releaseSoon" && (
              <>
                {item.rating && (
                  <div className={styles5.cardRating}>
                    <Star
                      className={styles5.cardRatingIcon}
                      size={14}
                      fill="currentColor"
                    />
                    <span className={styles5.cardRatingText}>
                      {item.rating}
                    </span>
                  </div>
                )}
                {item.duration && (
                  <div className={styles5.cardDuration}>
                    <Clock className={styles5.cardDurationIcon} size={14} />
                    <span className={styles5.cardDurationText}>
                      {displayDuration(item)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <p className={styles5.cardDescription}>
          {(item.story || item.description || item.excerpt || "").slice(0, 150)}
          {(item.story || item.description || item.excerpt || "").length >
            150 && "..."}
        </p>

        <div className={styles5.cardActions}>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className={styles5.cardViewButton}
            >
              <Play size={16} />
              View Details
            </button>

            {item.trailerUrl && item.type !== "releaseSoon" && (
              <a
                href={item.trailerUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={styles5.cardTrailerButton}
              >
                <PlayIcon className={styles5.cardTrailerIcon} /> Trailer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function displayDuration(item) {
  if (!item) return "";
  // numeric (minutes)
  if (item.duration && typeof item.duration === "number") {
    const totalMins = item.duration;
    if (totalMins < 60) return `${totalMins}m`;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  }
  // object {hours, minutes}
  if (item.duration && typeof item.duration === "object") {
    const h = item.duration.hours ?? 0;
    const m = item.duration.minutes ?? 0;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }
  return "";
}

function formatSlot(s) {
  try {
    const d = s.date ? new Date(s.date + "T00:00:00") : null;
    const dayName = d
      ? d.toLocaleDateString(undefined, { weekday: "short" })
      : "";
    const dateStr = d ? d.toLocaleDateString() : s.date || "";
    const time = s.time || "";
    const ampm = s.ampm || "";
    return `${dayName} ${dateStr} • ${time} ${ampm}`.trim();
  } catch (e) {
    return `${s.date || ""} ${s.time || ""} ${s.ampm || ""}`;
  }
}

function PersonGrid({ list = [], roleLabel = "" }) {
  if (!list || list.length === 0) return null;

  return (
    <div className={styles5.personGrid}>
      <div className={styles5.personHeader}>
        <div className={styles5.personDot}></div>
        <div className={styles5.personTitle}>{roleLabel}</div>
      </div>
      <div className={styles5.personList}>
        {list.map((p, i) => (
          <div
            key={i}
            className={styles5.personItem}
          >
            <div className="relative">
              <img
                src={p.preview || p.file || p.image || p.url || ""}
                alt={p.name || `${roleLabel}-${i}`}
                className={styles5.personAvatar}
              />
            </div>
            <div className={styles5.personName}>
              {p.name || "-"}
            </div>
            {p.role && p.role !== roleLabel && (
              <div className={styles5.personRole}>
                {p.role}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailView({ item, onClose }) {
  const getTypeGradient = (type) => {
    const gradients = {
      featured: "from-orange-500 to-red-600",
      normal: "from-blue-500 to-purple-600",
      releaseSoon: "from-green-500 to-emerald-600",
      latestTrailers: "from-pink-500 to-rose-600",
    };
    return gradients[type] || "from-gray-500 to-gray-600";
  };

  // final auditorium to display (fallback to "Audi 1")
  const displayAuditorium =
    item?.auditorium || item?.auditorium === "" ? item.auditorium : "Audi 1";

  return (
    <div className={styles5.detailContainer}>
      {/* Header */}
      <div className={styles5.detailHeaderContainer}>
        <div className="flex-1">
          <div className={styles5.detailTypeIndicator}>
            <div
              className={`${styles5.detailTypeDot} bg-gradient-to-r ${getTypeGradient(
                item.type
              )}`}
            ></div>
            <span className={styles5.detailTypeText}>
              {item.type === "featured" && "Featured Movie"}
              {item.type === "normal" && "Now Showing"}
              {item.type === "releaseSoon" && "Coming Soon"}
              {item.type === "latestTrailers" && "Latest Trailer"}
            </span>
          </div>
          <h2 className={styles5.detailContentTitle}>
            {item.movieName || item.title || item.displayTitle}
          </h2>
        </div>
        <button
          onClick={onClose}
          className={styles5.detailCloseButton}
        >
          <X size={20} />
        </button>
      </div>

      {/* Content based on type */}
      <div className="space-y-6">
        {/* Latest Trailers */}
        {item.type === "latestTrailers" && (
          <>
            {item.thumbnail && (
              <div className={styles5.detailThumbnail}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className={styles5.detailThumbnailImage}
                />
              </div>
            )}

            <div className={styles5.detailGrid}>
              {item.genres && item.genres.length > 0 && (
                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>
                    Genres
                  </div>
                  <div className={styles5.detailGridValue}>
                    {(item.genres || []).join(", ")}
                  </div>
                </div>
              )}
              {item.year && (
                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>
                    Year
                  </div>
                  <div className={styles5.detailGridValue}>{item.year}</div>
                </div>
              )}

              {item.duration && (
                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>
                    Duration
                  </div>
                  <div className={styles5.detailGridValue}>
                    {displayDuration(item)}
                  </div>
                </div>
              )}

              {item.rating && (
                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>
                    Rating
                  </div>
                  <div className={styles5.detailRatingValue}>
                    <Star size={16} fill="currentColor" />
                    {item.rating}/10
                  </div>
                </div>
              )}

              {/* NEW: Auditorium display for trailers too (if present) */}
              <div className={styles5.detailGridItem}>
                <div className={styles5.detailGridLabel}>
                  Auditorium
                </div>
                <div className={styles5.detailGridValue}>
                  {displayAuditorium}
                </div>
              </div>
            </div>

            <div className={styles5.detailDescription}>
              <div className={styles5.descriptionLabel}>
                Description
              </div>
              <div className={styles5.descriptionText}>
                {item.description}
              </div>
            </div>

            {item.trailerUrl && (
              <a
                href={item.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className={styles5.watchTrailerButton}
              >
                <Play size={20} />
                Watch Trailer Now
              </a>
            )}

            <PersonGrid list={item.directors} roleLabel="Directors" />
            <PersonGrid list={item.producers} roleLabel="Producers" />
            <PersonGrid list={item.singers} roleLabel="Singers" />
          </>
        )}

        {/* Normal & Featured Movies */}
        {(item.type === "normal" || item.type === "featured") && (
          <>
            <div className="grid grid-cols-1 gap-6">
              <div className={styles5.detailThumbnail}>
                <img
                  src={item.poster}
                  alt={item.movieName}
                  className={styles5.detailPoster}
                />
              </div>

              <div className={styles5.detailInfoGrid}>
                <div className={styles5.detailInfoItem}>
                  <div className={styles5.detailInfoLabel}>
                    Rating
                  </div>
                  <div className={styles5.detailRatingValue}>
                    <Star size={18} fill="currentColor" />
                    {item.rating ?? "-"}
                    /10
                  </div>
                </div>

                <div className={styles5.detailInfoItem}>
                  <div className={styles5.detailInfoLabel}>
                    Duration
                  </div>
                  <div className={styles5.detailRatingValue}>
                    <Clock size={18} />
                    {displayDuration(item)}
                  </div>
                </div>

                {/* NEW: Auditorium block */}
                <div className={styles5.detailInfoItem}>
                  <div className={styles5.detailInfoLabel}>
                    Auditorium
                  </div>
                  <div className={styles5.detailInfoValue}>
                    {displayAuditorium}
                  </div>
                </div>

                {item.seatPrices && (
                  <>
                    <div className={styles5.detailInfoItem}>
                      <div className={styles5.detailInfoLabel}>
                        Standard
                      </div>
                      <div className={styles5.seatPrice}>
                        ₹{item.seatPrices.standard}
                      </div>
                    </div>

                    <div className={styles5.detailInfoItem}>
                      <div className={styles5.detailInfoLabel}>
                        Recliner
                      </div>
                      <div className={styles5.seatPrice}>
                        ₹{item.seatPrices.recliner}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {item.trailerUrl && (
                <a
                  href={item.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles5.cardTrailerButton} justify-center`}
                >
                  <Play size={18} />
                  Watch Official Trailer
                </a>
              )}
            </div>

            <div className={styles5.storySection}>
              <div className={styles5.storyLabel}>
                <div className={styles5.storyDot}></div>
                <div className={styles5.descriptionLabel}>
                  Story
                </div>
              </div>
              <div className={styles5.storyText}>
                {item.story}
              </div>
            </div>

            {(item.slots || []).length > 0 && (
              <div className={styles5.showtimesSection}>
                <div className={styles5.showtimesHeader}>
                  <Calendar size={20} className={styles5.showtimesIcon} />
                  <div className={styles5.descriptionLabel}>
                    Showtimes
                  </div>
                </div>
                <div className={styles5.showtimesList}>
                  {(item.slots || []).map((s, i) => (
                    <div
                      key={i}
                      className={styles5.showtimeItem}
                    >
                      <div className={styles5.showtimeText}>
                        {formatSlot(s)}
                      </div>
                      <div className={styles5.showtimeStatus}>
                        <div className={styles5.showtimeDot}></div>
                        <span className={styles5.showtimeStatusText}>
                          AVAILABLE
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PersonGrid list={item.cast} roleLabel="Cast" />
            <PersonGrid list={item.directors} roleLabel="Directors" />
            <PersonGrid list={item.producers} roleLabel="Producers" />
          </>
        )}

        {/* Release Soon */}
        {item.type === "releaseSoon" && (
          <div className={styles5.releaseSoonContainer}>
            <div className={styles5.releaseSoonImage}>
              <img
                src={item.poster}
                alt={item.movieName}
                className={styles5.detailPoster}
              />
            </div>
            <div className={styles5.releaseSoonText}>
              Coming Soon
            </div>
            <div className={styles5.releaseSoonCategories}>
              {(item.categories || []).map((cat, i) => (
                <span
                  key={i}
                  className={styles5.releaseSoonCategory}
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className={styles5.releaseSoonMessage}>
              Stay tuned for more updates!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}