const formatSlot = (date) => {
  if (!(date instanceof Date)) date = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const fmtINR = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "₹0";


  const [selectedMovie, setSelectedMovie] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      setLoading(true);
      try {
        const token = getStoredToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Request only paid bookings by default
        const params = { paymentStatus: "paid", limit: 1000 };

        let res;
        try {
          res = await axios.get(`${API_BASE}/api/bookings/my`, {
            headers,
            params,
          });
        } catch (err) {
          res = await axios.get(`${API_BASE}/api/bookings`, {
            headers,
            params,
          });
        }

        const data = res?.data;
        let items = [];
        if (!data) items = [];
        else if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.bookings)) items = data.bookings;
        else items = [];

        const mapped = items.map((b) => {
          const id = b._id || b.id || b.bookingId || "";
          const movie =
            (b.movie && (b.movie.title || b.movie.movieName)) ||
            b.movieName ||
            (typeof b.movie === "string" ? b.movie : "");
          const rawSlot = b.showtime || b.slot || b.time || b.date;
          const slot = rawSlot ? new Date(rawSlot) : null;
          const basePrice =
            Number(
              b.basePrice || b.base_price || (b.movie && b.movie.price) || 0
            ) || 0;
          let seats = [];
          if (Array.isArray(b.seats)) {
            seats = b.seats
              .map((s) =>
                typeof s === "string" ? s : (s && (s.seatId || s.id)) || ""
              )
              .filter(Boolean);
          } else if (Array.isArray(b.seatIds)) {
            seats = b.seatIds.map(String).filter(Boolean);
          }
          const customer =
            b.customer ||
            b.customerName ||
            (b.user && (b.user.name || b.user.fullName)) ||
            (b.raw && b.raw.customer) ||
            "";

          // server authoritative amount
          let amountRupees = 0;
          if (b.amountPaise !== undefined && b.amountPaise !== null)
            amountRupees = Number(b.amountPaise) / 100;
          else if (typeof b.amount === "number") amountRupees = b.amount;
          else if (
            b.raw &&
            b.raw.amountPaise !== undefined &&
            b.raw.amountPaise !== null
          )
            amountRupees = Number(b.raw.amountPaise) / 100;

          const status = (b.status || (b.raw && b.raw.status) || "")
            .toString()
            .toLowerCase();
          const paymentStatus = (
            b.paymentStatus ||
            (b.raw && b.raw.paymentStatus) ||
            ""
          )
            .toString()
            .toLowerCase();

          // NEW: auditorium extraction (defensive)
          let auditorium =
            b.auditorium ||
            b.audi ||
            b.audiName ||
            b.hall ||
            (b.raw && (b.raw.auditorium || b.raw.audi || b.raw.hall)) ||
            "";
          // normalize to string and fallback if empty
          auditorium = auditorium ? String(auditorium) : "";

          return {
            id,
            movie,
            slot,
            basePrice,
            seats,
            customer,
            raw: b,
            amount: amountRupees,
            status,
            paymentStatus,
            auditorium,
          };
        });

        // Defensive client-side filter: show only paid bookings (or status === 'paid')
        const paidOnly = mapped.filter(
          (m) => m.paymentStatus === "paid" || m.status === "paid"
        );

        if (!cancelled) setBookings(paidOnly);
      } catch (err) {
        console.error(
          "Failed to fetch bookings:",
          err?.response?.data || err.message || err
        );
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  // derive unique movie list for the select
  const movies = useMemo(() => {
    const set = new Set(bookings.map((b) => b.movie));
    return Array.from(set);
  }, [bookings]);

  // bookings to display (filter by selected movie if any)
  const bookingsToShow = useMemo(() => {
    const filtered = selectedMovie
      ? bookings.filter((b) => b.movie === selectedMovie)
      : bookings;
    return filtered;
  }, [selectedMovie, bookings]);
