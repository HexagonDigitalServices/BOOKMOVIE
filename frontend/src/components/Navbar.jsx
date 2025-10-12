

const Navbar = () => {

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Read auth state from localStorage
  useEffect(() => {
    const readAuthFromStorage = () => {
      const json = localStorage.getItem("cine_auth");
      if (json) {
        try {
          const parsed = JSON.parse(json);
          setIsLoggedIn(Boolean(parsed?.isLoggedIn));
          setUserEmail(parsed?.email || "");
          return;
        } catch (err) {}
      }

      const simpleFlag = localStorage.getItem("isLoggedIn");
      const email = localStorage.getItem("userEmail") || localStorage.getItem("cine_user_email");
      if (simpleFlag === "true") {
        setIsLoggedIn(true);
        setUserEmail(email || "");
        return;
      }

      if (email) {
        setIsLoggedIn(true);
        setUserEmail(email);
        return;
      }

      setIsLoggedIn(false);
      setUserEmail("");
    };

    readAuthFromStorage();
    const onStorage = (e) => {
      if (["cine_auth", "isLoggedIn", "userEmail", "cine_user_email"].includes(e.key)) {
        readAuthFromStorage();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "movies", label: "Movies", icon: Film, path: "/movies" },
    { id: "releases", label: "Releases", icon: Calendar, path: "/releases" },
    { id: "contact", label: "Contact", icon: Mail, path: "/contact" },
    { id: "bookings", label: "Bookings", icon: Ticket, path: "/bookings" },
  ];
};