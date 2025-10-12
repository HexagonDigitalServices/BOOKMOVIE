const News = () => {
  return (
    <>
      {/* Keep fonts the same — Monoton for logo, Roboto for body */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Monoton&family=Roboto:wght@300;400;700&display=swap');`}</style>

      <div
        className={newsStyles.logoSubtitle}
        style={{ fontFamily: "Roboto, sans-serif" }}
      >
        Latest • Curated • Cinematic
      </div>
    </>
  );
};

export default News;
