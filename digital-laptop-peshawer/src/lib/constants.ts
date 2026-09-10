export const SHOP = {
  name: "DIGITAL LAPTOP",
  tagline: "Service (DLS) Software Installation & Hardware Service",
  address: "Shop No 12A, Alharmian Market Near Gull Haji Plaza, Peshawar",
  phoneOwner: "Zeeshan",
  phoneDisplay: "0310-9516681",
  phoneTel: "tel:+923109516681",
  whatsapp: "https://wa.me/923109516681",
  mapEmbed:
    "https://www.google.com/maps?q=Gul+Haji+Plaza+Peshawar&output=embed",
} as const;

export const DEVELOPER = {
  name: "IB Afridi",
  email: "ib.afridi.cs@gmail.com",
  github: "https://github.com/afridi017",
  githubDisplay: "github.com/afridi017",
} as const;

export const BRANDS = [
  "Apple",
  "Dell",
  "HP",
  "Lenovo",
  "ASUS",
  "MSI",
  "Acer",
] as const;

export const CONDITIONS = ["NEW", "LIKE_NEW", "EXCELLENT", "GOOD"] as const;

export const RAM_OPTIONS = ["8GB", "16GB", "24GB", "32GB", "64GB"] as const;

export const LOW_STOCK_THRESHOLD = 3;

export function buildWhatsAppOrderUrl(message: string): string {
  return `${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
}
