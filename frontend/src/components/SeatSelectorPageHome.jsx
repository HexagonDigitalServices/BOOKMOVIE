

  // Find slot object (supports both string array and object array with {time, audi})
  const slotObj = useMemo(() => {
    if (!movie || !slotKey) return null;
    if (!Array.isArray(movie.slots)) return null;

    const asObj = movie.slots.find(
      (s) =>
        s &&
        typeof s === "object" &&
        (s.time === slotKey || s.time === decodeURIComponent(slotKey))
    );
    if (asObj) return asObj;

    const asString = movie.slots.find(
      (s) =>
        typeof s === "string" &&
        (s === slotKey || s === decodeURIComponent(slotKey))
    );
    if (asString) return { time: asString, audi: "Audi 1" };

    return null;
  }, [movie, slotKey]);

  const audiName = slotObj?.audi ?? "Audi 1";


  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const arr = JSON.parse(raw);
        setBooked(new Set(Array.isArray(arr) ? arr : []));
      } else {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          const legacyArr = JSON.parse(legacyRaw);
          const s = new Set(Array.isArray(legacyArr) ? legacyArr : []);
          setBooked(s);
          localStorage.setItem(storageKey, JSON.stringify([...s]));
        } else {
          setBooked(new Set());
        }
      }
    } catch (err) {
      console.error("Failed to read bookings from storage:", err);
      setBooked(new Set());
    }
    setSelected(new Set());
  }, [storageKey, legacyKey]);


  const confirmBooking = () => {
    if (selected.size === 0) {
      toast.error("Select at least one seat.");
      return;
    }
    const newBooked = new Set([...booked, ...selected]);
    const arr = [...newBooked];
    try {
      localStorage.setItem(storageKey, JSON.stringify(arr));
    } catch (err) {
      console.error("Failed to save booking:", err);
      toast.error("Failed to confirm booking. Try again.");
      return;
    }

    const bookingDetails = {
      movie: movie?.title,
      movieId: movieId,
      showtime: slotKey,
      audi: audiName,
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


      <style>{seatSelectorHStyles.customCSS}</style>
      <div className={seatSelectorHStyles.mainContainer}>
        {/* Header */}
        <div
          className={seatSelectorHStyles.headerContainer}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              className={seatSelectorHStyles.backButton}
            >
              <ArrowLeft size={18} /> Back
            </button>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <h1
              className={seatSelectorHStyles.movieTitle}
              style={{
                fontFamily: "'Cinzel', 'Times New Roman', serif",
                textShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              {movie?.title}
            </h1>
            <div
              className={seatSelectorHStyles.showtimeText}
              style={{ marginTop: 6 }}
            >
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
          </div>

          {/* Audi badge on the top-right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minWidth: 120,
            }}
          >
            <div
              className={seatSelectorHStyles.audiBadge}
              style={{
                background: "linear-gradient(90deg,#111,#222)",
                color: "red",
                padding: "6px 12px",
                borderRadius: 10,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
              }}
            >
              <Film size={14} />
              <span>{audiName}</span>
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className={seatSelectorHStyles.screenContainer}>
          <div
            className={seatSelectorHStyles.screen}
            style={{
              transform: "perspective(120px) rotateX(6deg)",
              maxWidth: 900,
              boxShadow: "0 0 40px rgba(220, 38, 38, 0.18)",
            }}
          >
            <div className={seatSelectorHStyles.screenText}>CURVED SCREEN</div>
            <div className={seatSelectorHStyles.screenSubtext}>
              Please face the screen — enjoy the show
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={seatSelectorHStyles.mainContent}>
          <div className={seatSelectorHStyles.sectionHeader}>
            <div className={seatSelectorHStyles.sectionTitleContainer}>
              <h2
                className={seatSelectorHStyles.sectionTitle}
                style={{
                  fontFamily: "'Cinzel', 'Times New Roman', serif",
                  textShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
                  letterSpacing: "0.06em",
                }}
              >
                Select Your Seats
              </h2>
              <div className={seatSelectorHStyles.titleDivider} />
            </div>
          </div>

          {/* Seat grid */}
          <div className={seatSelectorHStyles.seatGridContainer}>
            {ROWS.map((row) => (
              <div key={row.id} className={seatSelectorHStyles.rowContainer}>
                <div className={seatSelectorHStyles.rowHeader}>
                  <div className={seatSelectorHStyles.rowLabel}>{row.id}</div>
                  <div className="flex-1 flex justify-center">
                    <div
                      className={seatSelectorHStyles.seatGrid}
                      style={{ width: "100%", maxWidth: "720px" }}
                    >
                      {Array.from({ length: row.count }).map((_, i) => {
                        const num = i + 1;
                        const id = seatId(row.id, num);
                        const isBooked = booked.has(id);
                        const isSelected = selected.has(id);

                        let cls = seatSelectorHStyles.seatButton;
                        if (isBooked)
                          cls += ` ${seatSelectorHStyles.seatButtonBooked}`;
                        else if (isSelected)
                          cls +=
                            row.type === "recliner"
                              ? ` ${seatSelectorHStyles.seatButtonSelectedRecliner}`
                              : ` ${seatSelectorHStyles.seatButtonSelectedStandard}`;
                        else
                          cls +=
                            row.type === "recliner"
                              ? ` ${seatSelectorHStyles.seatButtonAvailableRecliner}`
                              : ` ${seatSelectorHStyles.seatButtonAvailableStandard}`;

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
                            aria-pressed={isSelected}
                          >
                            {row.type === "recliner" ? (
                              <div className={seatSelectorHStyles.seatContent}>
                                <Sofa
                                  size={16}
                                  className={seatSelectorHStyles.seatIcon}
                                />
                                <div className={seatSelectorHStyles.seatNumber}>
                                  {num}
                                </div>
                              </div>
                            ) : (
                              <div className={seatSelectorHStyles.seatContent}>
                                <RockingChair
                                  size={12}
                                  className={seatSelectorHStyles.seatIcon}
                                />
                                <div className={seatSelectorHStyles.seatNumber}>
                                  {num}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className={seatSelectorHStyles.rowType}>{row.type}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Summary & Actions */}
          <div className={seatSelectorHStyles.summaryGrid}>
            <div className={seatSelectorHStyles.summaryContainer}>
              <h3 className={seatSelectorHStyles.summaryTitle}>
                <Ticket size={18} /> Booking Summary
              </h3>

              <div className="space-y-4">
                <div className={seatSelectorHStyles.summaryItem}>
                  <span className={seatSelectorHStyles.summaryLabel}>
                    Selected Seats:
                  </span>
                  <span className={seatSelectorHStyles.summaryValue}>
                    {selectedCount}
                  </span>
                </div>

                {selectedCount > 0 && (
                  <>
                    <div className={seatSelectorHStyles.selectedSeatsContainer}>
                      <div className={seatSelectorHStyles.selectedSeatsLabel}>
                        Selected Seats:
                      </div>
                      <div className={seatSelectorHStyles.selectedSeatsList}>
                        {[...selected].sort().map((seat) => (
                          <span
                            key={seat}
                            className={seatSelectorHStyles.selectedSeatBadge}
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={seatSelectorHStyles.totalContainer}>
                      <div className={seatSelectorHStyles.pricingRow}>
                        <span className={seatSelectorHStyles.totalLabel}>
                          Total Amount:
                        </span>
                        <span className={seatSelectorHStyles.totalValue}>
                          ₹{Math.round(total)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {selectedCount === 0 && (
                  <div className={seatSelectorHStyles.emptyState}>
                    <div className={seatSelectorHStyles.emptyStateTitle}>
                      No seats selected
                    </div>
                    <div className={seatSelectorHStyles.emptyStateSubtitle}>
                      Select seats from the grid to continue
                    </div>
                  </div>
                )}

                <div className={seatSelectorHStyles.actionButtons}>
                  <button
                    onClick={clearSelection}
                    disabled={selectedCount === 0}
                    className={seatSelectorHStyles.clearButton}
                  >
                    Clear
                  </button>
                  <button
                    onClick={confirmBooking}
                    disabled={selectedCount === 0}
                    className={seatSelectorHStyles.confirmButton}
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>

            <div className={seatSelectorHStyles.pricingContainer}>
              <h3 className={seatSelectorHStyles.pricingTitle}>
                <CreditCard size={18} /> Pricing Info
              </h3>
              <div className="space-y-3">
                <div className={seatSelectorHStyles.pricingItem}>
                  <div className={seatSelectorHStyles.pricingRow}>
                    <div className={seatSelectorHStyles.pricingLabel}>
                      Standard
                    </div>
                    <div className={seatSelectorHStyles.pricingValueStandard}>
                      ₹{basePrice}
                    </div>
                  </div>
                </div>
                <div className={seatSelectorHStyles.pricingItem}>
                  <div className={seatSelectorHStyles.pricingRow}>
                    <div className={seatSelectorHStyles.pricingLabel}>
                      Recliner
                    </div>
                    <div className={seatSelectorHStyles.pricingValueRecliner}>
                      ₹{Math.round(basePrice * 1.5)}
                    </div>
                  </div>
                </div>
                <div className={seatSelectorHStyles.pricingNote}>
                  All prices include taxes. No hidden charges.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


