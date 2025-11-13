// format INR
const fmtINR = (num) =>
  typeof num === "number"
    ? `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "₹0";


  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        // request paid bookings only (defensive: backend may already default to paid)

        // helper to normalise typical API shapes
        const normaliseArrayResponse = (r) => {
          if (!r) return [];
          if (r.status === "rejected") return [];
          const data = r.value?.data;
          if (!data) return [];
          if (Array.isArray(data)) return data;
          if (Array.isArray(data.items)) return data.items;
          if (Array.isArray(data.rows)) return data.rows;
          if (Array.isArray(data.data)) return data.data;
          // sometimes backend returns { success: true, items: [...] }
          if (Array.isArray(data.items)) return data.items;
          return [];
        };

        const rawMovies = normaliseArrayResponse(mRes);
        const rawBookings = normaliseArrayResponse(bRes);
        const rawUsers = normaliseArrayResponse(uRes);

        // normalize movies -> { id, title, basePrice }
        const normMovies = rawMovies.map((m) => ({
          id: m._id || m.id || m.movieId || m.idStr || "",
          title: m.title || m.movieName || m.name || "Untitled",
          basePrice: Number(m.basePrice || m.price || m.ticketPrice || 0) || 0,
        }));

        // normalize bookings -> { id, movieId, movieTitle, seats:[], totalPaid, userId, customer, raw }
        const normBookings = rawBookings.map((b) => {
          const movieId =
            b.movieId || (b.movie && (b.movie.id || b.movie._id)) || "";
          const movieTitle =
            (b.movie && (b.movie.title || b.movie.movieName)) ||
            b.movieName ||
            b.movie ||
            "";
          const seats = Array.isArray(b.seats)
            ? b.seats
                .map((s) =>
                  typeof s === "string" ? s : (s && (s.seatId || s.id)) || ""
                )
                .filter(Boolean)
            : Array.isArray(b.seatIds)
            ? b.seatIds.map(String).filter(Boolean)
            : [];
          // prefer authoritative amount fields
          const totalPaid =
            Number(
              b.amountPaise !== undefined && b.amountPaise !== null
                ? Number(b.amountPaise) / 100
                : b.amount || b.total || 0
            ) || 0;
          const userId =
            b.userId ||
            (b.user && (b.user._id || b.user.id)) ||
            b.customerId ||
            "";
          const customer =
            b.customer ||
            b.customerName ||
            (b.user && (b.user.name || b.user.fullName)) ||
            "";
          return {
            id: b._id || b.id || b.bookingId || "",
            movieId,
            movieTitle,
            seats,
            totalPaid,
            userId,
            customer,
            raw: b,
          };
        });

        // Defensive client-side filter: ensure only paid bookings are used.
        const paidBookings = normBookings.filter((bk) => {
          const raw = bk.raw || {};
          const ps = (
            raw.paymentStatus ||
            raw.payment_status ||
            raw.paymentstate ||
            ""
          )
            .toString()
            .toLowerCase();
          const st = (raw.status || "").toString().toLowerCase();
          // accept booking if paymentStatus === 'paid' or status === 'paid' or we have a positive paid amount
          return ps === "paid" || st === "paid" || Number(bk.totalPaid) > 0;
        });

        // normalize users -> { id, name }
        const normUsers = rawUsers.map((u) => ({
          id: u._id || u.id || u.userId || "",
          name: u.name || u.fullName || u.username || "",
        }));

        if (!cancelled) {
          setMovies(normMovies);
          setBookings(paidBookings);
          setUsers(normUsers);
        }
      } catch (err) {
        console.error("dashboard fetch error:", err);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    // totals from bookings (bookings already filtered to paid bookings)
    const totalBookings = bookings.length;

    let totalRevenue = 0;
    for (let i = 0; i < bookings.length; i++)
      totalRevenue += bookings[i].totalPaid || 0;

    // total users: prefer users API if it returned data, otherwise derive from bookings
    const usersFromApi = new Set(users.map((u) => u.id).filter(Boolean));

    const usersFromBookings = new Set();
    for (let i = 0; i < bookings.length; i++) {
      const b = bookings[i];
      if (b.userId) usersFromBookings.add(String(b.userId));
      else if (b.customer) usersFromBookings.add(String(b.customer));
      else if (b.raw && b.raw.email) usersFromBookings.add(String(b.raw.email));
      else if (b.raw && b.raw.customerEmail)
        usersFromBookings.add(String(b.raw.customerEmail));
    }

    const totalUsers =
      usersFromApi.size > 0 ? usersFromApi.size : usersFromBookings.size;

    // per-movie aggregation — only include movies that actually have bookings
    const map = {};

    // first, build a quick id->title map from movies API
    const movieTitleMap = {};
    for (let i = 0; i < movies.length; i++) {
      const m = movies[i];
      if (m.id) movieTitleMap[m.id] = m.title;
    }

    // aggregate from bookings so only movies with bookings appear
    for (let i = 0; i < bookings.length; i++) {
      const bk = bookings[i];
      const key = bk.movieId || bk.movieTitle || `unknown-${i}`;
      const title = movieTitleMap[bk.movieId] || bk.movieTitle || "Unknown";
      if (!map[key]) map[key] = { id: key, title, bookings: 0, earnings: 0 };
      map[key].bookings += 1;
      map[key].earnings += bk.totalPaid || 0;
    }

    const movieStats = Object.values(map).sort(
      (a, b) => b.bookings - a.bookings
    );

    return { totalBookings, totalRevenue, totalUsers, movieStats };
  }, [movies, bookings, users]);



              <thead>
                <tr className={styles3.tableHeader}>
                  <th className={styles3.tableHeaderCell}>Movie</th>
                  <th className={styles3.tableHeaderCell}>Total Bookings</th>
                  <th className={styles3.tableHeaderCell}>Total Earnings</th>
                  <th className={styles3.tableHeaderCell}>Avg per Booking</th>
                </tr>
              </thead>

            {summary.movieStats.map((m) => {
              const avg = m.bookings ? Math.round(m.earnings / m.bookings) : 0;
              return (
                <div key={m.id} className={styles3.mobileCard}>
                  <div className={styles3.mobileCardInner}>
                    <div>
                      <div className={styles3.mobileMovieTitle}>{m.title}</div>
                      <div className={styles3.mobileLabel}>
                        Bookings:{" "}
                        <span className={styles3.mobileValue}>
                          {m.bookings}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={styles3.mobileEarnings}>
                        {fmtINR(m.earnings)}
                      </div>
                      <div className={styles3.mobileAvgLabel}>
                        Avg:{" "}
                        <span className={styles3.mobileAvgValue}>
                          {fmtINR(avg)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}