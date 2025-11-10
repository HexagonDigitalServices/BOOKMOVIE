
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const NavItem = ({ to, Icon, label, end = false, onClick }) => (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `${styles4.navLinkBase} ${
          isActive
            ? styles4.navLinkActive
            : styles4.navLinkInactive
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`${styles4.navLinkIconBase} ${
              isActive ? styles4.navLinkIconActive : styles4.navLinkIconInactive
            }`}
          />
          <span
            className={`${styles4.navLinkTextBase} ${
              isActive ? styles4.navLinkTextActive : styles4.navLinkTextInactive
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );

  
          {/* Desktop Links (unchanged look) */}
          <div className={styles4.desktopNav}>
            <NavItem to="/" Icon={Film} label="ADD MOVIES" end />
            <NavItem to="/listmovies" Icon={List} label="LIST MOVIES" />
            {/* Dashboard */}
            <NavItem to="/dashboard" Icon={Calendar} label="DASHBOARD" />
            {/* Bookings (new) */}
            <NavItem to="/bookings" Icon={Ticket} label="BOOKINGS" />
          </div> 