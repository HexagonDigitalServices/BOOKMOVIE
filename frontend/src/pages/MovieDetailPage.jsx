const ROWS = [
  { id: "A", type: "standard", count: 8 },
  { id: "B", type: "standard", count: 8 },
  { id: "C", type: "standard", count: 8 },
  { id: "D", type: "recliner", count: 8 },
  { id: "E", type: "recliner", count: 8 },
];

const TOTAL_SEATS = ROWS.reduce((s, r) => s + r.count, 0);

const FallbackAvatar = ({ className = "w-12 h-12", alt = "avatar" }) => (
  <div
    className={`${className} bg-gray-700 rounded-full flex items-center justify-center text-sm text-gray-300`}
    aria-hidden="true"
  >
    ?
  </div>
);

/** Utility: extract a YouTube ID from either an ID or a full URL */
function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  if (/^[A-Za-z0-9_-]{6,}$/.test(urlOrId)) return urlOrId;

  const re =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
  const m = urlOrId.match(re);
  return m ? m[1] : null;
}

/** Builds embed URL with autoplay and minimal related-video noise */
const getEmbedUrl = (id) =>
  id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
    : null;

/**
 * Helpers to format dates/times in a target timezone using Intl.formatToParts.
 */
const getParts = (dateLike, timeZone) => {
  const dt = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(dt);

  const map = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  map.dayPeriod = map.dayPeriod || map.ampm || map.AMPM || map.ampm;
  return map;
};

const pad = (n) => String(n).padStart(2, "0");

