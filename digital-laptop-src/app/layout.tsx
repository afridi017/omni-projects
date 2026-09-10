import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DIGITAL LAPTOP Peshawar | Premium Laptops & Service",
    template: "%s | DIGITAL LAPTOP Peshawar",
  },
  description:
    "DIGITAL LAPTOP — Peshawar's premier laptop store. Software Installation & Hardware Service. Shop No 12A, Alharmian Market Near Gull Haji Plaza, Peshawar. Call: 0310-9516681",
  keywords: [
    "laptop store peshawar",
    "digital laptop",
    "laptop peshawar",
    "buy laptop peshawar",
    "laptop repair peshawar",
    "software installation peshawar",
    "refurbished laptops peshawar",
    "dell laptop peshawar",
    "hp laptop peshawar",
    "lenovo laptop peshawar",
  ],
  openGraph: {
    title: "DIGITAL LAPTOP Peshawar | Premium Laptops & Service",
    description: "Shop premium new & refurbished laptops in Peshawar. Expert software & hardware service.",
    type: "website",
    locale: "en_PK",
    siteName: "DIGITAL LAPTOP",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-white min-h-screen`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
