const bootText = document.getElementById("bootText");
const skullArt = document.getElementById("skullArt");
const warning = document.getElementById("warning");
const app = document.getElementById("app");
const bootLines = ["whoami", "IB_AFRIDI", "./enter_huntverse.sh"];
let bootIndex = 0;
let charIndex = 0;
let deleting = false;
function boot() {
  if (bootIndex >= bootLines.length) {
    skullArt.textContent =
      '     .-"""-.\n    / .===. \\\n    \/ 6 6 \/\n    ( \\___/ )\n___ooo__V__ooo___';
    return;
  }
  const line = bootLines[bootIndex];
  if (!deleting) {
    bootText.textContent = line.slice(0, ++charIndex);
    if (charIndex === line.length) {
      deleting = true;
      setTimeout(boot, 500);
      return;
    }
  } else {
    bootText.textContent = line.slice(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      bootIndex++;
    }
  }
  setTimeout(boot, deleting ? 35 : 80);
}
boot();
document.getElementById("enterBtn").addEventListener("click", () => {
  warning.classList.add("hidden");
  app.classList.add("visible");
  notify("Welcome to the authorized Huntverse arena");
});
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
let width, height, columns, drops;
function resizeMatrix() {
  width = canvas.width = innerWidth;
  height = canvas.height = innerHeight;
  columns = Math.floor(width / 14);
  drops = Array(columns).fill(1);
}
function drawMatrix() {
  ctx.fillStyle = "rgba(0,0,0,.08)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#00ff41";
  ctx.font = "12px monospace";
  drops.forEach((y, i) => {
    const text = "01XHUNTVERSE".charAt(Math.floor(Math.random() * 11));
    ctx.fillText(text, i * 14, y * 14);
    if (y * 14 > height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  });
}
resizeMatrix();
addEventListener("resize", resizeMatrix);
setInterval(drawMatrix, 55);
const navItems = document.querySelectorAll(".nav-item[data-view]");
const views = document.querySelectorAll(".view");
const viewTitle = document.getElementById("viewTitle");
const sidebar = document.querySelector(".sidebar");
const names = {
  hunter: "HUNTER DASHBOARD",
  company: "COMPANY / TARGET",
  triage: "TRIAGE // GOD MODE",
  arena: "PUBLIC ARENA",
  cve: "CVE DATABASE",
  reports: "REPORT TEMPLATES",
  settings: "SECURITY SETTINGS",
};
function openView(name) {
  views.forEach((v) => v.classList.remove("active"));
  document.getElementById(`${name}View`)?.classList.add("active");
  navItems.forEach((n) =>
    n.classList.toggle("active", n.dataset.view === name),
  );
  viewTitle.textContent = names[name] || name.toUpperCase();
  sidebar.classList.remove("open");
  scrollTo({ top: 0, behavior: "smooth" });
}
navItems.forEach((n) =>
  n.addEventListener("click", () => openView(n.dataset.view)),
);
document
  .querySelectorAll("[data-view-link]")
  .forEach((n) =>
    n.addEventListener("click", () => openView(n.dataset.viewLink)),
  );
document
  .querySelectorAll("[data-panel-link]")
  .forEach((n) =>
    n.addEventListener("click", () => openView(n.dataset.panelLink)),
  );
document
  .getElementById("mobileToggle")
  .addEventListener("click", () => sidebar.classList.toggle("open"));
const toast = document.getElementById("toast");
function notify(message) {
  toast.querySelector("small").textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toast);
  window.toast = setTimeout(() => toast.classList.remove("show"), 2600);
}
document
  .querySelectorAll("[data-notify]")
  .forEach((b) => b.addEventListener("click", () => notify(b.dataset.notify)));
document.getElementById("glitchBtn").addEventListener("click", () => {
  document.body.classList.add("glitch-mode");
  setTimeout(() => document.body.classList.remove("glitch-mode"), 500);
  notify("Visual system diagnostics complete");
});
const terminal = document.getElementById("terminal");
const terminalInput = document.getElementById("terminalInput");
function runCommand(command) {
  terminal.innerHTML += `<div><i>root@huntverse</i>:~# <b>${command}</b></div>`;
  if (command.includes("recon") || command.includes("scan")) {
    [
      "[+] Resolving target scope...",
      "[+] Running Nmap port discovery...",
      "[+] Enumerating DNS and subdomains...",
      "[+] HTTP security audit complete",
      "[✓] Report generated: /reports/HV-1043.json",
    ].forEach((line, i) =>
      setTimeout(() => {
        terminal.innerHTML += `<div class="dim">${line}</div>`;
        terminal.scrollTop = terminal.scrollHeight;
      }, i * 260),
    );
  } else
    terminal.innerHTML +=
      '<div class="dim">Unknown command. Try: recon bbestcafe.com</div>';
}
document
  .getElementById("reconBtn")
  .addEventListener("click", () => runCommand("recon bbestcafe.com --safe"));
document.getElementById("terminalSend").addEventListener("click", () => {
  if (terminalInput.value.trim()) {
    runCommand(terminalInput.value.trim());
    terminalInput.value = "";
  }
});
terminalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("terminalSend").click();
});
const alertGlitch = document.getElementById("alertGlitch");
document.getElementById("triageBtn").addEventListener("click", () => {
  alertGlitch.classList.add("show");
  setTimeout(() => alertGlitch.classList.remove("show"), 1800);
  notify("AI triage: real SQLi · P1 · CVSS 9.8 · not duplicate");
});
document
  .getElementById("cveBtn")
  .addEventListener("click", () =>
    notify(
      `Searching CVE intelligence for “${document.getElementById("cveInput").value || "latest vulnerabilities"}”`,
    ),
  );
