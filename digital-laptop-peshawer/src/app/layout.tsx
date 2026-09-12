import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FooterGate } from "@/components/footer-gate";
import { getSiteConfig } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "DIGITAL LAPTOP — Premium Laptops in Peshawar | DLS",
    template: "%s | DIGITAL LAPTOP Peshawar",
  },
  description:
    "DIGITAL LAPTOP (DLS) — Software Installation & Hardware Service. Premium new, like-new and imported laptops in Peshawar. Shop No 12A, Alharmian Market Near Gull Haji Plaza. Call Zeeshan: 0310-9516681. Cash on Delivery available.",
  keywords: [
    "DIGITAL LAPTOP",
    "DLS Peshawar",
    "laptops in Peshawar",
    "used laptops Peshawar",
    "MacBook Peshawar",
    "gaming laptop Peshawar",
    "Gul Haji Plaza",
    "Alharmian Market",
    "laptop software installation",
    "laptop hardware service",
  ],
  openGraph: {
    title: "DIGITAL LAPTOP — Premium Laptops in Peshawar",
    description:
      "Premium new & imported laptops, software installation and hardware service. Shop No 12A, Alharmian Market Near Gull Haji Plaza, Peshawar. Call 0310-9516681.",
    type: "website",
    locale: "en_PK",
    siteName: "DIGITAL LAPTOP",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#06070b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = await getSiteConfig();

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-[#06070b] font-sans text-zinc-100 antialiased`}
      >
        <CartProvider>
          <SiteHeader config={config} />
          <main className="min-h-screen">{children}</main>
          <FooterGate>
            <SiteFooter config={config} />
          </FooterGate>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ComputerStore",
                name: config.siteName,
                description: config.tagline,
                telephone: "+92-310-9516681",
                address: {
                  "@type": "PostalAddress",
                  streetAddress:
                    "Shop No 12A, Alharmian Market Near Gull Haji Plaza",
                  addressLocality: "Peshawar",
                  addressCountry: "PK",
                },
                priceRange: "PKR",
              }),
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
