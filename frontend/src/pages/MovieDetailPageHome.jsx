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
