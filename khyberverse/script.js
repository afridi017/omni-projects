const navLinks = document.querySelectorAll(".nav-link[data-panel]");
const panels = document.querySelectorAll(".panel-view");
const panelTitle = document.getElementById("panelTitle");
const sidebar = document.getElementById("sidebar");
const cartBar = document.getElementById("cartBar");
const toast = document.getElementById("toast");
const aiModal = document.getElementById("aiModal");
const panelNames = {
  home: "Home",
  food: "Food delivery",
  mart: "Mart & grocery",
  rides: "Rides & parcels",
  market: "Marketplace",
  services: "Services",
  vendor: "Vendor panel",
  rider: "Rider panel",
  admin: "Admin & city reports",
  wallet: "Wallet",
  settings: "Settings",
};
const localBusinessSeed = Array.from({ length: 50 }, (_, index) => ({
  id: `KV-${String(index + 1).padStart(3, "0")}`,
  name: index === 0 ? "B'Best Cafe" : `Khyber local business ${index + 1}`,
  area:
    index % 3 === 0
      ? "Bara Bazaar"
      : index % 3 === 1
        ? "Jamrud Road"
        : "Peshawar",
  category: ["Food", "Mart", "Services", "Property", "Jobs"][index % 5],
  status: index % 8 === 0 ? "review" : "live",
}));
let cartTotal = 590;

function notify(message) {
  toast.querySelector("small").textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
}
function openPanel(name) {
  const target = document.getElementById(`${name}Panel`);
  if (!target) return;
  panels.forEach((panel) => panel.classList.remove("active"));
  target.classList.add("active");
  navLinks.forEach((link) =>
    link.classList.toggle("active", link.dataset.panel === name),
  );
  panelTitle.textContent = panelNames[name] || name;
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
navLinks.forEach((link) =>
  link.addEventListener("click", () => openPanel(link.dataset.panel)),
);
document
  .querySelectorAll("[data-open-panel]")
  .forEach((button) =>
    button.addEventListener("click", () => openPanel(button.dataset.openPanel)),
  );
document
  .getElementById("menuToggle")
  .addEventListener("click", () => sidebar.classList.toggle("open"));
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  notify(
    document.body.classList.contains("light")
      ? "Light theme enabled"
      : "Dark theme enabled",
  );
});
document
  .getElementById("langToggle")
  .addEventListener("click", () =>
    notify("Pashto and Urdu voice support is ready in AI Hujra"),
  );
document
  .getElementById("bellButton")
  .addEventListener("click", () =>
    notify("4 updates: 2 orders, 1 message, 1 rider alert"),
  );

document.querySelectorAll(".add-order").forEach((button) =>
  button.addEventListener("click", () => {
    cartBar.classList.add("visible");
    cartTotal += button.closest(".deal-card") ? 0 : 0;
    document.getElementById("cartTotal").textContent =
      `₨ ${cartTotal.toLocaleString()}`;
    notify("Item added to your order");
  }),
);
document
  .getElementById("cartBar")
  .querySelector("button")
  .addEventListener("click", () => notify("Cart checkout opened"));
document.querySelectorAll(".heart").forEach((button) =>
  button.addEventListener("click", () => {
    button.textContent = button.textContent === "♡" ? "♥" : "♡";
    button.style.color = button.textContent === "♥" ? "#f47d72" : "";
  }),
);
document
  .getElementById("bookRide")
  .addEventListener("click", () =>
    notify("Ride requested — finding a nearby rider"),
  );
document.querySelectorAll(".ride-tabs button").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".ride-tabs button")
      .forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    notify(`${button.textContent} booking selected`);
  }),
);
document.querySelectorAll(".category-strip button").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".category-strip button")
      .forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    notify(`${button.textContent} category selected`);
  }),
);

const universalSearch = document.getElementById("universalSearch");
universalSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && universalSearch.value.trim()) {
    notify(`Searching KhyberVerse for “${universalSearch.value.trim()}”`);
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    universalSearch.focus();
  }
});

function openAi() {
  aiModal.classList.add("open");
  document.getElementById("aiInput").focus();
}
document.getElementById("askAi").addEventListener("click", openAi);
document.getElementById("voiceAi").addEventListener("click", openAi);
document.getElementById("voiceButton").addEventListener("click", openAi);
document
  .getElementById("closeAi")
  .addEventListener("click", () => aiModal.classList.remove("open"));
aiModal.addEventListener("click", (event) => {
  if (event.target === aiModal) aiModal.classList.remove("open");
});
document.querySelectorAll(".suggestion-pills button").forEach((button) =>
  button.addEventListener("click", () => {
    document.getElementById("aiInput").value = button.dataset.question;
    answerAi(button.dataset.question);
  }),
);
document
  .getElementById("sendAi")
  .addEventListener("click", () =>
    answerAi(document.getElementById("aiInput").value),
  );
document.getElementById("aiInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") answerAi(event.target.value);
});
function answerAi(question) {
  if (!question.trim()) return;
  const response = document.getElementById("aiResponse");
  response.textContent = "AI Hujra is comparing local listings...";
  setTimeout(() => {
    response.textContent = question.toLowerCase().includes("zinger")
      ? "Bara mein sab se sasta Zinger B'Best Cafe ka ₨ 320 wala Classic Zinger hai. Delivery estimate: 25–35 minutes."
      : "Theek de, I am checking verified providers around Bara. A nearby option will appear shortly.";
  }, 650);
}

document
  .getElementById("menuOcr")
  .addEventListener("click", () =>
    notify("Menu OCR scanner opened — upload a menu photo to digitize it"),
  );
