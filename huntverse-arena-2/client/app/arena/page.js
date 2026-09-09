"use client";
import { useState } from "react";
const challenges = [
  ["SQLi Lab", "P1", "100 pts"],
  ["XSS Relay", "P2", "100 pts"],
  ["OSINT Trail", "P3", "100 pts"],
  ["Crypto Vault", "P2", "100 pts"],
];
export default function Arena() {
  const [selected, setSelected] = useState(0);
  const [cmd, setCmd] = useState("");
  return (
    <main className="arena">
      <header className="arena-top">
        <b>☠ HUNTVERSE / ROOM HV-2048</b>
        <span>● LIVE · 12/50 HUNTERS</span>
        <strong>03:42</strong>
      </header>
      <div className="arena-grid">
        <aside className="challenge-list">
          <small>ACTIVE CHALLENGES</small>
          {challenges.map((c, i) => (
            <button
              className={selected === i ? "selected" : ""}
              onClick={() => setSelected(i)}
              key={c[0]}
            >
              <b>{c[0]}</b>
              <span>
                {c[1]} · {c[2]}
              </span>
            </button>
          ))}
        </aside>
        <section className="arena-terminal">
          <div className="terminal-head">
            DOCKER LAB // {challenges[selected][0].toUpperCase()}{" "}
            <span>ISOLATED</span>
          </div>
          <div className="terminal-screen">
            <p>┌──(hunter㉿lab)-[~/challenge]</p>
            <p>
              └─$ <span>nmap --safe-scan target</span>
            </p>
            <p className="dim">Starting authorized lab scan...</p>
            <p className="dim">
              22/tcp open ssh · 80/tcp open http · lab network locked
            </p>
            <p className="green">
              [+] Challenge objective loaded. Find the flag.
            </p>
            <div className="terminal-command">
              <span>└─$</span>
              <input
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                placeholder="command"
              />
            </div>
          </div>
          <div className="terminal-footer">
            ⚠ This is an isolated CTF lab. No public targets.
          </div>
        </section>
        <aside className="score">
          <h3>LIVE SCOREBOARD</h3>
          <div className="score-row first">
            <span>01</span>
            <b>IB_AFRIDI</b>
            <strong>1,450</strong>
          </div>
          <div className="score-row">
            <span>02</span>
            <b>Ghost404</b>
            <strong>1,220</strong>
          </div>
          <div className="score-row">
            <span>03</span>
            <b>ShadowKPK</b>
            <strong>980</strong>
          </div>
          <h3 className="chat-title">KILL FEED</h3>
          <p className="kill">
            ⚡ IB_AFRIDI captured SQLi Lab <small>just now</small>
          </p>
          <p className="kill red">
            ☠ Ghost404 first blood on XSS Relay <small>2m ago</small>
          </p>
          <input className="chat-input" placeholder="room chat..." />
        </aside>
      </div>
    </main>
  );
}
