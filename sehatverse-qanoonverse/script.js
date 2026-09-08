const navItems = document.querySelectorAll(".nav-item[data-panel]");
const panels = document.querySelectorAll(".panel-view");
const title = document.getElementById("panelTitle");
const sidebar = document.getElementById("sidebar");
const toast = document.getElementById("toast");
const aiModal = document.getElementById("aiModal");
const panelNames = {
  patient: "Patient app",
  doctor: "Doctor panel",
  lab: "Lab panel",
  pharmacy: "Pharmacy panel",
  hospital: "Hospital admin",
  rider: "Rider panel",
  lawyer: "Lawyer panel",
  inspector: "Health inspector",
  finance: "Finance & cards",
  brain: "AI Brain",
  records: "Medical record vault",
};
function notify(message) {
  toast.querySelector("small").textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2700);
}
function openPanel(name) {
  const target = document.getElementById(`${name}Panel`);
  if (!target) return;
  panels.forEach((panel) => panel.classList.remove("active"));
  target.classList.add("active");
  navItems.forEach((item) =>
    item.classList.toggle("active", item.dataset.panel === name),
  );
  title.textContent = panelNames[name] || name;
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
navItems.forEach((item) =>
  item.addEventListener("click", () => openPanel(item.dataset.panel)),
);
document
  .querySelectorAll("[data-panel-link]")
  .forEach((button) =>
    button.addEventListener("click", () => openPanel(button.dataset.panelLink)),
  );
document
  .getElementById("menuBtn")
  .addEventListener("click", () => sidebar.classList.toggle("open"));
document.getElementById("theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  notify(
    document.body.classList.contains("dark")
      ? "Dark mode enabled"
      : "Light mode enabled",
  );
});
document
  .getElementById("language")
  .addEventListener("click", () =>
    notify("Pashto and Urdu voice support enabled"),
  );
document
  .getElementById("emergencyBtn")
  .addEventListener("click", () =>
    notify("Emergency dispatch started — nearest ambulance is being located"),
  );
document
  .querySelectorAll("[data-notify]")
  .forEach((button) =>
    button.addEventListener("click", () => notify(button.dataset.notify)),
  );
document.getElementById("checkSymptoms").addEventListener("click", () => {
  const value = document.getElementById("symptomInput").value.trim();
  notify(
    value
      ? `AI Hujra is reviewing: “${value}”`
      : "Tell us a symptom first, in any language",
  );
});
document
  .getElementById("voiceCheck")
  .addEventListener("click", () =>
    notify("Voice symptom checker listening..."),
  );
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("symptomInput").focus();
  }
});
document
  .getElementById("reportReader")
  .addEventListener("click", () =>
    notify("Report upload opened — AI will explain it in simple Urdu"),
  );
document
  .getElementById("alternativeBtn")
  .addEventListener("click", () =>
    notify("AI is comparing salt alternatives across 20 verified pharmacies"),
  );
document
  .querySelectorAll(".add-medicine")
  .forEach((button) =>
    button.addEventListener("click", () =>
      notify("Medicine added to delivery basket"),
    ),
  );
document
  .getElementById("noticeBtn")
  .addEventListener("click", () =>
    notify("Legal notice intake opened for lawyer review"),
  );
document
  .getElementById("insafBtn")
  .addEventListener("click", () =>
    notify("Sehat Insaf Card eligibility checker opened"),
  );
document
  .getElementById("openAi")
  .addEventListener("click", () => aiModal.classList.add("open"));
document
  .getElementById("closeAi")
  .addEventListener("click", () => aiModal.classList.remove("open"));
aiModal.addEventListener("click", (event) => {
  if (event.target === aiModal) aiModal.classList.remove("open");
});
document.getElementById("sendAi").addEventListener("click", answerAi);
document.getElementById("aiQuestion").addEventListener("keydown", (event) => {
  if (event.key === "Enter") answerAi();
});
function answerAi() {
  const value = document.getElementById("aiQuestion").value.trim();
  if (!value) return;
  const answer = document.getElementById("aiAnswer");
  answer.textContent =
    "AI Hujra is checking trusted medical sources and local care options...";
  setTimeout(() => {
    answer.textContent = value.toLowerCase().includes("cancer")
      ? "Report ko upload karein. AI result ko simple Urdu mein explain karega, lekin diagnosis licensed doctor confirm karega. Negligence concern ho to reports, bills, consent aur timeline preserve karein; QanoonVerse lawyer review ke liye notice draft karega."
      : "Theek de, I am finding a safe next step near Bara. A licensed doctor will review anything urgent.";
  }, 650);
}
document.getElementById("symptomInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") document.getElementById("checkSymptoms").click();
});
