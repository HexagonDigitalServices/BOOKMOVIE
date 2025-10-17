const seatId = (r, n) => `${r}${n}`;

export default function SeatSelectorPage() {
  const { id, slot } = useParams();
  const movieId = Number(id);
  const slotKey = slot ? decodeURIComponent(slot) : "";
  const navigate = useNavigate();

  const movie = useMemo(() => movies.find((m) => m.id === movieId), [movieId]);

  // Guard: only show this page when a valid slot (datetime) exists
  useEffect(() => {
    const isValidDate = !!slotKey && !isNaN(new Date(slotKey).getTime());
    if (!isValidDate) {
      toast.error(
        "Invalid or missing showtime. Please select a time from the movie page."
      );
      setTimeout(() => {
        if (movie) navigate(`/movie/${movie.id}`);
        else navigate("/movies");
      }, 600);
    }
  }, [slotKey, movie, navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const arr = JSON.parse(raw);
        setBooked(new Set(arr));
      } else {
        setBooked(new Set());
      }
    } catch (err) {
      setBooked(new Set());
    }
    setSelected(new Set());
  }, [storageKey]);


  const confirmBooking = () => {
    if (selected.size === 0) {
      toast.error("Select at least one seat.");
      return;
    }

    const newBooked = new Set([...booked, ...selected]);
    localStorage.setItem(storageKey, JSON.stringify([...newBooked]));

    // Build booking details
    const bookingDetails = {
      movie: movie?.title,
      movieId: movieId,
      showtime: slotKey,
      audi: audiForSlot || null,
      bookedSeats: [...selected].sort(),
      totalSeats: selected.size,
      totalAmount: Math.round(
        [...selected].reduce((sum, s) => {
          const rowLetter = s[0];
          const def = ROWS.find((r) => r.id === rowLetter);
          const multiplier = def?.type === "recliner" ? 1.5 : 1;
          return sum + (movie?.price ?? 0) * multiplier;
        }, 0)
      ),
      bookingTime: new Date().toISOString(),
      bookingId: `B${Date.now()}`,
    };

    // Log all booking details to console instead of WhatsApp
    console.log("🎬 Booking Confirmed:", bookingDetails);
    console.table(bookingDetails);

    setBooked(newBooked);
    setSelected(new Set());

    toast.success(
      <div>
        <div className="font-bold">Booking Confirmed! 🎉</div>
        <div className="text-sm">
          {bookingDetails.totalSeats} seat(s) booked successfully
        </div>
      </div>
    );
  };

  const audiForSlot = useMemo(() => {
    if (!movie || !slotKey) return null;
    try {
      const targetMs = new Date(slotKey).getTime();
      if (isNaN(targetMs)) return null;
      const slots = movie.slots || [];
      for (const s of slots) {
        let timeStr = null;
        if (typeof s === "string") timeStr = s;
        else if (s.datetime) timeStr = s.datetime;
        else if (s.time) timeStr = s.time;
        else if (s.iso) timeStr = s.iso;
        else if (s.date) timeStr = s.date;
        if (!timeStr) continue;
        const sMs = new Date(timeStr).getTime();
        if (sMs === targetMs) {
          return s.audi || s.audiName || s.auditorium || null;
        }
      }
      return null;
    } catch {
      return null;
    }
  }, [movie, slotKey]);

        {/* Header */}
        <div className={seatSelectorStyles.showtimeText}>
          {slotKey
            ? new Date(slotKey).toLocaleString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Showtime unavailable"}
        </div>

        <div
          style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
        >
          {audiForSlot && (
            <div
              style={{
                background: "linear-gradient(90deg,#ef4444,#dc2626)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 12,
                fontWeight: 700,
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
              }}
              title={`Auditorium: ${audiForSlot}`}
            >
              {audiForSlot}
            </div>
          )}
        </div>

        {/* Screen */}

            style={{
              transform: "perspective(120px) rotateX(6deg)",
              maxWidth: 900,
              boxShadow: "0 0 40px rgba(220, 38, 38, 0.18)",
            }}


                      {Array.from({ length: row.count }).map((_, i) => {
                        const num = i + 1;
                        const id = seatId(row.id, num);
                        const isBooked = booked.has(id);
                        const isSelected = selected.has(id);
                        let cls = seatSelectorStyles.seatButton;
                        if (isBooked)
                          cls += ` ${seatSelectorStyles.seatButtonBooked}`;
                        else if (isSelected)
                          cls +=
                            row.type === "recliner"
                              ? ` ${seatSelectorStyles.seatButtonSelectedRecliner}`
                              : ` ${seatSelectorStyles.seatButtonSelectedStandard}`;
                        else
                          cls +=
                            row.type === "recliner"
                              ? ` ${seatSelectorStyles.seatButtonAvailableRecliner}`
                              : ` ${seatSelectorStyles.seatButtonAvailableStandard}`;
                        return (
                          <button
                            key={id}
                            onClick={() => toggleSeat(id)}
                            disabled={isBooked}
                            className={cls}
                            title={
                              isBooked
                                ? `Seat ${id} - Already Booked`
                                : `Seat ${id} (${row.type}) - ₹${
                                    row.type === "recliner"
                                      ? Math.round(basePrice * 1.5)
                                      : basePrice
                                  }`
                            }
                          >
                            <div className={seatSelectorStyles.seatContent}>
                              {row.type === "recliner" ? (
                                <Sofa
                                  size={16}
                                  className={seatSelectorStyles.seatIcon}
                                />
                              ) : (
                                <RockingChair
                                  size={12}
                                  className={seatSelectorStyles.seatIcon}
                                />
                              )}
                              <div className={seatSelectorStyles.seatNumber}>
                                {num}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                   
                {selectedCount > 0 && (
                  <>
                    <div className={seatSelectorStyles.selectedSeatsContainer}>
                      <div className={seatSelectorStyles.selectedSeatsLabel}>
                        Selected Seats:
                      </div>
                      <div className={seatSelectorStyles.selectedSeatsList}>
                        {[...selected].sort().map((seat) => (
                          <span
                            key={seat}
                            className={seatSelectorStyles.selectedSeatBadge}
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={seatSelectorStyles.totalContainer}>
                      <div className={seatSelectorStyles.pricingRow}>
                        <span className={seatSelectorStyles.totalLabel}>
                          Total Amount:
                        </span>
                        <span className={seatSelectorStyles.totalValue}>
                          ₹{Math.round(total)}
                        </span>
                      </div>
                    </div>
                  </>
                )}