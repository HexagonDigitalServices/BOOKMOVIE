/**
 * ScrollToTop component:
 * - Forces an immediate jump to the very top on every navigation.
 * - If URL has a hash, it will try to jump to that element (also immediately).
 * - Disables browser's automatic scroll restoration to avoid the browser restoring previous positions.
 */
function ScrollToTop() {
  const location = useLocation();

  // Disable browser auto scroll restoration (do once)
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    // If there's a hash (e.g. /page#section), try to jump to that element
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id) || document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        return;
      }
    }

    // Force immediate top-of-page
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.search, location.hash]);

  return null;
}

// Ensure no horizontal overflow on the root document (defensive)
  useEffect(() => {
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;

    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    return () => {
      // restore previous values just in case other scripts rely on them
      document.documentElement.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
    };
  }, []);
