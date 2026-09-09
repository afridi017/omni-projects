const hunters = [
  ["01", "IB_AFRIDI", "Peshawar", "9,999"],
  ["02", "Ghost404", "Islamabad", "8,420"],
  ["03", "ShadowKPK", "Swat", "7,812"],
  ["04", "CyberPashtun", "Mardan", "6,404"],
  ["05", "RootRider", "Lahore", "5,990"],
];
export default function Leaderboard() {
  return (
    <main className="landing">
      <div className="top">
        <b>☠ HUNTVERSE / GLOBAL RANKING</b>
        <a href="/">← Home</a>
      </div>
      <section className="hero">
        <p className="eyebrow">PAKISTAN HUNTER NETWORK</p>
        <h1>
          Who owns the
          <br />
          <em>board?</em>
        </h1>
        <div className="terminal-card">
          {hunters.map((h) => (
            <div key={h[0]}>
              <span>{h[0]}</span> · {h[1]} <i className="dim">{h[2]}</i>
              <b style={{ float: "right", color: "#22d3ee" }}>{h[3]}</b>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