/** Returns date key 'YYYY-MM-DD' for the given date/ISO in given timezone */
const formatDateKey = (dateLike, timeZone = "Asia/Kolkata") => {
  const p = getParts(dateLike, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
};

/** Returns a human time string like "1:30 PM" (12-hour) for the given ISO in timezone */
const formatTimeInTZ = (dateLike, timeZone = "Asia/Kolkata") => {
  const p = getParts(dateLike, timeZone);
  const hour = String(Number(p.hour));
  return `${hour}:${p.minute} ${String(
    p.dayPeriod ?? p.ampm ?? ""
  ).toUpperCase()}`;
};

export default function MovieDetailPage() {
  const { id } = useParams();
  const movieId = Number(id);
  const movie = useMemo(() => movies.find((m) => m.id === movieId), [movieId]);
  const navigate = useNavigate();

  // Trailer-related state
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedTrailerId, setSelectedTrailerId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);

  /**
   * Build showtimeDays by grouping ONLY the dates present in movie.slots.
   *
   * NOTE: Accepts slots in either format:
   *  - string ISO: "2025-09-24T10:00:00+05:30"
   *  - object: { time: "2025-09-24T10:00:00+05:30", audi: "Audi 1" }
   *  - object with different key names: { datetime: "...", iso: "...", date: "...", audiName: "..." }
   */
  const showtimeDays = useMemo(() => {
    if (!movie) return [];

    const TZ = "Asia/Kolkata";
    const slotsByDate = {};

    (movie.slots || []).forEach((slot) => {
      try {
        // normalize slot -> obtain iso string and audi (optional)
        let iso = null;
        let audi = null;

        if (!slot) return;

        if (typeof slot === "string") {
          iso = slot;
        } else if (typeof slot === "object") {
          // accept several possible property names
          iso =
            slot.time ||
            slot.datetime ||
            slot.iso ||
            slot.date ||
            slot.datetimeISO ||
            null;
          // prefer standard keys for audi
          audi =
            slot.audi ||
            slot.audiName ||
            slot.auditorium ||
            slot.auditoriumName ||
            null;
        }

        if (!iso) return;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return;

        const dateKey = formatDateKey(d, TZ);
        if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
        // store normalized slot object so downstream can access audi when present
        slotsByDate[dateKey].push({ iso, audi });
      } catch (err) {
        // ignore invalid slot
      }
    });

    const dateKeys = Object.keys(slotsByDate).sort();

    const days = dateKeys.map((key) => {
      const [yy, mm, dd] = key.split("-").map(Number);
      const asDate = new Date(Date.UTC(yy, mm - 1, dd));
      const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: TZ,
      }).format(asDate);
      const shortDay = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: TZ,
      }).format(asDate);
      const dateStr = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: TZ,
      }).format(asDate);

      const rawSlots = slotsByDate[key] || [];

      const showtimes = rawSlots
        .map(({ iso, audi }) => {
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return null;
          const timeLabel = formatTimeInTZ(iso, TZ);
          return {
            time: timeLabel,
            datetime: iso,
            timestamp: d.getTime(),
            audi: audi ?? null,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ time, datetime, audi }) => ({ time, datetime, audi }));

      return {
        date: key,
        dayName,
        shortDay,
        dateStr,
        showtimes,
      };
    });

    return days;
  }, [movie]);

  // Ensure selectedDay is valid when showtimeDays changes

  // Trailer open/close handlers
  const openTrailer = (movieObj) => {
    const idFromField = movieObj?.trailerId ?? null;
    const id = idFromField || extractYouTubeId(movieObj?.trailer || "");
    if (!id) {
      toast.info("Trailer not available for this movie.");
      return;
    }
    setSelectedMovie(movieObj);
    setSelectedTrailerId(id);
    setShowTrailer(true);
  };

  const handleBookNow = () => {
    if (selectedTime) {
      const key = encodeURIComponent(selectedTime);
      navigate(`/movies/${movie.id}/seat-selector/${key}`);
    } else {
      toast.error("Please select a showtime first");
    }
  };

  const getBookedCountFor = (datetime) => {
    try {
      const key = `bookings_${movie.id}_${datetime}`;
      const raw = localStorage.getItem(key);
      if (!raw) return 0;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : 0;
    } catch (err) {
      return 0;
    }
  };

  <div className={movieDetailStyles.videoContainer}>
    <iframe
      key={selectedTrailerId}
      width="100%"
      height="100%"
      src={getEmbedUrl(selectedTrailerId)}
      title={`${selectedMovie?.title || "Trailer"} Trailer`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className={movieDetailStyles.videoIframe}
    />
  </div>;

  {
    /* Movie Title */
  }
  <h1
    className={movieDetailStyles.movieTitle}
    style={{
      fontFamily: "'Cinzel', 'Times New Roman', serif",
      textShadow: "0 4px 20px rgba(220, 38, 38, 0.6)",
      letterSpacing: "0.08em",
    }}
  >
    {movie.title}
  </h1>;

  {
    /* Main layout: mobile-first stacking, md two-column, lg three-col as original */
  }
  <div className={movieDetailStyles.mainLayout}>
    <img
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src =
          "https://via.placeholder.com/320x480?text=No+Image";
      }}
      className={movieDetailStyles.posterImg}
    />

    {/* Showtimes Grid - responsive columns */}
    <div className={movieDetailStyles.showtimesGrid}>
      {showtimeDays[selectedDay]?.showtimes.map((showtime, index) => {
        const bookedCount = getBookedCountFor(showtime.datetime);
        const isSoldOut = bookedCount >= TOTAL_SEATS;

        return (
          <button
            key={index}
            onClick={() => handleTimeSelect(showtime.datetime)}
            className={`${movieDetailStyles.timeButton.base} ${
              selectedTime === showtime.datetime
                ? movieDetailStyles.timeButton.active
                : movieDetailStyles.timeButton.inactive
            }`}
            title={
              isSoldOut
                ? "All seats booked for this showtime"
                : `Seats available: ${Math.max(0, TOTAL_SEATS - bookedCount)}`
            }
            aria-disabled={isSoldOut}
          >
            <span>{showtime.time}</span>
            {isSoldOut && (
              <span className={movieDetailStyles.soldOutBadge}>Sold Out</span>
            )}
          </button>
        );
      })}
    </div>
  </div>;

  {
    /* Director & Producer Section */
  }
  {
    /* Director */
  }
  <div className={movieDetailStyles.crewCard}>
    <div className={movieDetailStyles.crewHeader}>
      <User className={movieDetailStyles.crewIcon} />
      <h3
        className={movieDetailStyles.crewTitle}
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Director
      </h3>
    </div>
    <div className={movieDetailStyles.crewContent}>
      {(() => {
        const directors = Array.isArray(movie.director)
          ? movie.director
          : movie.director
          ? [movie.director]
          : [];

        return (
          <div className={movieDetailStyles.crewImageGrid}>
            {directors.length ? (
              directors.slice(0, 2).map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                  {d?.img ? (
                    <img
                      src={d.img}
                      alt={d.name || `Director ${i + 1}`}
                      className={movieDetailStyles.crewImage}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://via.placeholder.com/96?text=D";
                      }}
                    />
                  ) : (
                    <div className={movieDetailStyles.fallbackAvatar}>?</div>
                  )}
                  <div className={movieDetailStyles.crewName}>
                    {d?.name ?? "N/A"}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center">
                <div className={movieDetailStyles.fallbackAvatar}>?</div>
                <div className={movieDetailStyles.crewName}>N/A</div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  </div>

  {
    /* Producer */
  }
  <div className={movieDetailStyles.crewCard}>
    <div className={movieDetailStyles.crewHeader}>
      <User className={movieDetailStyles.crewIcon} />
      <h3
        className={movieDetailStyles.crewTitle}
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Producer
      </h3>
    </div>
    <div className={movieDetailStyles.crewContent}>
      {movie.producer?.img ? (
        <img
          src={movie.producer.img}
          alt={movie.producer.name}
          className={movieDetailStyles.crewImage}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://via.placeholder.com/96?text=P";
          }}
        />
      ) : (
        <FallbackAvatar className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4" />
      )}
      <div className={movieDetailStyles.crewName}>
        {movie.producer?.name ?? "N/A"}
      </div>
    </div>
  </div>
}
