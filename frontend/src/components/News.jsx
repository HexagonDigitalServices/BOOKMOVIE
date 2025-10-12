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

     {/* Right column: animated card stack */}
          <aside className={newsStyles.sidebar}>
            {sampleNews.slice(4, 7).map((item) => (
              <div
                key={item.id}
                className={newsStyles.sidebarCard}
              >
                <div className={newsStyles.sidebarCardInner}>
                  <div className={newsStyles.sidebarImage}>
                    <img src={item.image} alt={item.title} className={newsStyles.sidebarImg} loading="lazy" />
                  </div>

                  <div className={newsStyles.sidebarContent}>
                    <div className="flex items-start gap-2">
                      <span className={newsStyles.sidebarCategory}>{item.category}</span>
                    </div>

                    <h4 className={newsStyles.sidebarTitle} style={{ fontFamily: "Roboto, sans-serif" }}>{item.title}</h4>
                    <p className={newsStyles.sidebarExcerpt}>{item.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA / Subscribe card */}
            <div className={newsStyles.subscribeCard}>
              <h5 className={newsStyles.subscribeTitle} style={{ fontFamily: "Roboto, sans-serif" }}>Join CineNews</h5>
              <p className={newsStyles.subscribeText}>Get curated cinematic news, exclusive behind-the-scenes, and early access to trailers.</p>
              <div className={newsStyles.subscribeForm}>
                <input
                  className={newsStyles.subscribeInput}
                  placeholder="Email address"
                />
                <button className={newsStyles.subscribeButton}>
                  Subscribe
                </button>
              </div>
            </div>
          </aside>

export default News;
