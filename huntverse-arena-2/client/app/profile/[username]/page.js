export default function Profile({ params }) {
  return (
    <main className="landing">
      <div className="top">
        <b>☠ HUNTVERSE / PROFILE</b>
        <a href="/">← Home</a>
      </div>
      <section className="hero">
        <p className="eyebrow">HUNTER PROFILE</p>
        <h1>
          {params.username}
          <br />
          <em>// GHOST LEVEL</em>
        </h1>
        <p className="lede">
          142 systems secured · 31 accepted reports · 9,999 reputation ·
          Peshawar, Pakistan
        </p>
        <div className="links">
          <a href="/arena">Enter live arena →</a>
        </div>
      </section>
    </main>
  );
}
