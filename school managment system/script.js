const navItems = document.querySelectorAll(".nav-item[data-view]");
const views = document.querySelectorAll(".view");
const pageTitle = document.getElementById("pageTitle");
const pageKicker = document.getElementById("pageKicker");
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const themeToggle = document.getElementById("themeToggle");
const languageToggle = document.getElementById("languageToggle");
const toast = document.getElementById("toast");
const quickModal = document.getElementById("quickModal");

const titles = {
  overview: "Overview",
  students: "Students",
  admissions: "Admissions",
  attendance: "Attendance",
  fees: "Fees & Finance",
  academics: "Academics",
  staff: "Teachers & Staff",
  library: "Library",
  transport: "Transport",
  reports: "Reports & Certificates",
  settings: "Settings",
};
const placeholderViews = {
  admissions: [
    "Admissions",
    "Manage inquiries, entrance tests, and new student enrollment.",
  ],
  attendance: [
    "Attendance",
    "Record daily attendance and review absence patterns across classes.",
  ],
  academics: [
    "Academics",
    "Organize classes, subjects, exams, results, homework, and timetables.",
  ],
  staff: [
    "Teachers & Staff",
    "Manage profiles, leave, salary, attendance, and timetable allotment.",
  ],
  library: [
    "Library",
    "Track books, barcode issues, returns, fines, and student history.",
  ],
  transport: [
    "Transport",
    "Manage vehicles, routes, drivers, students, and transport fees.",
  ],
  reports: [
    "Reports & Certificates",
    "Generate fee challans, DMCs, bonafide, character, and board reports.",
  ],
  settings: [
    "Settings",
    "Configure branches, session years, permissions, OTP, backups, and audit logs.",
  ],
};

function showToast(message = "Your request was processed successfully.") {
  toast.querySelector("strong").textContent = "Action completed";
  toast.querySelector("small").textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function activateView(viewName) {
  const target = document.getElementById(`${viewName}View`);
  if (!target && placeholderViews[viewName]) {
    const [title, description] = placeholderViews[viewName];
    document
      .querySelectorAll(".generated-view")
      .forEach((view) => view.remove());
    const generated = document.createElement("section");
    generated.className = "view generated-view active-view";
    generated.id = `${viewName}View`;
    generated.innerHTML = `<div class="page-intro"><div><p class="eyebrow">Workspace / ${title}</p><h1>${title} <span class="status-pill">Module ready</span></h1><p class="subtext">${description}</p></div><div class="intro-actions"><button class="btn secondary" data-demo-action="Report export">⇩ Export report</button><button class="btn primary" data-demo-action="Create new record">＋ Add record</button></div></div><div class="panel module-placeholder"><div class="placeholder-icon">${viewName === "reports" ? "◫" : "▦"}</div><h2>${title} workspace</h2><p>This production-ready module is wired into the EduCore permission and navigation model. Connect the React API layer to load live PostgreSQL data here.</p><div class="placeholder-grid"><div><strong>Role permissions</strong><span>Super Admin · Principal · Staff</span></div><div><strong>Search & filters</strong><span>Ready for table records</span></div><div><strong>Audit trail</strong><span>Every action is logged</span></div></div></div>`;
    document.getElementById("appContent").appendChild(generated);
  }
  views.forEach((view) => view.classList.remove("active-view"));
  document
    .querySelectorAll(".generated-view")
    .forEach((view) => view.classList.remove("active-view"));
  document.getElementById(`${viewName}View`)?.classList.add("active-view");
  navItems.forEach((item) =>
    item.classList.toggle("active", item.dataset.view === viewName),
  );
  pageTitle.textContent = titles[viewName] || "Workspace";
  pageKicker.textContent =
    viewName === "overview" ? "Workspace" : "Workspace / Module";
  sidebar.classList.remove("open");
}

navItems.forEach((item) =>
  item.addEventListener("click", () => activateView(item.dataset.view)),
);
document
  .querySelectorAll("[data-view-link]")
  .forEach((link) =>
    link.addEventListener("click", () => activateView(link.dataset.viewLink)),
  );
menuButton.addEventListener("click", () => sidebar.classList.toggle("open"));
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "☾"
    : "☼";
  showToast("Theme preference saved");
});

let isUrdu = false;
languageToggle.addEventListener("click", () => {
  isUrdu = !isUrdu;
  document.querySelectorAll("[data-en]").forEach((element) => {
    element.textContent = isUrdu ? element.dataset.ur : element.dataset.en;
  });
  languageToggle.textContent = isUrdu ? "EN" : "اردو";
  showToast(isUrdu ? "Urdu navigation enabled" : "English navigation enabled");
});

document
  .getElementById("quickAdd")
  .addEventListener("click", () => quickModal.classList.add("open"));
document
  .getElementById("closeModal")
  .addEventListener("click", () => quickModal.classList.remove("open"));
quickModal.addEventListener("click", (event) => {
  if (event.target === quickModal) quickModal.classList.remove("open");
});
document.querySelectorAll("[data-toast]").forEach((button) =>
  button.addEventListener("click", () => {
    quickModal.classList.remove("open");
    showToast(button.dataset.toast);
  }),
);
document
  .querySelectorAll("[data-demo-action]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      showToast(`${button.dataset.demoAction} opened`),
    ),
  );
document
  .getElementById("exportButton")
  .addEventListener("click", () =>
    showToast("Dashboard report prepared for download"),
  );
document
  .getElementById("importButton")
  ?.addEventListener("click", () => showToast("Excel import dialog opened"));

document
  .querySelectorAll(".chart-controls button:not(.more-btn)")
  .forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".chart-controls button")
        .forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      showToast(`${button.textContent} collection view selected`);
    }),
  );

document.getElementById("globalSearch").addEventListener("input", (event) => {
  if (event.target.value.length > 2)
    showToast(`Searching EduCore for “${event.target.value}”`);
});

document.getElementById("roleSelector").addEventListener("change", (event) => {
  const role = event.target.value;
  document.querySelector(".profile strong").textContent =
    role === "Super Admin" ? "Ishaq Afridi" : "EduCore User";
  showToast(`${role} dashboard permissions loaded`);
});
