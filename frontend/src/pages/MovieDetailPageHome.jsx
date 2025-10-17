  const showtimeDays = useMemo(() => {
    if (!movie) return [];

    const TZ = "Asia/Kolkata";
    const slotsByDate = {};

    (movie.slots || []).forEach((raw) => {
      let iso = null;
      let audi = "Audi 1";

      if (!raw) return;

      if (typeof raw === "string") {
        iso = raw;
        audi = "Audi 1";
      } else if (typeof raw === "object" && raw.time) {
        iso = raw.time;
        audi = raw.audi ?? "Audi 1";
      } else {
        return;
      }

      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return;

      const dateKey = formatDateKey(d, TZ);
      if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
      slotsByDate[dateKey].push({ iso, audi });
    });

      /**
   * Get booked count for specific datetime and audi (if available).
   * - First tries per-audi key: bookings_{movieId}_{datetime}_{audi}
   * - Falls back to legacy key without audi: bookings_{movieId}_{datetime}
   */
  const getBookedCountFor = (datetime, audi = "Audi 1") => {
    try {
      const keyWithAudi = `bookings_${movie.id}_${datetime}_${audi}`;
      const rawWith = localStorage.getItem(keyWithAudi);
      if (rawWith) {
        const arr = JSON.parse(rawWith);
        if (Array.isArray(arr)) return arr.length;
      }
      const legacyKey = `bookings_${movie.id}_${datetime}`;
      const rawLegacy = localStorage.getItem(legacyKey);
      if (rawLegacy) {
        const arrLegacy = JSON.parse(rawLegacy);
        if (Array.isArray(arrLegacy)) return arrLegacy.length;
      }
      return 0;
    } catch (err) {
      return 0;
    }
  };


      {/* Trailer Modal */}
      {showTrailer && selectedTrailerId && (
        <div className={movieDetailHStyles.trailerModal}>
          <div className={movieDetailHStyles.trailerContainer}>
            <button onClick={closeTrailer} className={movieDetailHStyles.closeButton} aria-label="Close trailer">
              <X size={36} />
            </button>
            <div className={movieDetailHStyles.trailerIframe}>
              <iframe
                key={selectedTrailerId}
                width="100%"
                height="100%"
                src={getEmbedUrl(selectedTrailerId)}
                title={`${selectedMovie?.title || "Trailer"} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={movieDetailHStyles.iframe}
              />
            </div>
          </div>
        </div>
      )}

      <div className={movieDetailHStyles.mainContainer}>
        {/* Header */}
        <div className={movieDetailHStyles.headerContainer}>
          <Link to="/movies" className={movieDetailHStyles.backButton}>
            <ArrowLeft size={18} /> <span className={movieDetailHStyles.backButtonText}>Back</span>
          </Link>
        </div>

        {/* Title */}
        <div className={movieDetailHStyles.titleContainer}>
          <h1
            className={movieDetailHStyles.movieTitle}
            style={{
              fontFamily: "'Cinzel', 'Times New Roman', serif",
              textShadow: "0 4px 20px rgba(220, 38, 38, 0.6)",
              letterSpacing: "0.08em",
            }}
          >
            {movie.title}
          </h1>
          <div className={movieDetailHStyles.movieInfoContainer}>
            <span className={movieDetailHStyles.rating}>
              <Star className={movieDetailHStyles.ratingIcon} />
              {movie.rating}/10
            </span>
            <span className={movieDetailHStyles.duration}>
              <Clock className={movieDetailHStyles.durationIcon} />
              {movie.duration}
            </span>
            <span className={movieDetailHStyles.genre}>{movie.genre}</span>
          </div>
        </div>

        {/* Layout */}
        <div className={movieDetailHStyles.mainGrid}>
          {/* Poster */}
          <div className={movieDetailHStyles.posterContainer}>
            <div className={movieDetailHStyles.posterCard}>
              <div className={movieDetailHStyles.posterImageContainer} style={{ maxWidth: "320px" }}>
                <img
                  src={movie.img}
                  alt={movie.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://via.placeholder.com/320x480?text=No+Image";
                  }}
                  className={movieDetailHStyles.posterImage}
                />
              </div>

              <button onClick={() => openTrailer(movie)} className={movieDetailHStyles.trailerButton} aria-label="Watch trailer">
                <Play size={18} />
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>

          {/* Showtimes + Cast */}
          <div className={movieDetailHStyles.showtimesContainer}>
            <div className={movieDetailHStyles.showtimesCard}>
              <h3 className={movieDetailHStyles.showtimesTitle} style={{ fontFamily: "'Cinzel', serif" }}>
                <Calendar className={movieDetailHStyles.showtimesTitleIcon} />
                <span>Showtimes</span>
              </h3>

              {/* Day selection */}
              <div className={movieDetailHStyles.daySelection}>
                {showtimeDays.length ? (
                  showtimeDays.map((day, index) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setSelectedDay(index);
                        setSelectedTime(null);
                      }}
                      className={`${movieDetailHStyles.dayButton} ${
                        selectedDay === index ? movieDetailHStyles.dayButtonSelected : movieDetailHStyles.dayButtonDefault
                      }`}
                      aria-pressed={selectedDay === index}
                      aria-label={`Select ${day.dayName} ${day.dateStr}`}
                    >
                      <div className={movieDetailHStyles.dayName}>{day.shortDay}</div>
                      <div className={movieDetailHStyles.dayDate}>{day.dateStr}</div>
                    </button>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm px-2">No showtime dates available</div>
                )}
              </div>

              {/* Showtimes grid */}
              <div className={movieDetailHStyles.showtimesGrid}>
                {showtimeDays[selectedDay]?.showtimes && showtimeDays[selectedDay].showtimes.length ? (
                  showtimeDays[selectedDay].showtimes.map((showtime, index) => {
                    // We do not display audi on this page; bookedCount still checks audi (fallbacks to legacy)
                    const bookedCount = getBookedCountFor(showtime.datetime, showtime.audi);
                    const isSoldOut = bookedCount >= TOTAL_SEATS;

                    return (
                      <button
                        key={index}
                        onClick={() => handleTimeSelect(showtime.datetime)}
                        className={`${movieDetailHStyles.showtimeButton} ${
                          selectedTime === showtime.datetime
                            ? movieDetailHStyles.showtimeButtonSelected
                            : movieDetailHStyles.showtimeButtonDefault
                        }`}
                        title={isSoldOut ? "All seats booked for this showtime" : `Seats available: ${Math.max(0, TOTAL_SEATS - bookedCount)}`}
                        aria-disabled={isSoldOut}
                      >
                        <span>{showtime.time}</span>
                        {isSoldOut && <span className={movieDetailHStyles.soldOutBadge}>Sold Out</span>}
                      </button>
                    );
                  })
                ) : (
                  <div className={movieDetailHStyles.noShowtimes}>No showtimes available for the selected date</div>
                )}
              </div>

              {selectedTime && (
                <div className={movieDetailHStyles.bookNowContainer}>
                  <button onClick={handleBookNow} className={movieDetailHStyles.bookNowButton} aria-label="Proceed to seat selection">
                    Proceed to Seat Selection
                  </button>
                </div>
              )}
            </div>

            {/* Cast */}
            <div className={movieDetailHStyles.castCard}>
              <h3 className={movieDetailHStyles.castTitle} style={{ fontFamily: "'Cinzel', serif" }}>
                <Users className={movieDetailHStyles.castTitleIcon} />
                <span>Cast</span>
              </h3>

              <div className={movieDetailHStyles.castGrid}>
                {movie.cast && movie.cast.length ? (
                  movie.cast.map((c, idx) => (
                    <div key={idx} className={movieDetailHStyles.castMember}>
                      <div className={movieDetailHStyles.castImageContainer}>
                        {c.img ? (
                          <img
                            src={c.img}
                            alt={c.name}
                            loading="lazy"
                            className={movieDetailHStyles.castImage}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://via.placeholder.com/80?text=A";
                            }}
                          />
                        ) : (
                          <FallbackAvatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
                        )}
                      </div>
                      <div className={movieDetailHStyles.castName}>{c.name}</div>
                      <div className={movieDetailHStyles.castRole}>{c.role}</div>
                    </div>
                  ))
                ) : (
                  <div className={movieDetailHStyles.noCastMessage}>No cast data available</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className={movieDetailHStyles.storyCard}>
          <h2 className={movieDetailHStyles.storyTitle} style={{ fontFamily: "'Cinzel', serif" }}>
            Story
          </h2>
          <p className={movieDetailHStyles.storyText}>{movie.synopsis}</p>
        </div>

        {/* Director & Producer */}
        <div className={movieDetailHStyles.crewGrid}>
          <div className={movieDetailHStyles.crewCard}>
            <div className={movieDetailHStyles.crewTitle}>
              <User className={movieDetailHStyles.crewIcon} />
              <h3 style={{ fontFamily: "'Cinzel', serif" }}>Director</h3>
            </div>
            <div className={movieDetailHStyles.crewContent}>
              {(() => {
                const directors = Array.isArray(movie.director) ? movie.director : movie.director ? [movie.director] : [];
                return (
                  <div className={movieDetailHStyles.crewGridInner}>
                    {directors.length ? (
                      directors.slice(0, 2).map((d, i) => (
                        <div key={i} className="flex flex-col items-center">
                          {d?.img ? (
                            <img
                              src={d.img}
                              alt={d.name || `Director ${i + 1}`}
                              loading="lazy"
                              className={movieDetailHStyles.crewImage}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://via.placeholder.com/96?text=D";
                              }}
                            />
                          ) : (
                            <div className={movieDetailHStyles.fallbackAvatar}>?</div>
                          )}
                          <div className={movieDetailHStyles.crewName}>{d?.name ?? "N/A"}</div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className={movieDetailHStyles.fallbackAvatar}>?</div>
                        <div className={movieDetailHStyles.crewName}>N/A</div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className={movieDetailHStyles.crewCard}>
            <div className={movieDetailHStyles.crewTitle}>
              <User className={movieDetailHStyles.crewIcon} />
              <h3 style={{ fontFamily: "'Cinzel', serif" }}>Producer</h3>
            </div>
            <div className={movieDetailHStyles.crewContent}>
              {movie.producer?.img ? (
                <img
                  src={movie.producer.img}
                  alt={movie.producer.name}
                  loading="lazy"
                  className={movieDetailHStyles.crewImage}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://via.placeholder.com/96?text=P";
                  }}
                />
              ) : (
                <FallbackAvatar className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4" />
              )}
              <div className={movieDetailHStyles.crewName}>{movie.producer?.name ?? "N/A"}</div>
            </div>
          </div>
        </div>
      </div>
