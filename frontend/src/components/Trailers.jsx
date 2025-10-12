
const Trailers = () => {
  const [featuredTrailer, setFeaturedTrailer] = useState(trailersData[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    // no-op kept for parity
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const selectTrailer = (trailer) => {
    setFeaturedTrailer(trailer);
    setIsPlaying(false);
    try {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    } catch (e) {
      // ignore
    }

    // center selected item in carousel
    try {
      if (carouselRef.current) {
        const el = carouselRef.current.querySelector(`[data-id='${trailer.id}']`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const parentRect = carouselRef.current.getBoundingClientRect();
          const offset = rect.left - parentRect.left - parentRect.width / 2 + rect.width / 2;
          carouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const togglePlay = () => {
    setIsPlaying((s) => !s);
  };

  // helper to build embed URL for common providers (YouTube / youtu.be / Vimeo)
  const getEmbedBaseUrl = (videoUrl) => {
    if (!videoUrl) return "";
    try {
      const url = new URL(videoUrl);
      const host = url.hostname.replace("www.", "").toLowerCase();

      // YouTube standard watch URL: youtube.com/watch?v=ID
      if (host.includes("youtube.com")) {
        const vid = url.searchParams.get("v");
        if (vid) return `https://www.youtube.com/embed/${vid}`;
        // If already embed path, return that
        if (url.pathname.includes("/embed/")) return `https://www.youtube.com${url.pathname}`;
      }

      // short youtu.be links
      if (host === "youtu.be") {
        const vid = url.pathname.replace("/", "");
        if (vid) return `https://www.youtube.com/embed/${vid}`;
      }

      // Vimeo
      if (host.includes("vimeo.com")) {
        // path like /12345678 or /channels/.../12345678
        const parts = url.pathname.split("/").filter(Boolean);
        const id = parts.pop();
        if (id) return `https://player.vimeo.com/video/${id}`;
      }

      // fallback: return original (could already be an embed URL)
      return videoUrl;
    } catch (e) {
      // if URL constructor fails, return as-is
      return videoUrl || "";
    }
  };

  // build final iframe src with autoplay/mute parameters
  const buildIframeSrc = (videoUrl) => {
    const base = getEmbedBaseUrl(videoUrl);
    if (!base) return "";
    const sep = base.includes("?") ? "&" : "?";
    // add autoplay / mute / rel
    return `${base}${sep}autoplay=1&mute=${isMuted ? 1 : 0}&rel=0`;
  };


};

export default Trailers;
