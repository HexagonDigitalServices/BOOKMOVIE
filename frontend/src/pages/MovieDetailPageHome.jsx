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
