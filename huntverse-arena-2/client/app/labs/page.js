export default function Labs() {
  return (
    <main className="landing">
      <div className="top">
        <b>☠ HUNTVERSE / PRACTICE LABS</b>
        <a href="/">← Home</a>
      </div>
      <section className="hero">
        <p className="eyebrow">ISOLATED TRAINING RANGE</p>
        <h1>
          Sharpen the
          <br />
          <em>operator.</em>
        </h1>
        <p className="lede">
          Practice SQLi, XSS, OSINT, crypto, stego, and more in disposable labs
          before entering a live room.
        </p>
        <div className="terminal-card">
          <div>LAB STATUS // 10 CHALLENGE FAMILIES</div>
          <div className="dim">[✓] Containers isolated</div>
          <div className="dim">[✓] Dynamic flags per room</div>
          <div className="dim">[✓] No public target access</div>
        </div>
      </section>
    </main>
  );
}
